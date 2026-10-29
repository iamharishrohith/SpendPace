import { query } from "@/lib/db";
import { getOrSetCache } from "@/lib/redis";
import { diagnoseFinancialHealth } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    let userId = null;
    const cookie = req.cookies.get("spendpace_session")?.value;
    if (cookie) {
      try {
        const session = JSON.parse(cookie);
        userId = session.userId;
      } catch (e) {}
    }

    if (!userId) {
      const firstUser = await query(`SELECT id FROM "User" ORDER BY "createdAt" DESC LIMIT 1`);
      if (firstUser.rows.length > 0) userId = firstUser.rows[0].id;
      else return NextResponse.json({ error: "User unauthorized" }, { status: 401 });
    }

    const cacheKey = `spendpace:diagnostics:${userId}`;

    const report = await getOrSetCache(cacheKey, async () => {
      // 1. Fetch user profile, liabilities, goals, and recent 30-day transactions
      const [userRes, liabRes, goalsRes, txRes] = await Promise.all([
        query(`
          SELECT id, "fullName", "monthlyIncome"::float, "spouseIncome"::float, 
                 "otherIncome"::float, COALESCE("partTimeIncome", 0)::float as "partTimeIncome",
                 "baseCurrency", "payCycleDay", "maritalStatus", "dependentsCount"
          FROM "User" WHERE id = $1
        `, [userId]),
        query(`SELECT name, category, "monthlyPayment"::float, "totalOutstanding"::float FROM "Liability" WHERE "userId" = $1`, [userId]),
        query(`SELECT title, category, "targetAmount"::float, "currentAmount"::float, "targetDate" FROM "Goal" WHERE "userId" = $1`, [userId]),
        query(`
          SELECT tx.description, tx.amount::float, tx.type, tx."transactionDate", c.name as category
          FROM "Transaction" tx
          LEFT JOIN "Category" c ON tx."categoryId" = c.id
          WHERE tx."userId" = $1
          ORDER BY tx."transactionDate" DESC
          LIMIT 35
        `, [userId]),
      ]);

      const user = userRes.rows[0] || {};
      const liabilities = liabRes.rows || [];
      const goals = goalsRes.rows || [];
      const transactions = txRes.rows || [];

      const monthlyIncome = parseFloat(user.monthlyIncome) || 0;
      const partTimeIncome = parseFloat(user.partTimeIncome) || 0;
      const spouseIncome = parseFloat(user.spouseIncome) || 0;
      const otherIncome = parseFloat(user.otherIncome) || 0;
      const totalHouseholdInflow = monthlyIncome + partTimeIncome + spouseIncome + otherIncome;

      const totalDebt = liabilities.reduce((sum, l) => sum + (parseFloat(l.monthlyPayment) || 0), 0);
      const dependents = parseInt(user.dependentsCount, 10) || 0;
      const baselineLivingCost = user.maritalStatus === "SINGLE" ? 22000 : 32000 + (dependents * 7500);
      const committedBills = totalDebt + baselineLivingCost;
      const totalDiscretionary = Math.max(0, totalHouseholdInflow - committedBills);
      const safeDaily = Math.round(totalDiscretionary / 30);

      const metrics = {
        monthlyIncome,
        partTimeIncome,
        totalHouseholdInflow,
        totalDiscretionary,
        safeDaily,
        totalSpent: transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
      };

      return await diagnoseFinancialHealth({ user, transactions, metrics, liabilities, goals });
    }, 300); // 5 min cache

    return NextResponse.json(report);
  } catch (err) {
    console.error("Diagnostics API route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
