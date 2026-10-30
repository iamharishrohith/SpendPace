import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      userId,
      email,
      maritalStatus = "SINGLE",
      gender = "MALE",
      dependentsCount = 0,
      occupationCategory = "SALARIED",
      occupationSubRole = "",
      monthlyIncome = 0,
      spouseIncome = 0,
      otherIncome = 0,
      payCycleDay = 1,
      liabilities = [],
    } = body;

    let targetUserId = userId;

    // If userId not provided in body, try to resolve from email
    if (!targetUserId && email) {
      const emailRes = await query(`SELECT id FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`, [email.trim()]);
      if (emailRes.rows.length > 0) {
        targetUserId = emailRes.rows[0].id;
      }
    }

    // If still not resolved, try cookie
    if (!targetUserId) {
      const cookie = req.cookies.get("spendpace_session")?.value;
      if (cookie) {
        try {
          const session = JSON.parse(cookie);
          targetUserId = session.userId;
        } catch (e) {}
      }
    }

    if (!targetUserId) {
      // Fallback to first user in database
      const userRes = await query(`SELECT id FROM "User" LIMIT 1`);
      if (userRes.rows.length > 0) {
        targetUserId = userRes.rows[0].id;
      } else {
        return NextResponse.json({ success: false, error: "User session not found." }, { status: 401 });
      }
    }

    const cleanMonthlyIncome = parseFloat(monthlyIncome) || 0;
    const cleanSpouseIncome = parseFloat(spouseIncome) || 0;
    const cleanOtherIncome = parseFloat(otherIncome) || 0;
    const cleanPayCycleDay = parseInt(payCycleDay, 10) || 1;
    const cleanDependents = parseInt(dependentsCount, 10) || 0;

    // 1. Update User profile with financial structure
    const updatedUserRes = await query(`
      UPDATE "User"
      SET 
        "maritalStatus" = $1,
        "gender" = $2,
        "dependentsCount" = $3,
        "occupationCategory" = $4,
        "occupationSubRole" = $5,
        "monthlyIncome" = $6,
        "spouseIncome" = $7,
        "otherIncome" = $8,
        "payCycleDay" = $9,
        "isOnboarded" = true,
        "updatedAt" = NOW()
      WHERE "id" = $10
      RETURNING *
    `, [
      maritalStatus,
      gender,
      cleanDependents,
      occupationCategory,
      occupationSubRole,
      cleanMonthlyIncome,
      cleanSpouseIncome,
      cleanOtherIncome,
      cleanPayCycleDay,
      targetUserId,
    ]);

    const updatedUser = updatedUserRes.rows[0];

    // 2. Synchronize Liabilities (Delete existing and re-insert fresh verified liabilities)
    await query(`DELETE FROM "Liability" WHERE "userId" = $1`, [targetUserId]);

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
          targetUserId,
          item.name.trim(),
          item.category || "OTHER",
          monthly,
          outstanding,
          rate,
          tenure,
          isInformal,
        ]);
      }
    }

    // 3. Adapt default zero-based category allocations to match the family size & profile
    const existingBudgets = await query(`SELECT id FROM "Budget" WHERE "userId" = $1 LIMIT 1`, [targetUserId]);
    if (existingBudgets.rows.length === 0) {
      const now = new Date();
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const categories = await query(`SELECT id, name FROM "Category" WHERE "userId" = $1`, [targetUserId]);

      const totalHousehold = cleanMonthlyIncome + cleanSpouseIncome + cleanOtherIncome;
      // Proportional budget weighting:
      // Groceries & Food: 20-30% depending on family size
      // Commute: 8-12%
      // Utilities: 8-10%
      // Discretionary / Shopping: 10-15%
      const multiplier = cleanDependents > 0 ? 1.4 : 1.0;

      for (const cat of categories.rows) {
        let allocation = 5000;
        if (cat.name.includes("Groceries")) allocation = Math.round(totalHousehold * 0.18 * multiplier);
        else if (cat.name.includes("Dining")) allocation = Math.round(totalHousehold * 0.08);
        else if (cat.name.includes("Fuel")) allocation = Math.round(totalHousehold * 0.08);
        else if (cat.name.includes("Utilities")) allocation = Math.round(totalHousehold * 0.07 * multiplier);
        else if (cat.name.includes("Shopping")) allocation = Math.round(totalHousehold * 0.06);
        else if (cat.name.includes("Entertainment")) allocation = Math.round(totalHousehold * 0.05);

        await query(`
          INSERT INTO "Budget" (id, "userId", "categoryId", "monthYear", "allocatedAmount", "alertThreshold")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, 0.85)
          ON CONFLICT ("userId", "categoryId", "monthYear") DO UPDATE 
          SET "allocatedAmount" = EXCLUDED."allocatedAmount"
        `, [targetUserId, cat.id, monthYear, Math.max(1000, allocation)]);
      }
    }

    // 4. Update the session cookie so middleware knows user is now fully onboarded
    const sessionPayload = {
      userId: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      isOnboarded: true,
    };

    const response = NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Financial profile successfully configured.",
    });

    response.cookies.set({
      name: "spendpace_session",
      value: JSON.stringify(sessionPayload),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error.digest === "NEXT_PRERENDER_INTERRUPTED" || error.message?.includes("bail out of prerendering")) {
      throw error;
    }
    console.error("Onboarding API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
