import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { getOrSetCache } from "@/lib/redis";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    const userId = user.id;

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month"); // e.g. "2026-10"

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth(); // 0-indexed

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const parts = monthParam.split("-");
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
    }

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const daysInMonth = endOfMonth.getDate();
    const formattedMonthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const cacheKey = `spendpace:patterns:${userId}:${formattedMonthKey}`;

    const patternPayload = await getOrSetCache(cacheKey, async () => {
      // 1. Fetch user profile, leave schedule, income, liabilities, and transactions in ONE consolidated query
      const consolidatedRes = await query(`
        SELECT 
          (SELECT row_to_json(u) FROM (
            SELECT 
              id, "fullName", "baseCurrency", "monthlyIncome"::float, "spouseIncome"::float, 
              "otherIncome"::float, COALESCE("partTimeIncome", 0)::float as "partTimeIncome",
              "payCycleDay", "maritalStatus", "dependentsCount",
              COALESCE("leaveDaysSchedule", 'WEEKENDS') as "leaveDaysSchedule"
            FROM "User" WHERE id = $1
          ) u) as "user",

          (SELECT COALESCE(SUM("monthlyPayment"), 0)::float FROM "Liability" WHERE "userId" = $1) as "totalDebtMonthly",

          (SELECT COALESCE(json_agg(t), '[]'::json) FROM (
            SELECT 
              tx.id, 
              tx.description as name, 
              tx.amount::float, 
              tx.type, 
              tx."transactionDate", 
              tx.source, 
              c.name as category, 
              c."colorHex",
              c.icon as "categoryIcon",
              a.name as "accountName"
            FROM "Transaction" tx
            LEFT JOIN "Category" c ON tx."categoryId" = c.id
            LEFT JOIN "Account" a ON tx."accountId" = a.id
            WHERE tx."userId" = $1 
              AND tx."transactionDate" >= $2 
              AND tx."transactionDate" <= $3
            ORDER BY tx."transactionDate" ASC
          ) t) as "transactions"
      `, [userId, startOfMonth.toISOString(), endOfMonth.toISOString()]);

      const rootData = consolidatedRes.rows[0] || {};
      const user = rootData.user || {};
      const transactions = rootData.transactions || [];
      const totalDebtMonthly = parseFloat(rootData.totalDebtMonthly) || 0;

      const monthlyIncome = parseFloat(user.monthlyIncome) || 0;
      const spouseIncome = parseFloat(user.spouseIncome) || 0;
      const partTimeIncome = parseFloat(user.partTimeIncome) || 0;
      const otherIncome = parseFloat(user.otherIncome) || 0;
      const totalHouseholdInflow = monthlyIncome + spouseIncome + partTimeIncome + otherIncome;

      const dependentsCount = parseInt(user.dependentsCount, 10) || 0;
      const isSingle = user.maritalStatus === "SINGLE";
      const baselineLivingCost = isSingle ? 22000 : 32000 + (dependentsCount * 7500);
      const committedBills = totalDebtMonthly + baselineLivingCost;

    const totalDiscretionary = Math.max(0, totalHouseholdInflow - committedBills);
    // Baseline safe daily spend for this month
    const safeDaily = daysInMonth > 0 ? Math.round(totalDiscretionary / daysInMonth) : 1000;

    const leaveSchedule = user.leaveDaysSchedule || "WEEKENDS";

    // Helper to determine if a date is a leave/off day according to schedule
    const isLeaveDay = (dateObj) => {
      const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
      if (leaveSchedule === "SUNDAYS") return dayOfWeek === 0;
      if (leaveSchedule === "SIX_DAYS") return dayOfWeek === 0;
      if (leaveSchedule === "ROTATIONAL") return dayOfWeek === 0 || dayOfWeek === 3; // Sun & Wed
      // Default: "WEEKENDS"
      return dayOfWeek === 0 || dayOfWeek === 6;
    };

    // 2. Map transactions into day-buckets
    // calendarDays: Array of size daysInMonth (Day 1..daysInMonth)
    const calendarDays = [];
    let totalMonthSpent = 0;

    // Temporal breakdown metrics
    let monthStartSpent = 0; // Days 1 to 10
    let monthMidSpent = 0;   // Days 11 to 20
    let monthEndSpent = 0;   // Days 21 to End

    let leaveDaysSpent = 0;
    let leaveDaysCount = 0;
    let workDaysSpent = 0;
    let workDaysCount = 0;

    // Day of week sums: Sun(0) to Sat(6)
    const dayOfWeekData = [
      { day: "Sun", total: 0, count: 0 },
      { day: "Mon", total: 0, count: 0 },
      { day: "Tue", total: 0, count: 0 },
      { day: "Wed", total: 0, count: 0 },
      { day: "Thu", total: 0, count: 0 },
      { day: "Fri", total: 0, count: 0 },
      { day: "Sat", total: 0, count: 0 },
    ];

    // Pre-organize transactions by day of month
    const txByDay = {};
    for (let d = 1; d <= daysInMonth; d++) {
      txByDay[d] = [];
    }

    for (const tx of transactions) {
      if (tx.type !== "EXPENSE") continue;
      const txDate = new Date(tx.transactionDate);
      const dayNum = txDate.getDate();
      if (txByDay[dayNum]) {
        txByDay[dayNum].push(tx);
      }
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dayOfWeek = dateObj.getDay();
      const isOff = isLeaveDay(dateObj);

      const dayTxs = txByDay[d] || [];
      const daySpent = Math.round(dayTxs.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0));
      totalMonthSpent += daySpent;

      // Safe limit comparison
      const isOverLimit = daySpent > safeDaily;
      const isSaved = daySpent <= safeDaily;
      const savedAmount = isSaved ? Math.max(0, safeDaily - daySpent) : 0;
      const overAmount = isOverLimit ? daySpent - safeDaily : 0;

      calendarDays.push({
        dayNumber: d,
        date: dateObj.toISOString().split("T")[0],
        dayOfWeek,
        dayName: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek],
        isLeaveDay: isOff,
        spent: daySpent,
        safeDaily,
        isSaved,
        savedAmount,
        isOverLimit,
        overAmount,
        transactionsCount: dayTxs.length,
        transactions: dayTxs,
      });

      // Temporal: Month Start, Mid, End
      if (d <= 10) monthStartSpent += daySpent;
      else if (d <= 20) monthMidSpent += daySpent;
      else monthEndSpent += daySpent;

      // Work vs Leave
      if (isOff) {
        leaveDaysSpent += daySpent;
        leaveDaysCount++;
      } else {
        workDaysSpent += daySpent;
        workDaysCount++;
      }

      // Day of week
      dayOfWeekData[dayOfWeek].total += daySpent;
      dayOfWeekData[dayOfWeek].count++;
    }

    // 3. Compute 3-Days Once Micro-Cycles (Ration, grocery & replenishment waves)
    const threeDayWaves = [];
    for (let i = 0; i < calendarDays.length; i += 3) {
      const slice = calendarDays.slice(i, i + 3);
      const waveSpent = slice.reduce((sum, d) => sum + d.spent, 0);
      const label = `Day ${slice[0].dayNumber} - ${slice[slice.length - 1].dayNumber}`;
      threeDayWaves.push({
        label,
        startDay: slice[0].dayNumber,
        endDay: slice[slice.length - 1].dayNumber,
        spent: waveSpent,
        averagePerDay: Math.round(waveSpent / slice.length),
        isHeavyWave: waveSpent > (safeDaily * slice.length * 1.15),
      });
    }

    // Averages
    const avgLeaveSpend = leaveDaysCount > 0 ? Math.round(leaveDaysSpent / leaveDaysCount) : 0;
    const avgWorkSpend = workDaysCount > 0 ? Math.round(workDaysSpent / workDaysCount) : 0;
    const weekendSurgeFactor = avgWorkSpend > 0 ? parseFloat((avgLeaveSpend / avgWorkSpend).toFixed(2)) : 1.0;

    const formattedDayOfWeek = dayOfWeekData.map((d) => ({
      ...d,
      average: d.count > 0 ? Math.round(d.total / d.count) : 0,
    }));

    return {
      selectedMonth: `${year}-${String(month + 1).padStart(2, "0")}`,
      monthName: startOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      daysInMonth,
      firstDayOfWeek: startOfMonth.getDay(), // 0 for Sunday
      metrics: {
        totalMonthSpent,
        totalDiscretionary,
        safeDaily,
        monthlyIncome,
        partTimeIncome,
        spouseIncome,
        otherIncome,
        totalHouseholdInflow,
        underLimitDaysCount: calendarDays.filter((d) => d.isSaved).length,
        overLimitDaysCount: calendarDays.filter((d) => d.isOverLimit).length,
        totalSavedPace: calendarDays.reduce((sum, d) => sum + d.savedAmount, 0),
        totalOverPace: calendarDays.reduce((sum, d) => sum + d.overAmount, 0),
      },
      temporalPatterns: {
        monthStart: { spent: monthStartSpent, label: "Days 1–10 (Bills & Ration Rush)" },
        monthMid: { spent: monthMidSpent, label: "Days 11–20 (Mid-Cycle Equilibrium)" },
        monthEnd: { spent: monthEndSpent, label: "Days 21–End (Month-End Tightening)" },
      },
      leaveVsWork: {
        leaveDaysSchedule: leaveSchedule,
        avgLeaveSpend,
        avgWorkSpend,
        weekendSurgeFactor,
        leaveDaysCount,
        workDaysCount,
      },
      dayOfWeekPatterns: formattedDayOfWeek,
      threeDayWaves,
      calendarDays,
    };
  }, 120);

  return NextResponse.json(patternPayload);
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Pattern Analyser API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
