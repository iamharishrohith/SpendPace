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

    // Find category ID or default to first category
    let catRes = await query(`SELECT id FROM "Category" WHERE "userId" = $1 AND LOWER(name) = LOWER($2) LIMIT 1`, [userId, categoryName || "Dining & Food"]);
    if (!catRes.rows.length) {
      catRes = await query(`SELECT id FROM "Category" WHERE "userId" = $1 LIMIT 1`, [userId]);
    }
    const categoryId = catRes.rows[0]?.id;

    // Find account ID
    let accRes = await query(`SELECT id FROM "Account" WHERE "userId" = $1 AND name ILIKE $2 LIMIT 1`, [userId, `%${accountName || 'Salary'}%`]);
    if (!accRes.rows.length) {
      accRes = await query(`SELECT id FROM "Account" WHERE "userId" = $1 LIMIT 1`, [userId]);
    }
    const accountId = accRes.rows[0]?.id;

    // Insert real transaction into database
    const newTx = await query(`
      INSERT INTO "Transaction" (id, "userId", "accountId", "categoryId", amount, type, description, "transactionDate", source)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), $7)
      RETURNING id, description as name, amount::float, type, "transactionDate", source
    `, [userId, accountId, categoryId, parseFloat(amount), type, description || "Expense", source]);

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