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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const format = searchParams.get("format") || "json";

    const res = await query(`
      SELECT 
        id, 
        action, 
        "ipAddress", 
        "userAgent", 
        metadata, 
        timestamp
      FROM "AuditLog"
      WHERE "userId" = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `, [userId, limit]);

    if (format === "download") {
      const exportJson = JSON.stringify({
        exportedAt: new Date().toISOString(),
        user: { id: user.id, email: user.email, name: user.fullName },
        logs: res.rows
      }, null, 2);

      return new Response(exportJson, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="spendpace-audit-logs-${Date.now()}.json"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      count: res.rows.length,
      logs: res.rows
    });
  } catch (error) {
    console.error("Audit logs GET error:", error);
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
    const { action = "CLIENT_EVENT", metadata = {} } = body;

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ua = req.headers.get("user-agent") || "SpendPaceApp";

    const res = await query(`
      INSERT INTO "AuditLog" (id, "userId", action, "ipAddress", "userAgent", metadata, timestamp)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
      RETURNING id, action, metadata, timestamp
    `, [
      userId,
      typeof action === "string" ? action.substring(0, 100) : "EVENT",
      typeof ip === "string" ? ip.split(",")[0].trim() : "127.0.0.1",
      typeof ua === "string" ? ua.substring(0, 255) : "App",
      JSON.stringify(metadata)
    ]);

    return NextResponse.json({
      success: true,
      log: res.rows[0]
    });
  } catch (error) {
    console.error("Audit logs POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
