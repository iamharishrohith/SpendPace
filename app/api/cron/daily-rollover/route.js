import { query, withTransaction } from "@/lib/db";
import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req) {
  return handleDailyRollover(req);
}

export async function POST(req) {
  return handleDailyRollover(req);
}

async function handleDailyRollover(req) {
  try {
    const usersRes = await query(`
      SELECT id, email, "fullName", "monthlyIncome"::float, "payCycleDay"
      FROM "User"
      WHERE "isOnboarded" = true
    `);

    const results = [];

    for (const user of usersRes.rows) {
      try {
        const rolloverSummary = await withTransaction(async (client) => {
          const todayRes = await client.query(`
            SELECT COALESCE(SUM(amount), 0)::float as "spentToday"
            FROM "Transaction"
            WHERE "userId" = $1 AND type = 'EXPENSE' AND DATE("transactionDate") = CURRENT_DATE
          `, [user.id]);
          const spentToday = todayRes.rows[0].spentToday;

          const accRes = await client.query(`
            SELECT id, balance::float FROM "Account"
            WHERE "userId" = $1 AND "isDefault" = true
            LIMIT 1
          `, [user.id]);

          const primaryBalance = accRes.rows.length ? accRes.rows[0].balance : 0;
          const nominalSafeDaily = Math.max(100, Math.round(primaryBalance / 30));
          const unspentAllocation = Math.max(0, nominalSafeDaily - spentToday);

          await client.query(`
            INSERT INTO "AuditLog" (id, "userId", action, "ipAddress", "userAgent", metadata, timestamp)
            VALUES (gen_random_uuid(), $1, 'DAILY_ROLLOVER', '127.0.0.1', 'CronWorker', $2, NOW())
          `, [
            user.id,
            JSON.stringify({
              spentToday,
              nominalSafeDaily,
              unspentAllocation,
              rolloverDate: new Date().toISOString(),
              status: "COMPLETED"
            })
          ]);

          return {
            userId: user.id,
            email: user.email,
            spentToday,
            unspentAllocation,
            status: "SUCCESS"
          };
        });

        await invalidateCache(`spendpace:dashboard:${user.id}`);
        results.push(rolloverSummary);
      } catch (userErr) {
        console.error(`Daily rollover error for user ${user.id}:`, userErr.message);
        results.push({ userId: user.id, error: userErr.message, status: "FAILED" });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processedCount: results.length,
      results,
    });
  } catch (error) {
    console.error("Daily rollover master error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
