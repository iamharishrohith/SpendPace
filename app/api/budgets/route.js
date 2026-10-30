import { query } from "@/lib/db";
import { invalidateCache } from "@/lib/redis";
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
    const now = new Date();
    const currentMonthKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    const monthYear = searchParams.get("monthYear") || currentMonthKey;

    const catRes = await query(
      'SELECT id, name, icon, "colorHex", "isDiscretionary" FROM "Category" WHERE "userId" = $1 OR "userId" IS NULL ORDER BY "isDiscretionary" ASC, name ASC',
      [userId]
    );

    const budgetRes = await query(
      'SELECT id, "categoryId", "allocatedAmount"::float, "alertThreshold"::float FROM "Budget" WHERE "userId" = $1 AND "monthYear" = $2',
      [userId, monthYear]
    );

    const budgetMap = {};
    budgetRes.rows.forEach((b) => {
      budgetMap[b.categoryId] = b;
    });

    const [year, month] = monthYear.split("-").map((v) => parseInt(v, 10));
    const startOfMonth = new Date(year, month - 1, 1).toISOString();
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

    const spendRes = await query(
      'SELECT "categoryId", COALESCE(SUM(amount), 0)::float as "totalSpent" FROM "Transaction" WHERE "userId" = $1 AND type = \'EXPENSE\' AND "transactionDate" >= $2 AND "transactionDate" <= $3 GROUP BY "categoryId"',
      [userId, startOfMonth, endOfMonth]
    );

    const spendMap = {};
    spendRes.rows.forEach((s) => {
      spendMap[s.categoryId] = s.totalSpent;
    });

    const budgets = catRes.rows.map((cat) => {
      const budgetEntry = budgetMap[cat.id];
      const allocatedAmount = budgetEntry ? parseFloat(budgetEntry.allocatedAmount) : (cat.isDiscretionary ? 8000 : 15000);
      const spentAmount = spendMap[cat.id] || 0;
      const remainingAmount = Math.max(0, allocatedAmount - spentAmount);
      const usagePercent = allocatedAmount > 0 ? Math.round((spentAmount / allocatedAmount) * 100) : 0;
      const alertThreshold = budgetEntry ? parseFloat(budgetEntry.alertThreshold) : 0.8;
      const isOverBudget = spentAmount > allocatedAmount;

      let status = "SAFE";
      if (isOverBudget) status = "EXCEEDED";
      else if (usagePercent >= alertThreshold * 100) status = "WARNING";

      return {
        budgetId: budgetEntry ? budgetEntry.id : null,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        colorHex: cat.colorHex,
        isDiscretionary: cat.isDiscretionary,
        allocatedAmount,
        spentAmount,
        remainingAmount,
        usagePercent,
        alertThreshold,
        isOverBudget,
        status,
        isCustomSet: Boolean(budgetEntry),
      };
    });

    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
    const totalRemaining = Math.max(0, totalAllocated - totalSpent);
    const overallUsagePercent = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

    return NextResponse.json({
      monthYear,
      budgets,
      totalAllocated,
      totalSpent,
      totalRemaining,
      overallUsagePercent,
    });
  } catch (error) {
    console.error("Budgets GET error:", error);
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
    const { categoryId, allocatedAmount, monthYear, alertThreshold = 0.8 } = body;

    if (!categoryId || allocatedAmount === undefined) {
      return NextResponse.json({ error: "categoryId and allocatedAmount are required" }, { status: 400 });
    }

    const parsedAllocated = Math.max(0, parseFloat(allocatedAmount) || 0);
    const parsedThreshold = Math.min(1, Math.max(0.1, parseFloat(alertThreshold) || 0.8));
    const now = new Date();
    const targetMonth = monthYear || (now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0"));

    const upsertRes = await query(
      'INSERT INTO "Budget" (id, "userId", "categoryId", "monthYear", "allocatedAmount", "alertThreshold") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) ON CONFLICT ("userId", "categoryId", "monthYear") DO UPDATE SET "allocatedAmount" = EXCLUDED."allocatedAmount", "alertThreshold" = EXCLUDED."alertThreshold" RETURNING id, "categoryId", "monthYear", "allocatedAmount"::float, "alertThreshold"::float',
      [userId, categoryId, targetMonth, parsedAllocated, parsedThreshold]
    );

    await invalidateCache("spendpace:dashboard:" + userId);
    await invalidateCache("spendpace:patterns:" + userId + ":" + targetMonth);

    return NextResponse.json({
      success: true,
      budget: upsertRes.rows[0],
      message: "Monthly category budget saved successfully",
    });
  } catch (error) {
    console.error("Budgets POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
