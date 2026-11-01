import { query, withTransaction } from "@/lib/db";
import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/redis";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    const userId = user.id;

    const res = await query(`
      SELECT 
        t.id, 
        t.description as name, 
        t.amount::float, 
        t.type, 
        t."transactionDate", 
        t.source, 
        t."idempotencyKey",
        c.name as category, 
        c."colorHex",
        c.icon as "categoryIcon",
        a.name as "accountName"
      FROM "Transaction" t
      LEFT JOIN "Category" c ON t."categoryId" = c.id
      LEFT JOIN "Account" a ON t."accountId" = a.id
      WHERE t."userId" = $1
      ORDER BY t."transactionDate" DESC
      LIMIT 50
    `, [userId]);

    return NextResponse.json({ transactions: res.rows });
  } catch (error) {
    console.error("Transactions GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    const userId = user.id;

    const body = await req.json();
    const { 
      amount, 
      description, 
      categoryName, 
      accountName, 
      type = "EXPENSE", 
      source = "MANUAL",
      idempotencyKey = null
    } = body;

    const VALID_SOURCES = ["MANUAL", "UPI_SCREENSHOT_OCR", "RECEIPT_OCR", "RECURRING_AUTO", "GESTURE_PULSE"];
    const cleanSource = VALID_SOURCES.includes(source) ? source : "MANUAL";
    const cleanAmount = parseFloat(amount) || 0;

    if (cleanAmount <= 0) {
      return NextResponse.json({ error: "Transaction amount must be greater than 0" }, { status: 400 });
    }

    // Check Idempotency Key to prevent double-tap duplicate charges
    if (idempotencyKey && typeof idempotencyKey === "string" && idempotencyKey.trim().length > 0) {
      const cleanKey = idempotencyKey.trim();
      const existing = await query(`
        SELECT 
          t.id, 
          t.description as name, 
          t.amount::float, 
          t.type, 
          t."transactionDate", 
          t.source,
          t."idempotencyKey"
        FROM "Transaction" t
        WHERE t."userId" = $1 AND t."idempotencyKey" = $2
        LIMIT 1
      `, [userId, cleanKey]);

      if (existing.rows.length > 0) {
        return NextResponse.json({ 
          success: true, 
          transaction: existing.rows[0], 
          deduplicated: true 
        });
      }
    }

    // Atomic DB Transaction: Category check, Account check, Insert Tx, Balance update, Audit log
    const txResult = await withTransaction(async (client) => {
      // 1. Resolve Category ID
      let categoryId = null;
      let catRes = await client.query(`
        SELECT id FROM "Category" 
        WHERE ("userId" = $1 OR "userId" IS NULL) AND LOWER(name) = LOWER($2) 
        LIMIT 1
      `, [userId, categoryName || "Dining & Food"]);
      
      if (!catRes.rows.length) {
        catRes = await client.query(`SELECT id FROM "Category" WHERE "userId" = $1 OR "userId" IS NULL LIMIT 1`, [userId]);
      }
      if (catRes.rows.length > 0) {
        categoryId = catRes.rows[0].id;
      } else {
        const newCat = await client.query(`
          INSERT INTO "Category" (id, "userId", name, icon, "colorHex", "isDiscretionary")
          VALUES (gen_random_uuid(), $1, 'General', 'Tag', '#10B981', true)
          RETURNING id
        `, [userId]);
        categoryId = newCat.rows[0].id;
      }

      // 2. Resolve Account ID
      let accountId = null;
      let accRes = await client.query(`
        SELECT id FROM "Account" 
        WHERE "userId" = $1 AND name ILIKE $2 
        LIMIT 1
      `, [userId, `%${accountName || 'Salary'}%`]);
      
      if (!accRes.rows.length) {
        accRes = await client.query(`
          SELECT id FROM "Account" 
          WHERE "userId" = $1 AND "isDefault" = true 
          LIMIT 1
        `, [userId]);
      }
      if (!accRes.rows.length) {
        accRes = await client.query(`SELECT id FROM "Account" WHERE "userId" = $1 LIMIT 1`, [userId]);
      }
      if (accRes.rows.length > 0) {
        accountId = accRes.rows[0].id;
      } else {
        const newAcc = await client.query(`
          INSERT INTO "Account" (id, "userId", name, "accountType", balance, "isDefault", "createdAt")
          VALUES (gen_random_uuid(), $1, 'Cash Wallet', 'SAVINGS_BANK', 0, true, NOW())
          RETURNING id
        `, [userId]);
        accountId = newAcc.rows[0].id;
      }

      // 3. Insert real transaction
      const newTx = await client.query(`
        INSERT INTO "Transaction" (
          id, "userId", "accountId", "categoryId", amount, type, description, "transactionDate", source, "idempotencyKey"
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), $7, $8)
        RETURNING id, description as name, amount::float, type, "transactionDate", source, "idempotencyKey"
      `, [
        userId, 
        accountId, 
        categoryId, 
        cleanAmount, 
        type, 
        description || (type === "EXPENSE" ? "Expense" : "Income"), 
        cleanSource,
        idempotencyKey ? idempotencyKey.trim() : null
      ]);

      // 4. Update account balance atomically
      if (type === "EXPENSE") {
        await client.query(`UPDATE "Account" SET balance = balance - $1 WHERE id = $2`, [cleanAmount, accountId]);
      } else {
        await client.query(`UPDATE "Account" SET balance = balance + $1 WHERE id = $2`, [cleanAmount, accountId]);
      }

      // 5. Audit Log record
      try {
        const ip = req.headers?.get?.("x-forwarded-for") || req.headers?.["x-forwarded-for"] || "127.0.0.1";
        const ua = req.headers?.get?.("user-agent") || req.headers?.["user-agent"] || "SpendPaceClient";
        await client.query(`
          INSERT INTO "AuditLog" (id, "userId", action, "ipAddress", "userAgent", metadata, timestamp)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
        `, [
          userId, 
          `TRANSACTION_${type}`, 
          typeof ip === "string" ? ip.split(",")[0].trim() : "127.0.0.1", 
          typeof ua === "string" ? ua.substring(0, 255) : "App",
          JSON.stringify({ 
            amount: cleanAmount, 
            description: description || "Expense", 
            source: cleanSource,
            idempotencyKey: idempotencyKey || null 
          })
        ]);
      } catch (logErr) {
        // Non-blocking for audit log failures
      }

      return newTx.rows[0];
    });

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await invalidateCache(`spendpace:dashboard:${userId}`, `spendpace:patterns:${userId}:${currentMonthKey}`);

    return NextResponse.json({ success: true, transaction: txResult });
  } catch (error) {
    console.error("Transaction POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}