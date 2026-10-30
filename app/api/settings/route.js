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

    // Ensure table and column exist seamlessly
    await query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "leaveDaysSchedule" TEXT DEFAULT 'WEEKENDS'`);
    await query(`
      CREATE TABLE IF NOT EXISTS "MoneyLent" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "borrowerName" TEXT NOT NULL,
        phone TEXT,
        amount DECIMAL(12, 2) NOT NULL,
        "lentDate" TIMESTAMPTZ DEFAULT NOW(),
        notes TEXT,
        "isRecovered" BOOLEAN DEFAULT FALSE,
        "recoveredAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_moneylent_user" ON "MoneyLent"("userId");
    `);

    const userRes = await query(`
      SELECT 
        id, email, "fullName", "baseCurrency",
        "monthlyIncome"::float, "spouseIncome"::float, "otherIncome"::float,
        COALESCE("partTimeIncome", 0)::float as "partTimeIncome",
        "payCycleDay", "maritalStatus", "gender", "dependentsCount",
        "occupationCategory", "occupationSubRole", "leaveDaysSchedule", "isOnboarded", "createdAt", "updatedAt"
      FROM "User"
      WHERE id = $1
    `, [userId]);

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [liabilitiesRes, moneyLentRes] = await Promise.all([
      query(`
        SELECT 
          id, name, category, 
          "monthlyPayment"::float, 
          "totalOutstanding"::float, 
          "interestRate"::float, 
          "tenureMonthsRemaining", 
          "isInformal", 
          "createdAt"
        FROM "Liability"
        WHERE "userId" = $1
        ORDER BY "createdAt" ASC
      `, [userId]),
      query(`
        SELECT 
          id, "borrowerName", phone, 
          amount::float, 
          "lentDate", notes, 
          "isRecovered", "recoveredAt", "createdAt"
        FROM "MoneyLent"
        WHERE "userId" = $1
        ORDER BY "isRecovered" ASC, "lentDate" DESC
      `, [userId]),
    ]);

    return NextResponse.json({
      user: userRes.rows[0],
      liabilities: liabilitiesRes.rows,
      moneyLent: moneyLentRes.rows,
    });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Settings GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
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
      fullName,
      monthlyIncome = 0,
      spouseIncome = 0,
      partTimeIncome = 0,
      otherIncome = 0,
      payCycleDay = 1,
      maritalStatus = "SINGLE",
      gender = "MALE",
      dependentsCount = 0,
      occupationCategory = "SALARIED",
      occupationSubRole = "",
      leaveDaysSchedule = "WEEKENDS",
      liabilities = [],
    } = body;

    const cleanMonthly = parseFloat(monthlyIncome) || 0;
    const cleanSpouse = parseFloat(spouseIncome) || 0;
    const cleanPartTime = parseFloat(partTimeIncome) || 0;
    const cleanOther = parseFloat(otherIncome) || 0;
    const cleanPayCycle = parseInt(payCycleDay, 10) || 1;
    const cleanDependents = parseInt(dependentsCount, 10) || 0;

    // Update User
    const updatedUserRes = await query(`
      UPDATE "User"
      SET 
        "fullName" = COALESCE($1, "fullName"),
        "monthlyIncome" = $2,
        "spouseIncome" = $3,
        "otherIncome" = $4,
        "partTimeIncome" = $5,
        "payCycleDay" = $6,
        "maritalStatus" = $7,
        "gender" = $8,
        "dependentsCount" = $9,
        "occupationCategory" = $10,
        "occupationSubRole" = $11,
        "leaveDaysSchedule" = $12,
        "updatedAt" = NOW()
      WHERE "id" = $13
      RETURNING 
        id, email, "fullName", "baseCurrency",
        "monthlyIncome"::float, "spouseIncome"::float, "otherIncome"::float, "partTimeIncome"::float,
        "payCycleDay", "maritalStatus", "gender", "dependentsCount",
        "occupationCategory", "occupationSubRole", "leaveDaysSchedule", "isOnboarded", "updatedAt"
    `, [
      fullName || null,
      cleanMonthly,
      cleanSpouse,
      cleanOther,
      cleanPartTime,
      cleanPayCycle,
      maritalStatus,
      gender,
      cleanDependents,
      occupationCategory,
      occupationSubRole,
      leaveDaysSchedule,
      userId,
    ]);

    // Synchronize liabilities
    await query(`DELETE FROM "Liability" WHERE "userId" = $1`, [userId]);

    if (Array.isArray(liabilities) && liabilities.length > 0) {
      for (const item of liabilities) {
        if (!item.name || !item.monthlyPayment) continue;
        const monthly = parseFloat(item.monthlyPayment) || 0;
        if (monthly <= 0) continue;

        const outstanding = item.totalOutstanding ? parseFloat(item.totalOutstanding) : null;
        const rate = item.interestRate ? parseFloat(item.interestRate) : null;
        const tenure = item.tenureMonthsRemaining ? parseInt(item.tenureMonthsRemaining, 10) : null;
        const isInformal = Boolean(item.isInformal);

        await query(`
          INSERT INTO "Liability" (
            id, "userId", name, category, "monthlyPayment", "totalOutstanding", 
            "interestRate", "tenureMonthsRemaining", "isInformal", "createdAt"
          )
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [
          userId,
          item.name,
          item.category || "General EMI",
          monthly,
          outstanding,
          rate,
          tenure,
          isInformal,
        ]);
      }
    }

    const freshLiabilities = await query(`
      SELECT 
        id, name, category, 
        "monthlyPayment"::float, 
        "totalOutstanding"::float, 
        "interestRate"::float, 
        "tenureMonthsRemaining", 
        "isInformal"
      FROM "Liability"
      WHERE "userId" = $1
      ORDER BY "createdAt" ASC
    `, [userId]);

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await invalidateCache(`spendpace:dashboard:${userId}`, `spendpace:patterns:${userId}:${currentMonthKey}`);

    return NextResponse.json({
      success: true,
      user: updatedUserRes.rows[0],
      liabilities: freshLiabilities.rows,
    });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Settings POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
