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
      // 1. Resolve Category ID and Name
      let categoryId = null;
      let categoryNameFound = categoryName || "Dining & Food";
      let catRes = await client.query(`
        SELECT id, name FROM "Category" 
        WHERE ("userId" = $1 OR "userId" IS NULL) AND LOWER(name) = LOWER($2) 
        LIMIT 1
      `, [userId, categoryName || "Dining & Food"]);
      
      if (!catRes.rows.length) {
        catRes = await client.query(`SELECT id, name FROM "Category" WHERE "userId" = $1 OR "userId" IS NULL LIMIT 1`, [userId]);
      }
      if (catRes.rows.length > 0) {
        categoryId = catRes.rows[0].id;
        categoryNameFound = catRes.rows[0].name;
      } else {
        const newCat = await client.query(`
          INSERT INTO "Category" (id, "userId", name, icon, "colorHex", "isDiscretionary")
          VALUES (gen_random_uuid(), $1, 'General', 'Tag', '#10B981', true)
          RETURNING id, name
        `, [userId]);
        categoryId = newCat.rows[0].id;
        categoryNameFound = newCat.rows[0].name;
      }

      // 2. Resolve Account ID, Name, and current balance
      let accountId = null;
      let accountNameFound = "Salary Account";
      let balanceBefore = 0;
      let accRes = await client.query(`
        SELECT id, name, balance::float FROM "Account" 
        WHERE "userId" = $1 AND name ILIKE $2 
        LIMIT 1
      `, [userId, `%${accountName || 'Salary'}%`]);
      
      if (!accRes.rows.length) {
        accRes = await client.query(`
          SELECT id, name, balance::float FROM "Account" 
          WHERE "userId" = $1 AND "isDefault" = true 
          LIMIT 1
        `, [userId]);
      }
      if (!accRes.rows.length) {
        accRes = await client.query(`SELECT id, name, balance::float FROM "Account" WHERE "userId" = $1 LIMIT 1`, [userId]);
      }
      if (accRes.rows.length > 0) {
        accountId = accRes.rows[0].id;
        accountNameFound = accRes.rows[0].name;
        balanceBefore = parseFloat(accRes.rows[0].balance) || 0;
      } else {
        const newAcc = await client.query(`
          INSERT INTO "Account" (id, "userId", name, "accountType", balance, "isDefault", "createdAt")
          VALUES (gen_random_uuid(), $1, 'Cash Wallet', 'SAVINGS_BANK', 0, true, NOW())
          RETURNING id, name, balance::float
        `, [userId]);
        accountId = newAcc.rows[0].id;
        accountNameFound = newAcc.rows[0].name;
        balanceBefore = parseFloat(newAcc.rows[0].balance) || 0;
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

      // 4. Update account balance atomically and capture new balance
      let balanceAfter = balanceBefore;
      if (type === "EXPENSE") {
        const accUp = await client.query(`UPDATE "Account" SET balance = balance - $1 WHERE id = $2 RETURNING balance::float`, [cleanAmount, accountId]);
        balanceAfter = parseFloat(accUp.rows[0]?.balance) ?? (balanceBefore - cleanAmount);
      } else {
        const accUp = await client.query(`UPDATE "Account" SET balance = balance + $1 WHERE id = $2 RETURNING balance::float`, [cleanAmount, accountId]);
        balanceAfter = parseFloat(accUp.rows[0]?.balance) ?? (balanceBefore + cleanAmount);
      }

      // 5. Query user financial velocity context for ultra-detailed audit logging
      let newTodaySpent = 0;
      let newMonthSpent = 0;
      let safeDailyVelocity = 0;
      let safeDailyRemaining = 0;
      let burnRatePercent = 0;
      let daysRemaining = 1;

      try {
        const todayRes = await client.query(`
          SELECT COALESCE(SUM(amount), 0)::float as "todaySpent" 
          FROM "Transaction" 
          WHERE "userId" = $1 AND type = 'EXPENSE' 
            AND DATE("transactionDate" + INTERVAL '5 hours 30 minutes') = DATE(NOW() + INTERVAL '5 hours 30 minutes')
        `, [userId]);
        newTodaySpent = parseFloat(todayRes.rows[0]?.todaySpent) || 0;

        const monthRes = await client.query(`
          SELECT COALESCE(SUM(amount), 0)::float as "monthSpent" 
          FROM "Transaction" 
          WHERE "userId" = $1 AND type = 'EXPENSE'
        `, [userId]);
        newMonthSpent = parseFloat(monthRes.rows[0]?.monthSpent) || 0;

        const uRes = await client.query(`
          SELECT "monthlyIncome"::float, "spouseIncome"::float, "partTimeIncome"::float, "otherIncome"::float, "payCycleDay"
          FROM "User" WHERE id = $1
        `, [userId]);
        const u = uRes.rows[0] || {};
        const totalInflow = (u.monthlyIncome || 0) + (u.spouseIncome || 0) + (u.partTimeIncome || 0) + (u.otherIncome || 0);

        const lRes = await client.query(`SELECT COALESCE(SUM("monthlyPayment"), 0)::float as emi FROM "Liability" WHERE "userId" = $1`, [userId]);
        const totalBills = parseFloat(lRes.rows[0]?.emi) || 0;

        const now = new Date();
        const currentDay = now.getDate();
        const payCycleDay = parseInt(u.payCycleDay, 10) || 1;
        if (currentDay < payCycleDay) {
          daysRemaining = payCycleDay - currentDay;
        } else {
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          daysRemaining = Math.max(1, (daysInMonth - currentDay) + payCycleDay);
        }

        const discretionaryPool = Math.max(0, totalInflow - totalBills - Math.round(totalInflow * 0.10));
        const remainingDiscretionary = Math.max(0, discretionaryPool - newMonthSpent);
        safeDailyVelocity = daysRemaining > 0 ? Math.round(remainingDiscretionary / daysRemaining) : remainingDiscretionary;
        if (safeDailyVelocity <= 0 && balanceAfter > 0) {
          safeDailyVelocity = Math.round(balanceAfter / daysRemaining);
        }
        safeDailyRemaining = Math.max(0, safeDailyVelocity - newTodaySpent);
        burnRatePercent = safeDailyVelocity > 0 ? Math.min(100, Math.round((newTodaySpent / safeDailyVelocity) * 100)) : 0;
      } catch (calcErr) {
        console.warn("Velocity metrics calculation note:", calcErr.message);
      }

      // 6. Comprehensive Audit Log record with rich financial telemetry
      const auditDetails = {
        transactionId: newTx.rows[0].id,
        action: `TRANSACTION_${type}`,
        description: description || (type === "EXPENSE" ? "Expense" : "Income"),
        amount: cleanAmount,
        type,
        source: cleanSource,
        idempotencyKey: idempotencyKey ? idempotencyKey.trim() : null,
        category: categoryNameFound,
        categoryId,
        accountName: accountNameFound,
        accountId,
        walletBalanceBefore: balanceBefore,
        walletBalanceAfter: balanceAfter,
        walletDelta: type === "EXPENSE" ? -cleanAmount : cleanAmount,
        todaySpentBefore: Math.max(0, newTodaySpent - (type === "EXPENSE" ? cleanAmount : 0)),
        todaySpentAfter: newTodaySpent,
        todaySpentDelta: type === "EXPENSE" ? cleanAmount : 0,
        monthSpent: newMonthSpent,
        safeDailyVelocity,
        safeDailyRemaining,
        burnRatePercent,
        daysRemainingInCycle: daysRemaining,
        syncStatus: "CONFIRMED_POSTGRES_LIVE",
        timestampIST: new Date(Date.now() + 19800000).toISOString().replace("T", " ").replace("Z", " IST"),
        timestampUTC: new Date().toISOString()
      };

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
          JSON.stringify(auditDetails)
        ]);
      } catch (logErr) {
        console.warn("Audit log insert warning:", logErr.message);
      }

      return {
        ...newTx.rows[0],
        auditSummary: auditDetails
      };
    });

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await invalidateCache(`spendpace:dashboard:${userId}`, `spendpace:patterns:${userId}:${currentMonthKey}`);

    return NextResponse.json({ 
      success: true, 
      transaction: txResult,
      auditSummary: txResult.auditSummary 
    });
  } catch (error) {
    console.error("Transaction POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}