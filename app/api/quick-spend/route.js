import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/redis";

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, tagName = "Chai / Tea Time", categoryName = "Dining & Food", notes } = body;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid amount." }, { status: 400 });
    }

    // 1. Resolve User
    let userId = null;
    const cookie = req.cookies.get("spendpace_session")?.value;
    if (cookie) {
      try {
        const session = JSON.parse(cookie);
        userId = session.userId;
      } catch (e) {}
    }

    if (!userId) {
      const firstUser = await query(`SELECT id FROM "User" LIMIT 1`);
      if (firstUser.rows.length > 0) userId = firstUser.rows[0].id;
      else return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Find or create matching Category
    let categoryRes = await query(`
      SELECT id FROM "Category" 
      WHERE "userId" = $1 AND LOWER(name) LIKE LOWER($2) 
      LIMIT 1
    `, [userId, `%${categoryName.split(" ")[0]}%`]);

    let categoryId = categoryRes.rows[0]?.id;
    if (!categoryId) {
      const newCat = await query(`
        INSERT INTO "Category" (id, "userId", name, icon, "colorHex", "isDiscretionary")
        VALUES (gen_random_uuid(), $1, $2, 'Coffee', '#F59E0B', true)
        RETURNING id
      `, [userId, categoryName]);
      categoryId = newCat.rows[0].id;
    }

    // 3. Find primary user account
    let accountRes = await query(`
      SELECT id FROM "Account" 
      WHERE "userId" = $1 AND "isDefault" = true 
      LIMIT 1
    `, [userId]);

    let accountId = accountRes.rows[0]?.id;
    if (!accountId) {
      const fallbackAcc = await query(`SELECT id FROM "Account" WHERE "userId" = $1 LIMIT 1`, [userId]);
      accountId = fallbackAcc.rows[0]?.id;
    }

    if (!accountId) {
      const newAcc = await query(`
        INSERT INTO "Account" (id, "userId", name, "accountType", balance, "isDefault", "createdAt")
        VALUES (gen_random_uuid(), $1, 'Cash Wallet', 'UPI_WALLET', 5000.00, true, NOW())
        RETURNING id
      `, [userId]);
      accountId = newAcc.rows[0].id;
    }

    // 4. Insert Transaction
    const txRes = await query(`
      INSERT INTO "Transaction" (
        id, "userId", "accountId", "categoryId", amount, type, description, 
        "transactionDate", source, "isRecurring"
      )
      VALUES (
        gen_random_uuid(), $1, $2, $3, $4, 'EXPENSE', $5, 
        NOW(), 'MANUAL', false
      )
      RETURNING id, amount::float, description, "transactionDate"
    `, [userId, accountId, categoryId, numAmount, description]);

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await invalidateCache(`spendpace:dashboard:${userId}`, `spendpace:patterns:${userId}:${currentMonthKey}`);

    return NextResponse.json({
      success: true,
      transaction: txRes.rows[0],
      message: `Logged ₹${numAmount} for ${tagName}`,
    });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Quick Spend API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
