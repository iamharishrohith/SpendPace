import { query } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req) {
  try {
    const userAuth = await getAuthenticatedUser(req);
    if (!userAuth) {
      return unauthorizedResponse();
    }
    const userId = userAuth.id;

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const currentMonthKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    const monthYear = searchParams.get("monthYear") || currentMonthKey;

    const [year, month] = monthYear.split("-").map((v) => parseInt(v, 10));
    const startOfMonth = new Date(year, month - 1, 1).toISOString();
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

    const [userRes, txRes, liabRes, goalRes] = await Promise.all([
      query('SELECT "fullName", email, "monthlyIncome"::float, "spouseIncome"::float, "partTimeIncome"::float, "otherIncome"::float, "baseCurrency" FROM "User" WHERE id = $1', [userId]),
      query('SELECT tx.description, tx.amount::float, tx.type, tx."transactionDate", c.name as category FROM "Transaction" tx LEFT JOIN "Category" c ON tx."categoryId" = c.id WHERE tx."userId" = $1 AND tx."transactionDate" >= $2 AND tx."transactionDate" <= $3 ORDER BY tx."transactionDate" DESC', [userId, startOfMonth, endOfMonth]),
      query('SELECT name, "monthlyPayment"::float FROM "Liability" WHERE "userId" = $1', [userId]),
      query('SELECT title, "targetAmount"::float, "currentAmount"::float FROM "Goal" WHERE "userId" = $1', [userId]),
    ]);

    const user = userRes.rows[0] || {};
    const transactions = txRes.rows || [];
    const liabilities = liabRes.rows || [];
    const goals = goalRes.rows || [];

    const currency = user.baseCurrency || "INR";
    const totalInflow = (user.monthlyIncome || 0) + (user.spouseIncome || 0) + (user.partTimeIncome || 0) + (user.otherIncome || 0);
    const totalDebt = liabilities.reduce((s, l) => s + l.monthlyPayment, 0);
    const totalSpent = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
    const netSavings = Math.max(0, totalInflow - totalDebt - 22000 - totalSpent);

    const categoryBreakdown = {};
    transactions.filter(t => t.type === "EXPENSE").forEach(t => {
      const cat = t.category || "General";
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + t.amount;
    });

    return NextResponse.json({
      reportMonth: monthYear,
      generatedAt: new Date().toISOString(),
      user: {
        name: user.fullName || "SpendPace User",
        email: user.email,
        currency,
      },
      summary: {
        totalInflow,
        totalDebt,
        baselineLiving: 22000,
        totalSpent,
        netSavings,
        savingsRate: totalInflow > 0 ? Math.round((netSavings / totalInflow) * 100) : 0,
      },
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, amount]) => ({
        category,
        amount,
        percent: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      })),
      transactions: transactions.slice(0, 50),
      goals,
      liabilities,
    });
  } catch (error) {
    console.error("Monthly PDF report error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
