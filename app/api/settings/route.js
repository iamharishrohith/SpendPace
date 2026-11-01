import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/redis";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

async function ensureSettingsColumns() {
  await query(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "leaveDaysSchedule" TEXT DEFAULT 'WEEKENDS';
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "customLimitFrequency" TEXT DEFAULT 'DAY';
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "customLimitAmount" DECIMAL(12, 2) DEFAULT 0.00;
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activeLimitMode" TEXT DEFAULT 'DAILY';
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "smtpHost" TEXT DEFAULT '';
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "smtpPort" INTEGER DEFAULT 587;
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "smtpUser" TEXT DEFAULT '';
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "smtpPass" TEXT DEFAULT '';
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "smtpFrom" TEXT DEFAULT '';
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "smtpSecure" BOOLEAN DEFAULT FALSE;
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailWeeklyReport" BOOLEAN DEFAULT TRUE;
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailMonthlyReport" BOOLEAN DEFAULT TRUE;
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "reportRecipientEmail" TEXT DEFAULT '';
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastWeeklyReportSentAt" TIMESTAMPTZ;
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastMonthlyReportSentAt" TIMESTAMPTZ;
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
}

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    const userId = user.id;

    await ensureSettingsColumns();

    const userRes = await query(`
      SELECT 
        id, email, "fullName", "baseCurrency",
        "monthlyIncome"::float, "spouseIncome"::float, "otherIncome"::float,
        COALESCE("partTimeIncome", 0)::float as "partTimeIncome",
        "payCycleDay", "maritalStatus", "gender", "dependentsCount",
        "occupationCategory", "occupationSubRole", "leaveDaysSchedule",
        COALESCE("customLimitFrequency", 'DAY') as "customLimitFrequency",
        COALESCE("customLimitAmount"::float, 0) as "customLimitAmount",
        COALESCE("activeLimitMode", 'DAILY') as "activeLimitMode",
        COALESCE("smtpHost", '') as "smtpHost",
        COALESCE("smtpPort", 587) as "smtpPort",
        COALESCE("smtpUser", '') as "smtpUser",
        CASE WHEN "smtpPass" IS NOT NULL AND length("smtpPass") > 0 THEN true ELSE false END as "hasSmtpPassword",
        COALESCE("smtpFrom", '') as "smtpFrom",
        COALESCE("smtpSecure", false) as "smtpSecure",
        COALESCE("emailWeeklyReport", true) as "emailWeeklyReport",
        COALESCE("emailMonthlyReport", true) as "emailMonthlyReport",
        COALESCE("reportRecipientEmail", '') as "reportRecipientEmail",
        "lastWeeklyReportSentAt",
        "lastMonthlyReportSentAt",
        "isOnboarded", "createdAt", "updatedAt"
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

    // Ensure custom limit columns exist
    await ensureSettingsColumns();

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
      walletBalance = null,
      customLimitFrequency = "DAY",
      customLimitAmount = null,
      activeLimitMode = "DAILY",
      liabilities = [],
    } = body;

    const cleanMonthly = monthlyIncome !== undefined ? (parseFloat(monthlyIncome) || 0) : null;
    const cleanSpouse = spouseIncome !== undefined ? (parseFloat(spouseIncome) || 0) : null;
    const cleanPartTime = partTimeIncome !== undefined ? (parseFloat(partTimeIncome) || 0) : null;
    const cleanOther = otherIncome !== undefined ? (parseFloat(otherIncome) || 0) : null;
    const cleanPayCycle = payCycleDay !== undefined ? (parseInt(payCycleDay, 10) || 1) : null;
    const cleanDependents = dependentsCount !== undefined ? (parseInt(dependentsCount, 10) || 0) : null;
    const cleanCustomLimit = customLimitAmount !== undefined && customLimitAmount !== null ? (parseFloat(customLimitAmount) || 0) : null;

    // Update Wallet / Liquid Balance if provided
    if (walletBalance !== null && walletBalance !== undefined && !isNaN(parseFloat(walletBalance))) {
      const cleanWallet = parseFloat(walletBalance);
      const accRes = await query(`SELECT id FROM "Account" WHERE "userId" = $1 AND "isDefault" = true LIMIT 1`, [userId]);
      if (accRes.rows.length > 0) {
        await query(`UPDATE "Account" SET balance = $1 WHERE id = $2`, [cleanWallet, accRes.rows[0].id]);
      } else {
        const anyAcc = await query(`SELECT id FROM "Account" WHERE "userId" = $1 LIMIT 1`, [userId]);
        if (anyAcc.rows.length > 0) {
          await query(`UPDATE "Account" SET balance = $1 WHERE id = $2`, [cleanWallet, anyAcc.rows[0].id]);
        } else {
          await query(`
            INSERT INTO "Account" (id, "userId", name, "accountType", balance, "isDefault", "createdAt")
            VALUES (gen_random_uuid(), $1, 'Cash Wallet', 'SAVINGS_BANK', $2, true, NOW())
          `, [userId, cleanWallet]);
        }
      }
    }

    // Update User (Safely preserving existing fields via COALESCE)
    const updatedUserRes = await query(`
      UPDATE "User"
      SET 
        "fullName" = COALESCE($1, "fullName"),
        "monthlyIncome" = COALESCE($2, "monthlyIncome"),
        "spouseIncome" = COALESCE($3, "spouseIncome"),
        "otherIncome" = COALESCE($4, "otherIncome"),
        "partTimeIncome" = COALESCE($5, "partTimeIncome"),
        "payCycleDay" = COALESCE($6, "payCycleDay"),
        "maritalStatus" = COALESCE($7, "maritalStatus"),
        "gender" = COALESCE($8, "gender"),
        "dependentsCount" = COALESCE($9, "dependentsCount"),
        "occupationCategory" = COALESCE($10, "occupationCategory"),
        "occupationSubRole" = COALESCE($11, "occupationSubRole"),
        "leaveDaysSchedule" = COALESCE($12, "leaveDaysSchedule"),
        "customLimitFrequency" = COALESCE($13, "customLimitFrequency"),
        "customLimitAmount" = COALESCE($14, "customLimitAmount"),
        "activeLimitMode" = COALESCE($15, "activeLimitMode"),
        "updatedAt" = NOW()
      WHERE "id" = $16
      RETURNING 
        id, email, "fullName", "baseCurrency",
        "monthlyIncome"::float, "spouseIncome"::float, "otherIncome"::float, "partTimeIncome"::float,
        "payCycleDay", "maritalStatus", "gender", "dependentsCount",
        "occupationCategory", "occupationSubRole", "leaveDaysSchedule",
        "customLimitFrequency", "customLimitAmount"::float, "activeLimitMode",
        "isOnboarded", "updatedAt"
    `, [
      fullName || null,
      cleanMonthly,
      cleanSpouse,
      cleanOther,
      cleanPartTime,
      cleanPayCycle,
      maritalStatus || null,
      gender || null,
      cleanDependents,
      occupationCategory || null,
      occupationSubRole || null,
      leaveDaysSchedule || null,
      customLimitFrequency || null,
      cleanCustomLimit,
      activeLimitMode || null,
      userId,
    ]);

    // Optional SMTP fields update if passed
    if (body.smtpHost !== undefined || body.emailWeeklyReport !== undefined || body.emailMonthlyReport !== undefined) {
      const {
        smtpHost = "",
        smtpPort = 587,
        smtpUser = "",
        smtpPass = "",
        smtpFrom = "",
        smtpSecure = false,
        emailWeeklyReport = true,
        emailMonthlyReport = true,
        reportRecipientEmail = "",
      } = body;
      if (smtpPass && smtpPass.trim().length > 0) {
        await query(`
          UPDATE "User"
          SET 
            "smtpHost" = $1, "smtpPort" = $2, "smtpUser" = $3, "smtpPass" = $4,
            "smtpFrom" = $5, "smtpSecure" = $6, "emailWeeklyReport" = $7,
            "emailMonthlyReport" = $8, "reportRecipientEmail" = $9
          WHERE id = $10
        `, [smtpHost.trim(), parseInt(smtpPort, 10) || 587, smtpUser.trim(), smtpPass.trim(), smtpFrom.trim(), Boolean(smtpSecure), Boolean(emailWeeklyReport), Boolean(emailMonthlyReport), reportRecipientEmail.trim() || user.email, userId]);
      } else {
        await query(`
          UPDATE "User"
          SET 
            "smtpHost" = $1, "smtpPort" = $2, "smtpUser" = $3,
            "smtpFrom" = $4, "smtpSecure" = $5, "emailWeeklyReport" = $6,
            "emailMonthlyReport" = $7, "reportRecipientEmail" = $8
          WHERE id = $9
        `, [smtpHost.trim(), parseInt(smtpPort, 10) || 587, smtpUser.trim(), smtpFrom.trim(), Boolean(smtpSecure), Boolean(emailWeeklyReport), Boolean(emailMonthlyReport), reportRecipientEmail.trim() || user.email, userId]);
      }
    }

    // Synchronize liabilities only if explicitly provided in request body
    if (body.liabilities !== undefined && Array.isArray(liabilities)) {
      await query(`DELETE FROM "Liability" WHERE "userId" = $1`, [userId]);

      if (liabilities.length > 0) {
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
