import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import dns from "dns";
import { getAuthenticatedUser, unauthorizedResponse, escapeHtml } from "@/lib/auth";

function isPrivateOrLoopbackIp(ip) {
  if (!ip) return true;
  if (ip.startsWith("127.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip.startsWith("10.")) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip === "0.0.0.0" || ip === "255.255.255.255") return true;
  if (ip === "::1" || ip === "::") return true;
  const lower = ip.toLowerCase();
  if (lower.startsWith("fe80:") || lower.startsWith("fc00:") || lower.startsWith("fd00:")) return true;
  return false;
}

export async function validateSmtpTarget(host, port) {
  const cleanHost = (host || "").trim().toLowerCase();
  if (!cleanHost) return "Host is required";
  
  if (
    cleanHost === "localhost" ||
    cleanHost.endsWith(".localhost") ||
    cleanHost.endsWith(".internal") ||
    cleanHost.endsWith(".local") ||
    cleanHost.endsWith(".corp") ||
    cleanHost.endsWith(".lan") ||
    cleanHost.endsWith(".home") ||
    cleanHost.endsWith(".arpa") ||
    cleanHost === "169.254.169.254"
  ) {
    return "Target host is prohibited for security reasons (private or loopback network).";
  }

  const allowedPorts = [25, 465, 587, 2525];
  if (!allowedPorts.includes(port)) {
    return `Invalid SMTP port ${port}. Permitted ports are: ${allowedPorts.join(", ")}`;
  }

  if (isPrivateOrLoopbackIp(cleanHost)) {
    return "Target host is prohibited (resolves to private or internal network).";
  }

  try {
    const lookup = await dns.promises.lookup(cleanHost, { all: true });
    for (const address of lookup) {
      if (isPrivateOrLoopbackIp(address.address)) {
        return `Target host resolved to a prohibited private network address (${address.address}).`;
      }
    }
  } catch (dnsErr) {
    return `Unable to resolve host ${cleanHost}: ${dnsErr.message}`;
  }

  return null;
}

// Ensure SMTP and report configuration columns exist in User table
async function ensureSmtpColumns() {
  await query(`
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
  `);
}

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return unauthorizedResponse();

    await ensureSmtpColumns();

    const res = await query(`
      SELECT 
        id, email, "fullName",
        COALESCE("smtpHost", '') as "smtpHost",
        COALESCE("smtpPort", 587) as "smtpPort",
        COALESCE("smtpUser", '') as "smtpUser",
        CASE WHEN "smtpPass" IS NOT NULL AND length("smtpPass") > 0 THEN true ELSE false END as "hasPassword",
        COALESCE("smtpFrom", '') as "smtpFrom",
        COALESCE("smtpSecure", false) as "smtpSecure",
        COALESCE("emailWeeklyReport", true) as "emailWeeklyReport",
        COALESCE("emailMonthlyReport", true) as "emailMonthlyReport",
        COALESCE("reportRecipientEmail", '') as "reportRecipientEmail",
        "lastWeeklyReportSentAt",
        "lastMonthlyReportSentAt"
      FROM "User"
      WHERE id = $1
    `, [user.id]);

    const row = res.rows[0] || {};
    const systemConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

    return NextResponse.json({
      success: true,
      config: {
        smtpHost: row.smtpHost || (systemConfigured ? process.env.SMTP_HOST : ""),
        smtpPort: row.smtpPort || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587),
        smtpUser: row.smtpUser || (systemConfigured ? process.env.SMTP_USER : ""),
        smtpFrom: row.smtpFrom || (process.env.SMTP_FROM || '"SpendPace Reports" <notifications@spendpace.com>'),
        smtpSecure: Boolean(row.smtpSecure),
        hasPassword: Boolean(row.hasPassword || process.env.SMTP_PASS),
        emailWeeklyReport: row.emailWeeklyReport !== false,
        emailMonthlyReport: row.emailMonthlyReport !== false,
        reportRecipientEmail: row.reportRecipientEmail || row.email || "",
        lastWeeklyReportSentAt: row.lastWeeklyReportSentAt,
        lastMonthlyReportSentAt: row.lastMonthlyReportSentAt,
      },
      systemConfigured,
      accountEmail: row.email || "",
    });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED") throw err;
    console.error("SMTP config GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return unauthorizedResponse();

    await ensureSmtpColumns();

    const body = await req.json();
    const action = body.action || "save";

    // 1. Action: Test SMTP connection and dispatch verification email
    if (action === "test") {
      const host = body.smtpHost?.trim() || process.env.SMTP_HOST || "";
      const port = parseInt(body.smtpPort || process.env.SMTP_PORT || "587", 10);
      const userAuth = body.smtpUser?.trim() || process.env.SMTP_USER || "";
      let pass = body.smtpPass?.trim();
      const secure = body.smtpSecure === true || port === 465;
      const from = body.smtpFrom?.trim() || process.env.SMTP_FROM || '"SpendPace Test" <notifications@spendpace.com>';
      const toEmail = body.reportRecipientEmail?.trim() || user.email;

      // If user did not provide a password in the test request, check if one is saved in DB
      if (!pass) {
        const pRes = await query(`SELECT "smtpPass" FROM "User" WHERE id = $1`, [user.id]);
        pass = pRes.rows[0]?.smtpPass || process.env.SMTP_PASS || "";
      }

      if (!host || !userAuth || !pass) {
        return NextResponse.json({
          success: false,
          error: "Incomplete SMTP settings. Host, Username, and Password are required to test connection.",
        }, { status: 400 });
      }

      // SSRF Protection: Validate target host is not a private IP, loopback, or metadata endpoint
      const targetError = await validateSmtpTarget(host, port);
      if (targetError) {
        return NextResponse.json({ success: false, error: targetError }, { status: 400 });
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user: userAuth, pass },
        connectionTimeout: 10000,
      });

      await transporter.verify();

      const testHtml = `
        <div style="font-family: -apple-system, sans-serif; background: #0B0C10; color: #FFFFFF; padding: 24px; border-radius: 14px; max-width: 520px;">
          <h2 style="color: #10B981; margin-top: 0;">✓ SpendPace SMTP Connected!</h2>
          <p style="color: #94A3B8; font-size: 13px; line-height: 1.5;">
            This email confirms that your custom SMTP server (<strong>${escapeHtml(host)}:${port}</strong>) is verified and ready for automated weekly and monthly financial digests.
          </p>
          <div style="padding: 12px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); border-radius: 8px; font-size: 12px;">
            Recipient: <strong>${escapeHtml(toEmail)}</strong><br/>
            Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </div>
        </div>
      `;

      await transporter.sendMail({
        from,
        to: toEmail,
        subject: "SpendPace SMTP Connection Test - Success",
        html: testHtml,
      });

      return NextResponse.json({
        success: true,
        message: `SMTP verified! A test confirmation email was dispatched to ${toEmail}.`,
      });
    }

    // 2. Action: Save SMTP Configuration
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

    const cleanPort = parseInt(smtpPort, 10) || 587;
    const cleanRecipient = reportRecipientEmail.trim() || user.email;

    if (smtpHost.trim()) {
      const saveTargetError = await validateSmtpTarget(smtpHost.trim(), cleanPort);
      if (saveTargetError) {
        return NextResponse.json({ success: false, error: saveTargetError }, { status: 400 });
      }
    }

    // Only update smtpPass if non-empty string provided (preserves existing password)
    if (smtpPass && smtpPass.trim().length > 0) {
      await query(`
        UPDATE "User"
        SET 
          "smtpHost" = $1,
          "smtpPort" = $2,
          "smtpUser" = $3,
          "smtpPass" = $4,
          "smtpFrom" = $5,
          "smtpSecure" = $6,
          "emailWeeklyReport" = $7,
          "emailMonthlyReport" = $8,
          "reportRecipientEmail" = $9,
          "updatedAt" = NOW()
        WHERE id = $10
      `, [
        smtpHost.trim(),
        cleanPort,
        smtpUser.trim(),
        smtpPass.trim(),
        smtpFrom.trim(),
        Boolean(smtpSecure),
        Boolean(emailWeeklyReport),
        Boolean(emailMonthlyReport),
        cleanRecipient,
        user.id,
      ]);
    } else {
      await query(`
        UPDATE "User"
        SET 
          "smtpHost" = $1,
          "smtpPort" = $2,
          "smtpUser" = $3,
          "smtpFrom" = $4,
          "smtpSecure" = $5,
          "emailWeeklyReport" = $6,
          "emailMonthlyReport" = $7,
          "reportRecipientEmail" = $8,
          "updatedAt" = NOW()
        WHERE id = $9
      `, [
        smtpHost.trim(),
        cleanPort,
        smtpUser.trim(),
        smtpFrom.trim(),
        Boolean(smtpSecure),
        Boolean(emailWeeklyReport),
        Boolean(emailMonthlyReport),
        cleanRecipient,
        user.id,
      ]);
    }

    return NextResponse.json({
      success: true,
      message: "SMTP configuration and automated report schedules saved successfully.",
      config: {
        smtpHost: smtpHost.trim(),
        smtpPort: cleanPort,
        smtpUser: smtpUser.trim(),
        smtpFrom: smtpFrom.trim(),
        smtpSecure: Boolean(smtpSecure),
        emailWeeklyReport: Boolean(emailWeeklyReport),
        emailMonthlyReport: Boolean(emailMonthlyReport),
        reportRecipientEmail: cleanRecipient,
      },
    });
  } catch (err) {
    if (err.digest === "NEXT_PRERENDER_INTERRUPTED") throw err;
    console.error("SMTP config POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
