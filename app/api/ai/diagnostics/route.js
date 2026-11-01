import { query } from "@/lib/db";
import { getOrSetCache } from "@/lib/redis";
import { diagnoseFinancialHealth } from "@/lib/ai";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    const userId = user.id;

    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    const cacheKey = `spendpace:diagnostics:${userId}`;
    if (forceRefresh) {
      await invalidateCache(cacheKey);
    }

    const computeReport = async () => {
      // 1. Fetch user profile, liabilities, goals, and recent 30-day transactions
      const [userRes, liabRes, goalsRes, txRes, accRes] = await Promise.all([
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
        query(`SELECT COALESCE(SUM(balance), 0)::float as "totalWallet" FROM "Account" WHERE "userId" = $1 AND balance > 0`, [userId]),
      ]);

      const user = userRes.rows[0] || {};
      const liabilities = liabRes.rows || [];
      const goals = goalsRes.rows || [];
      const transactions = txRes.rows || [];
      const totalWallet = accRes.rows[0]?.totalWallet || 0;

      const monthlyIncome = parseFloat(user.monthlyIncome) || 0;
      const partTimeIncome = parseFloat(user.partTimeIncome) || 0;
      const spouseIncome = parseFloat(user.spouseIncome) || 0;
      const otherIncome = parseFloat(user.otherIncome) || 0;
      const totalHouseholdInflow = monthlyIncome + partTimeIncome + spouseIncome + otherIncome;

      const totalDebt = liabilities.reduce((sum, l) => sum + (parseFloat(l.monthlyPayment) || 0), 0);
      const committedBills = totalDebt;
      const totalDiscretionary = totalHouseholdInflow > 0 
        ? Math.max(0, totalHouseholdInflow - committedBills)
        : Math.max(0, totalWallet - totalDebt);
      const safeDaily = Math.max(50, Math.round(totalDiscretionary / 30));

      const metrics = {
        monthlyIncome,
        partTimeIncome,
        totalHouseholdInflow,
        totalDiscretionary,
        safeDaily,
        totalWallet,
        totalSpent: transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
      };

      return await diagnoseFinancialHealth({ user, transactions, metrics, liabilities, goals });
    };

    const report = forceRefresh 
      ? await computeReport() 
      : await getOrSetCache(cacheKey, computeReport, 300);

    return NextResponse.json({
      ...report,
      agentName: "Finance Agent",
      poweredBy: "Groq LPU (openai/gpt-oss-120b)",
      analyzedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Diagnostics API route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
