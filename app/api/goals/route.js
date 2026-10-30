import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    const userId = user.id;

    const goalsRes = await query(`
      SELECT 
        id, 
        title, 
        category,
        "targetAmount"::float, 
        "currentAmount"::float, 
        "targetDate", 
        priority, 
        "isCompleted",
        "autoTightenPace"
      FROM "Goal"
      WHERE "userId" = $1
      ORDER BY "isCompleted" ASC, priority ASC, "targetDate" ASC
    `, [userId]);

    const now = new Date();

    const enrichedGoals = goalsRes.rows.map((g) => {
      const target = parseFloat(g.targetAmount) || 0;
      const current = parseFloat(g.currentAmount) || 0;
      const remaining = Math.max(0, target - current);
      const targetDate = new Date(g.targetDate);
      const diffMs = targetDate.getTime() - now.getTime();
      const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      const requiredDailySavings = remaining > 0 ? Math.round(remaining / daysRemaining) : 0;
      const requiredMonthlySavings = requiredDailySavings * 30;
      const percentReached = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 100;

      // Status check
      let status = "ON_TRACK";
      if (g.isCompleted || current >= target) {
        status = "COMPLETED";
      } else if (diffMs <= 0) {
        status = "OVERDUE";
      } else if (requiredDailySavings > 650) {
        // High daily savings required creates risk of shortage
        status = "SHORTAGE_RISK";
      }

      return {
        ...g,
        remainingAmount: remaining,
        daysRemaining,
        requiredDailySavings,
        requiredMonthlySavings,
        percentReached,
        status,
      };
    });

    return NextResponse.json({ goals: enrichedGoals });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Goals GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      title,
      category = "FESTIVAL",
      targetAmount,
      currentAmount = 0,
      targetDate,
      priority = 1,
      autoTightenPace = false,
    } = body;

    if (!title || !targetAmount) {
      return NextResponse.json({ error: "Title and target amount are required" }, { status: 400 });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    const userId = user.id;

    const cleanTarget = parseFloat(targetAmount) || 0;
    const cleanCurrent = parseFloat(currentAmount) || 0;
    const cleanPriority = parseInt(priority, 10) || 1;
    const validDate = targetDate ? new Date(targetDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const insertRes = await query(`
      INSERT INTO "Goal" (
        id, "userId", title, category, "targetAmount", "currentAmount", 
        "targetDate", priority, "isCompleted", "autoTightenPace"
      )
      VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, 
        $6, $7, false, $8
      )
      RETURNING 
        id, title, category, "targetAmount"::float, "currentAmount"::float, 
        "targetDate", priority, "isCompleted", "autoTightenPace"
    `, [
      userId,
      title.trim(),
      category || "GENERAL",
      cleanTarget,
      cleanCurrent,
      validDate.toISOString(),
      cleanPriority,
      Boolean(autoTightenPace),
    ]);

    return NextResponse.json({ success: true, goal: insertRes.rows[0] });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Goals POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const {
      goalId,
      action,
      amount,
      extendDays,
      autoTightenPace,
      isCompleted,
    } = body;

    if (!goalId) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
    }

    // 1. Add Funds to Goal
    if (action === "ADD_FUNDS" && amount) {
      const cleanAmount = parseFloat(amount);
      if (cleanAmount > 0) {
        const updateRes = await query(`
          UPDATE "Goal"
          SET 
            "currentAmount" = "currentAmount" + $1,
            "isCompleted" = CASE WHEN ("currentAmount" + $1) >= "targetAmount" THEN true ELSE "isCompleted" END
          WHERE id = $2
          RETURNING id, "currentAmount"::float, "targetAmount"::float, "isCompleted"
        `, [cleanAmount, goalId]);

        return NextResponse.json({ success: true, goal: updateRes.rows[0] });
      }
    }

    // 2. Extend Deadline (e.g. +15, +30, +60 days to reduce pace burden)
    if (action === "EXTEND_DEADLINE" && extendDays) {
      const days = parseInt(extendDays, 10);
      if (days > 0) {
        const updateRes = await query(`
          UPDATE "Goal"
          SET "targetDate" = "targetDate" + ($1 || ' days')::interval
          WHERE id = $2
          RETURNING id, "targetDate", "autoTightenPace"
        `, [days, goalId]);

        return NextResponse.json({ success: true, goal: updateRes.rows[0] });
      }
    }

    // 3. Toggle Auto-Tighten Pace Pacing Shield
    if (action === "TOGGLE_TIGHTEN" && autoTightenPace !== undefined) {
      const updateRes = await query(`
        UPDATE "Goal"
        SET "autoTightenPace" = $1
        WHERE id = $2
        RETURNING id, "autoTightenPace"
      `, [Boolean(autoTightenPace), goalId]);

      return NextResponse.json({ success: true, goal: updateRes.rows[0] });
    }

    // 4. Toggle Completion
    if (isCompleted !== undefined) {
      const updateRes = await query(`
        UPDATE "Goal"
        SET "isCompleted" = $1
        WHERE id = $2
        RETURNING id, "isCompleted"
      `, [Boolean(isCompleted), goalId]);

      return NextResponse.json({ success: true, goal: updateRes.rows[0] });
    }

    return NextResponse.json({ error: "No valid action provided" }, { status: 400 });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Goals PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get("id");

    if (!goalId) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
    }

    await query(`DELETE FROM "Goal" WHERE id = $1`, [goalId]);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Goals DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

