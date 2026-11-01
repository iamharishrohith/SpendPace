import { query, withClient } from "@/lib/db";
import { NextResponse } from "next/server";
import { getOrSetCache } from "@/lib/redis";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req) {
  try {
    // 1. Resolve authenticated user from session, Authorization header, or guarded fallback
    const user = await getAuthenticatedUser(req);

    if (!user) {
      if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_FALLBACK !== "true") {
        return unauthorizedResponse();
      }
      return NextResponse.json({
        user: {
          id: null,
          name: "",
          email: "",
          currency: "INR",
          monthlyIncome: 0,
          spouseIncome: 0,
          partTimeIncome: 0,
          otherIncome: 0,
          totalHouseholdInflow: 0,
          payCycleDay: 1,
          maritalStatus: "SINGLE",
          gender: "MALE",
          dependentsCount: 0,
          occupationCategory: "SALARIED",
          occupationSubRole: "Staff",
          isOnboarded: false,
        },
        accounts: [],
        categories: [],
        transactions: [],
        goals: [],
        liabilities: [],
        metrics: {
          totalSpent: 0,
          monthSpent: 0,
          todaySpent: 0,
          totalWalletBalance: 0,
          monthlyIncome: 0,
          spouseIncome: 0,
          partTimeIncome: 0,
          otherIncome: 0,
          totalHouseholdInflow: 0,
          totalDebtMonthly: 0,
          baselineLivingCost: 0,
          committedBills: 0,
          daysRemaining: 1,
          totalDiscretionary: 0,
          remainingDiscretionary: 0,
          safeDaily: 0,
          rawSafeDaily: 0,
          goalTightenReduction: 0,
          burnPercentage: 0,
        },
        shortageAlert: null,
      });
    }

    // 2. Fetch user data with Upstash Redis caching (bypass if no-cache or x-refresh requested)
    const isBypassCache = req.headers?.get?.("cache-control") === "no-cache" || 
                          req.headers?.get?.("x-refresh") === "true" ||
                          req.headers?.["cache-control"] === "no-cache";
    const cacheKey = `spendpace:dashboard:${user.id}`;

    const fetchFreshDashboard = async () => {
      const consolidatedRes = await query(`
        SELECT 
          (SELECT COALESCE(json_agg(a), '[]'::json) FROM (
            SELECT id, name, "accountType", balance::float, "creditLimit"::float, "isDefault" 
            FROM "Account" WHERE "userId" = $1
          ) a) as accounts,

          (SELECT COALESCE(json_agg(c), '[]'::json) FROM (
            SELECT id, name, icon, "colorHex", "isDiscretionary" 
            FROM "Category" WHERE "userId" = $1
          ) c) as categories,

          (SELECT COALESCE(json_agg(g), '[]'::json) FROM (
            SELECT id, title, category, "targetAmount"::float, "currentAmount"::float, "targetDate", priority, "isCompleted", "autoTightenPace" 
            FROM "Goal" WHERE "userId" = $1 ORDER BY priority ASC
          ) g) as goals,

          (SELECT COALESCE(json_agg(l), '[]'::json) FROM (
            SELECT id, name, category, "monthlyPayment"::float, "totalOutstanding"::float, "interestRate"::float, "tenureMonthsRemaining", "isInformal" 
            FROM "Liability" WHERE "userId" = $1 ORDER BY "monthlyPayment" DESC
          ) l) as liabilities,

          (SELECT COALESCE(SUM(amount), 0)::float FROM "Transaction" WHERE "userId" = $1 AND type = 'EXPENSE') as "monthSpent",
          (SELECT COALESCE(SUM(amount), 0)::float FROM "Transaction" WHERE "userId" = $1 AND type = 'EXPENSE' AND DATE("transactionDate" + INTERVAL '5 hours 30 minutes') = DATE(NOW() + INTERVAL '5 hours 30 minutes')) as "todaySpent",
          (SELECT COALESCE(SUM(balance), 0)::float FROM "Account" WHERE "userId" = $1 AND balance > 0) as "totalWalletBalance",

          (SELECT COALESCE(json_agg(tx), '[]'::json) FROM (
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
            LIMIT 25
          ) tx) as "recentTransactions"
      `, [user.id]);

      const dashboardData = consolidatedRes.rows[0] || {};
      const accounts = dashboardData.accounts || [];
      const categories = dashboardData.categories || [];
      const goals = dashboardData.goals || [];
      const liabilities = dashboardData.liabilities || [];
      const transactions = dashboardData.recentTransactions || [];
      const monthSpent = parseFloat(dashboardData.monthSpent) || 0;
      const todaySpent = parseFloat(dashboardData.todaySpent) || 0;
      const totalWalletBalance = parseFloat(dashboardData.totalWalletBalance) || 0;
      const totalSpent = monthSpent;

      const monthlyIncome = parseFloat(user.monthlyIncome) || 0;
      const spouseIncome = parseFloat(user.spouseIncome) || 0;
      const partTimeIncome = parseFloat(user.partTimeIncome) || 0;
      const otherIncome = parseFloat(user.otherIncome) || 0;
      const totalHouseholdInflow = monthlyIncome + spouseIncome + partTimeIncome + otherIncome;

      const effectiveWalletBalance = totalWalletBalance > 0
        ? totalWalletBalance
        : Math.max(0, totalHouseholdInflow - monthSpent);

      const totalDebtMonthly = liabilities.reduce((sum, item) => sum + (parseFloat(item.monthlyPayment) || 0), 0);
      const baselineLivingCost = 0;
      const committedBills = totalDebtMonthly;

      const now = new Date();
      const currentDay = now.getDate();
      const payCycleDay = parseInt(user.payCycleDay, 10) || 1;
      let daysRemaining = 1;
      if (currentDay < payCycleDay) {
        daysRemaining = payCycleDay - currentDay;
      } else {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        daysRemaining = Math.max(1, (daysInMonth - currentDay) + payCycleDay);
      }

      // 1. Automatic Goal Allocation directly from Salary (no manual deposit needed)
      let monthlyGoalAllocation = 0;
      for (const g of goals) {
        if (g.isCompleted) continue;
        const target = parseFloat(g.targetAmount) || 0;
        const current = parseFloat(g.currentAmount) || 0;
        const remaining = Math.max(0, target - current);
        if (remaining <= 0) continue;

        const targetDate = new Date(g.targetDate || `${now.getFullYear() + 1}-01-01`);
        const diffMs = targetDate.getTime() - now.getTime();
        const goalDaysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const goalMonthsRemaining = Math.max(1, Math.ceil(goalDaysRemaining / 30));
        const autoMonthlyGoalNeed = Math.round(remaining / goalMonthsRemaining);
        monthlyGoalAllocation += autoMonthlyGoalNeed;
      }

      // 2. Personal Savings Wallet / Piggy Bank (10% automated salary reserve for future)
      const monthlyPiggyBank = Math.round(totalHouseholdInflow * 0.10);

      // 3. Autonomous Daily Safe-to-Spend strictly AFTER deducting:
      // - Committed EMIs/Bills
      // - Automatic Goal Allocations
      // - Monthly Piggy Bank Personal Savings!
      const totalCommittedAndSaved = committedBills + monthlyGoalAllocation + monthlyPiggyBank;
      const baseDiscretionaryPool = totalHouseholdInflow > 0
        ? Math.max(0, totalHouseholdInflow - totalCommittedAndSaved)
        : Math.max(0, effectiveWalletBalance - totalDebtMonthly);
      const totalDiscretionary = baseDiscretionaryPool;
      const remainingDiscretionary = Math.max(0, totalDiscretionary - monthSpent);
      const computedSafeDaily = daysRemaining > 0 
        ? Math.round(remainingDiscretionary / daysRemaining) 
        : remainingDiscretionary;
      const rawSafeDaily = computedSafeDaily > 0 
        ? computedSafeDaily 
        : (effectiveWalletBalance > 0 ? Math.max(50, Math.round(effectiveWalletBalance / daysRemaining)) : 500);

      // Analyze goals for Shortage Alert & Automated Pacing Shield
      let highestShortageGoal = null;
      let totalGoalTightenReduction = 0;

      for (const g of goals) {
        if (g.isCompleted) continue;
        const target = parseFloat(g.targetAmount) || 0;
        const current = parseFloat(g.currentAmount) || 0;
        const remaining = Math.max(0, target - current);
        if (remaining <= 0) continue;

        const targetDate = new Date(g.targetDate);
        const diffMs = targetDate.getTime() - now.getTime();
        const goalDaysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const requiredDaily = Math.round(remaining / goalDaysRemaining);

        // If user enabled autoTightenPace on this goal, throttle daily spend limit to guarantee goal funding
        if (g.autoTightenPace) {
          totalGoalTightenReduction += requiredDaily;
        }

        // Shortage condition: If required daily savings is significant, or deadline approaches, or pacing shield active
        const isUrgent = goalDaysRemaining <= 60;
        const isSignificantDaily = requiredDaily >= Math.min(250, rawSafeDaily * 0.1);
        const isBurnHigh = totalDiscretionary > 0 && (totalSpent / totalDiscretionary) > 0.25;

        if (isUrgent || isSignificantDaily || isBurnHigh || g.autoTightenPace) {
          const shortage = Math.max(50, Math.round(requiredDaily * 0.35));
          if (!highestShortageGoal || requiredDaily > (highestShortageGoal.requiredDaily || 0)) {
            highestShortageGoal = {
              hasShortage: true,
              goalId: g.id,
              goalTitle: g.title,
              category: g.category || "FESTIVAL",
              targetAmount: target,
              currentAmount: current,
              deficit: remaining,
              goalDaysRemaining,
              requiredDaily,
              currentDailySafe: rawSafeDaily,
              shortageAmount: shortage,
              suggestedTightenAmount: Math.min(requiredDaily, Math.max(100, Math.round(rawSafeDaily * 0.15))),
              suggestedExtensionDays: 30,
              autoTightenPace: Boolean(g.autoTightenPace),
              targetDate: g.targetDate,
            };
          }
        }
      }

      const safeDaily = totalGoalTightenReduction > 0
        ? Math.max(0, rawSafeDaily - totalGoalTightenReduction)
        : rawSafeDaily;

      return {
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          currency: user.baseCurrency || "INR",
          monthlyIncome,
          spouseIncome,
          partTimeIncome,
          otherIncome,
          totalHouseholdInflow,
          payCycleDay: user.payCycleDay,
          maritalStatus: user.maritalStatus || "SINGLE",
          gender: user.gender || "MALE",
          dependentsCount,
          occupationCategory: user.occupationCategory || "SALARIED",
          occupationSubRole: user.occupationSubRole || "Professional",
          isOnboarded: Boolean(user.isOnboarded),
        },
        accounts,
        categories,
        transactions,
        goals,
        liabilities,
        metrics: {
          totalSpent,
          monthSpent,
          todaySpent,
          todayRemaining: Math.max(0, safeDaily - todaySpent),
          totalWalletBalance: effectiveWalletBalance,
          monthlyIncome,
          spouseIncome,
          partTimeIncome,
          otherIncome,
          totalHouseholdInflow,
          totalDebtMonthly,
          baselineLivingCost,
          committedBills,
          totalCommittedAndSaved,
          monthlyGoalAllocation,
          monthlyPiggyBank,
          daysRemaining,
          totalDiscretionary,
          remainingDiscretionary,
          safeDaily,
          rawSafeDaily,
          goalTightenReduction: totalGoalTightenReduction,
          burnPercentage: totalDiscretionary > 0 ? Math.round((monthSpent / totalDiscretionary) * 100) : 0,
        },
        shortageAlert: highestShortageGoal,
      };
    };

    const finalPayload = isBypassCache 
      ? await fetchFreshDashboard() 
      : await getOrSetCache(cacheKey, fetchFreshDashboard, 60);

    return NextResponse.json(finalPayload);
  } catch (error) {
    if (error.digest === "NEXT_PRERENDER_INTERRUPTED" || error.message?.includes("bail out of prerendering")) {
      throw error;
    }
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}