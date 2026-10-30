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

    // Fetch events with item count and details
    const eventsRes = await query(`
      SELECT 
        e.id, 
        e.title, 
        e.category, 
        e."targetAmount"::float, 
        e."allocatedAmount"::float, 
        e."spentAmount"::float, 
        e."targetDate", 
        e.notes, 
        e."isCompleted", 
        e."createdAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id,
              'title', i.title,
              'amount', i.amount::float,
              'isPaid', i."isPaid"
            )
          ) FILTER (WHERE i.id IS NOT NULL), '[]'
        ) as items
      FROM "PlannerEvent" e
      LEFT JOIN "PlannerItem" i ON e.id = i."plannerId"
      WHERE e."userId" = $1
      GROUP BY e.id
      ORDER BY e."createdAt" DESC
    `, [userId]);

    return NextResponse.json({ events: eventsRes.rows });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Planner GET API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, category = "TRAVEL", targetAmount = 0, allocatedAmount = 0, targetDate, notes = "", items = [] } = body;

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return unauthorizedResponse();
    }
    const userId = user.id;

    const cleanTarget = parseFloat(targetAmount) || 0;
    const cleanAllocated = parseFloat(allocatedAmount) || 0;

    // 1. Insert Event
    const eventRes = await query(`
      INSERT INTO "PlannerEvent" (
        id, "userId", title, category, "targetAmount", "allocatedAmount", 
        "targetDate", notes, "isCompleted", "createdAt"
      )
      VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, 
        $6, $7, false, NOW()
      )
      RETURNING *
    `, [userId, title, category, cleanTarget, cleanAllocated, targetDate || null, notes]);

    const newEvent = eventRes.rows[0];

    // 2. Insert Sub-items if provided
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (!item.title) continue;
        await query(`
          INSERT INTO "PlannerItem" (id, "plannerId", title, amount, "isPaid", "createdAt")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
        `, [newEvent.id, item.title, parseFloat(item.amount) || 0, Boolean(item.isPaid)]);
      }
    }

    return NextResponse.json({ success: true, event: newEvent });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED" || err.message?.includes("bail out of prerendering")) {
      throw err;
    }
    console.error("Planner POST API error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { itemId, isPaid, eventId, isCompleted, allocatedAmount } = body;

    if (itemId !== undefined) {
      await query(`UPDATE "PlannerItem" SET "isPaid" = $1 WHERE id = $2`, [Boolean(isPaid), itemId]);
      return NextResponse.json({ success: true });
    }

    if (eventId) {
      if (isCompleted !== undefined) {
        await query(`UPDATE "PlannerEvent" SET "isCompleted" = $1 WHERE id = $2`, [Boolean(isCompleted), eventId]);
      }
      if (allocatedAmount !== undefined) {
        await query(`UPDATE "PlannerEvent" SET "allocatedAmount" = $1 WHERE id = $2`, [parseFloat(allocatedAmount) || 0, eventId]);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
  } catch (err) {
    console.error("Planner PATCH API error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
