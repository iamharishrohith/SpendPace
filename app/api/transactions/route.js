import { query } from "@/lib/db";
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
    const { amount, description, categoryName, accountName, type = "EXPENSE", source = "MANUAL" } = body;
    const VALID_SOURCES = ["MANUAL", "UPI_SCREENSHOT_OCR", "RECEIPT_OCR", "RECURRING_AUTO", "GESTURE_PULSE"];
    const cleanSource = VALID_SOURCES.includes(source) ? source : "MANUAL";

    // Find category ID or default to first category, with auto-create fallback
    let categoryId = null;
    let catRes = await query(`SELECT id FROM "Category" WHERE ("userId" = $1 OR "userId" IS NULL) AND LOWER(name) = LOWER($2) LIMIT 1`, [userId, categoryName || "Dining & Food"]);
    if (!catRes.rows.length) {
      catRes = await query(`SELECT id FROM "Category" WHERE "userId" = $1 OR "userId" IS NULL LIMIT 1`, [userId]);
    }
    if (catRes.rows.length > 0) {
      categoryId = catRes.rows[0].id;
    } else {
      const newCat = await query(`
        INSERT INTO "Category" (id, "userId", name, icon, "colorHex", "isDiscretionary")
        VALUES (gen_random_uuid(), $1, 'General', 'Tag', '#10B981', true)
        RETURNING id
      `, [userId]);
      categoryId = newCat.rows[0].id;
    }

    // Find account ID with auto-create fallback
    let accountId = null;
    let accRes = await query(`SELECT id FROM "Account" WHERE "userId" = $1 AND name ILIKE $2 LIMIT 1`, [userId, `%${accountName || 'Salary'}%`]);
    if (!accRes.rows.length) {
      accRes = await query(`SELECT id FROM "Account" WHERE "userId" = $1 LIMIT 1`, [userId]);
    }
    if (accRes.rows.length > 0) {
      accountId = accRes.rows[0].id;
    } else {
      const newAcc = await query(`
        INSERT INTO "Account" (id, "userId", name, "accountType", balance, "isDefault", "createdAt")
        VALUES (gen_random_uuid(), $1, 'Cash Wallet', 'SAVINGS_BANK', 0, true, NOW())
        RETURNING id
      `, [userId]);
      accountId = newAcc.rows[0].id;
    }

    // Insert real transaction into database
    const newTx = await query(`
      INSERT INTO "Transaction" (id, "userId", "accountId", "categoryId", amount, type, description, "transactionDate", source)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), $7)
      RETURNING id, description as name, amount::float, type, "transactionDate", source
    `, [userId, accountId, categoryId, parseFloat(amount), type, description || "Expense", cleanSource]);

    // Update account balance
    if (type === "EXPENSE") {
      await query(`UPDATE "Account" SET balance = balance - $1 WHERE id = $2`, [parseFloat(amount), accountId]);
    } else {
      await query(`UPDATE "Account" SET balance = balance + $1 WHERE id = $2`, [parseFloat(amount), accountId]);
    }

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await invalidateCache(`spendpace:dashboard:${userId}`, `spendpace:patterns:${userId}:${currentMonthKey}`);

    return NextResponse.json({ success: true, transaction: newTx.rows[0] });
  } catch (error) {
    console.error("Transaction POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}