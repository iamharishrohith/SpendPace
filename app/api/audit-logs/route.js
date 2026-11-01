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

    const parsedLogs = res.rows.map(row => {
      let meta = row.metadata;
      if (typeof meta === "string") {
        try { meta = JSON.parse(meta); } catch (e) {}
      }
      return {
        ...row,
        metadata: meta
      };
    });

    if (format === "download") {
      const exportJson = JSON.stringify({
        exportedAt: new Date().toISOString(),
        user: { id: user.id, email: user.email, name: user.fullName },
        logs: parsedLogs
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
      count: parsedLogs.length,
      logs: parsedLogs
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

    const clientMetadata = typeof metadata === "object" && metadata !== null ? { ...metadata } : { raw: metadata };
    if (!clientMetadata.timestampIST) {
      clientMetadata.timestampIST = new Date(Date.now() + 19800000).toISOString().replace("T", " ").replace("Z", " IST");
    }

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
      JSON.stringify(clientMetadata)
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
