import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

// Automatically ensure the Investment table exists in PostgreSQL
let tableInitialized = false;
async function ensureInvestmentTable() {
  if (tableInitialized) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS "Investment" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(64) NOT NULL DEFAULT 'MUTUAL_FUND_SIP',
        frequency VARCHAR(32) NOT NULL DEFAULT 'MONTHLY',
        "installmentAmount" DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        "currentValue" DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        "targetValue" DECIMAL(12, 2) DEFAULT 0.00,
        "nextDueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        "policyFolioNumber" VARCHAR(128),
        "autoPaceReserve" BOOLEAN NOT NULL DEFAULT true,
        notes TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_investment_user_due" ON "Investment"("userId", "nextDueDate");
    `);
    tableInitialized = true;
  } catch (err) {
    console.error("[Investment Table Init Error]:", err.message);
  }
}

/**
 * Calculates monthly amortized outflow based on commitment frequency:
 * - MONTHLY: installment / 1
 * - QUARTERLY: installment / 3
 * - HALF_YEARLY: installment / 6
 * - YEARLY: installment / 12
 */
function getMonthlyAmortizedOutflow(amount, frequency) {
  const cleanAmount = parseFloat(amount) || 0;
  switch (frequency) {
    case "QUARTERLY":
      return Math.round((cleanAmount / 3) * 100) / 100;
    case "HALF_YEARLY":
      return Math.round((cleanAmount / 6) * 100) / 100;
    case "YEARLY":
      return Math.round((cleanAmount / 12) * 100) / 100;
    case "MONTHLY":
    default:
      return cleanAmount;
  }
}

/**
 * Calculates next due date after marking current cycle paid
 */
function advanceDueDate(currentDueDate, frequency) {
  const date = new Date(currentDueDate);
  switch (frequency) {
    case "QUARTERLY":
      date.setMonth(date.getMonth() + 3);
      break;
    case "HALF_YEARLY":
      date.setMonth(date.getMonth() + 6);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
    case "MONTHLY":
    default:
      date.setMonth(date.getMonth() + 1);
      break;
  }
  return date.toISOString();
}

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    await ensureInvestmentTable();

    const { searchParams } = new URL(req.url);
    const frequencyFilter = searchParams.get("frequency");

    let sql = `
      SELECT 
        id,
        "userId",
        name,
        type,
        frequency,
        "installmentAmount"::float,
        "currentValue"::float,
        "targetValue"::float,
        "nextDueDate",
        "policyFolioNumber",
        "autoPaceReserve",
        notes,
        "isActive",
        "createdAt",
        "updatedAt"
      FROM "Investment"
      WHERE "userId" = $1
    `;
    const params = [user.id];

    if (frequencyFilter && frequencyFilter !== "ALL") {
      sql += ` AND frequency = $2`;
      params.push(frequencyFilter.toUpperCase());
    }

    sql += ` ORDER BY "nextDueDate" ASC, "createdAt" DESC`;

    const res = await query(sql, params);
    const now = new Date();

    let totalPortfolioValue = 0;
    let totalMonthlyAmortizedReserve = 0;
    let upcomingDueCount = 0;

    const enrichedInvestments = res.rows.map((inv) => {
      const installment = parseFloat(inv.installmentAmount) || 0;
      const currentVal = parseFloat(inv.currentValue) || 0;
      const monthlyAmortized = getMonthlyAmortizedOutflow(installment, inv.frequency);

      if (inv.isActive) {
        totalPortfolioValue += currentVal;
        if (inv.autoPaceReserve) {
          totalMonthlyAmortizedReserve += monthlyAmortized;
        }
      }

      const dueDate = new Date(inv.nextDueDate);
      const diffMs = dueDate.getTime() - now.getTime();
      const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let status = "ON_TRACK";
      if (!inv.isActive) {
        status = "PAUSED";
      } else if (daysUntilDue < 0) {
        status = "OVERDUE";
      } else if (daysUntilDue <= 7) {
        status = "DUE_SOON";
        upcomingDueCount++;
      } else if (daysUntilDue <= 30) {
        status = "UPCOMING";
      }

      return {
        ...inv,
        monthlyAmortizedOutflow: monthlyAmortized,
        dailyAmortizedOutflow: Math.round((monthlyAmortized / 30) * 100) / 100,
        daysUntilDue,
        status,
      };
    });

    return NextResponse.json({
      success: true,
      investments: enrichedInvestments,
      summary: {
        totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100,
        totalMonthlyAmortizedReserve: Math.round(totalMonthlyAmortizedReserve * 100) / 100,
        totalDailyReserveImpact: Math.round((totalMonthlyAmortizedReserve / 30) * 100) / 100,
        totalCount: enrichedInvestments.length,
        upcomingDueCount,
      },
    });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Investment GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    await ensureInvestmentTable();

    const body = await req.json();
    const {
      name,
      type = "MUTUAL_FUND_SIP",
      frequency = "MONTHLY",
      installmentAmount = 0,
      currentValue = 0,
      targetValue = 0,
      nextDueDate,
      policyFolioNumber = "",
      autoPaceReserve = true,
      notes = "",
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Investment or policy name is required." }, { status: 400 });
    }

    const cleanInstallment = parseFloat(installmentAmount) || 0;
    const cleanCurrent = parseFloat(currentValue) || 0;
    const cleanTarget = parseFloat(targetValue) || 0;
    const cleanDueDate = nextDueDate ? new Date(nextDueDate).toISOString() : new Date().toISOString();

    const validFrequencies = ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"];
    const sanitizedFrequency = validFrequencies.includes(frequency.toUpperCase())
      ? frequency.toUpperCase()
      : "MONTHLY";

    const insertRes = await query(`
      INSERT INTO "Investment" (
        "userId", name, type, frequency, "installmentAmount", 
        "currentValue", "targetValue", "nextDueDate", 
        "policyFolioNumber", "autoPaceReserve", notes, "isActive", 
        "createdAt", "updatedAt"
      )
      VALUES (
        $1, $2, $3, $4, $5, 
        $6, $7, $8, 
        $9, $10, $11, true, 
        NOW(), NOW()
      )
      RETURNING *
    `, [
      user.id,
      name.trim(),
      type.toUpperCase(),
      sanitizedFrequency,
      cleanInstallment,
      cleanCurrent,
      cleanTarget,
      cleanDueDate,
      policyFolioNumber ? policyFolioNumber.trim() : null,
      Boolean(autoPaceReserve),
      notes ? notes.trim() : null,
    ]);

    return NextResponse.json({
      success: true,
      investment: insertRes.rows[0],
      message: "Investment/Policy registered successfully.",
    });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Investment POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    await ensureInvestmentTable();

    const body = await req.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Investment ID is required." }, { status: 400 });
    }

    // Check ownership
    const checkRes = await query(`SELECT * FROM "Investment" WHERE id = $1 AND "userId" = $2`, [id, user.id]);
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Investment not found." }, { status: 404 });
    }
    const current = checkRes.rows[0];

    // Handle "MARK_PAID" action: advance due date & add installment to currentValue
    if (action === "MARK_PAID") {
      const nextDue = advanceDueDate(current.nextDueDate, current.frequency);
      const newCurrentValue = (parseFloat(current.currentValue) || 0) + (parseFloat(current.installmentAmount) || 0);

      const updateRes = await query(`
        UPDATE "Investment"
        SET 
          "nextDueDate" = $1,
          "currentValue" = $2,
          "updatedAt" = NOW()
        WHERE id = $3 AND "userId" = $4
        RETURNING *
      `, [nextDue, newCurrentValue, id, user.id]);

      return NextResponse.json({
        success: true,
        investment: updateRes.rows[0],
        message: `Cycle marked paid! Next due date advanced to ${new Date(nextDue).toLocaleDateString("en-IN")}.`,
      });
    }

    // Handle "TOGGLE_ACTIVE"
    if (action === "TOGGLE_ACTIVE") {
      const updateRes = await query(`
        UPDATE "Investment"
        SET "isActive" = NOT "isActive", "updatedAt" = NOW()
        WHERE id = $1 AND "userId" = $2
        RETURNING *
      `, [id, user.id]);

      return NextResponse.json({
        success: true,
        investment: updateRes.rows[0],
      });
    }

    // Handle general update
    const allowedFields = [
      "name", "type", "frequency", "installmentAmount", 
      "currentValue", "targetValue", "nextDueDate", 
      "policyFolioNumber", "autoPaceReserve", "notes", "isActive"
    ];

    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        setClauses.push(`"${key}" = $${idx}`);
        values.push(updates[key]);
        idx++;
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update." }, { status: 400 });
    }

    setClauses.push(`"updatedAt" = NOW()`);
    values.push(id, user.id);

    const updateQuery = `
      UPDATE "Investment"
      SET ${setClauses.join(", ")}
      WHERE id = $${idx} AND "userId" = $${idx + 1}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    return NextResponse.json({
      success: true,
      investment: result.rows[0],
    });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Investment PATCH error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    await ensureInvestmentTable();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Investment ID is required." }, { status: 400 });
    }

    const deleteRes = await query(`DELETE FROM "Investment" WHERE id = $1 AND "userId" = $2 RETURNING id`, [id, user.id]);

    if (deleteRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Investment not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Investment/Policy deleted successfully.",
    });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Investment DELETE error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
