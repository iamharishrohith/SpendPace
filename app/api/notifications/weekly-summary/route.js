import { query } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    let userId = null;
    const cookie = req.cookies.get("spendpace_session")?.value;
    if (cookie) {
      try {
        const session = JSON.parse(cookie);
        userId = session.userId;
      } catch (e) {}
    }

    if (!userId) {
      const firstUser = await query('SELECT id FROM "User" ORDER BY "createdAt" DESC LIMIT 1');
      if (firstUser.rows.length > 0) userId = firstUser.rows[0].id;
      else return NextResponse.json({ error: "User unauthorized" }, { status: 401 });
    }

    // 1. Fetch user data, transactions for the past 7 days, goals and liabilities
    const [userRes, txRes, goalRes, liabRes] = await Promise.all([
      query('SELECT id, email, "fullName", "monthlyIncome"::float, "baseCurrency", "payCycleDay" FROM "User" WHERE id = $1', [userId]),
      query('SELECT description, amount::float, type, "transactionDate", source FROM "Transaction" WHERE "userId" = $1 AND "transactionDate" >= NOW() - INTERVAL \'7 days\' ORDER BY "transactionDate" DESC', [userId]),
      query('SELECT title, "targetAmount"::float, "currentAmount"::float, "targetDate" FROM "Goal" WHERE "userId" = $1 ORDER BY priority ASC LIMIT 3', [userId]),
      query('SELECT name, "monthlyPayment"::float FROM "Liability" WHERE "userId" = $1', [userId]),
    ]);

    const user = userRes.rows[0] || {};
    const transactions = txRes.rows || [];
    const goals = goalRes.rows || [];
    const liabilities = liabRes.rows || [];

    const currency = user.baseCurrency || "INR";
    const userEmail = user.email || "user@example.com";
    const userName = user.fullName || "SpendPace User";

    const total7DaySpent = transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
    const total7DayIncome = transactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
    const avgDailySpent = Math.round(total7DaySpent / 7);

    const totalDebt = liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);
    const monthlyIncome = user.monthlyIncome || 0;
    const discretionaryPool = Math.max(0, monthlyIncome - totalDebt - 22000);
    const safeDaily = Math.round(discretionaryPool / 30);
    const paceStatus = avgDailySpent <= safeDaily ? "HEALTHY & DISCIPLINED" : "ELEVATED BURN";

    // 2. Prepare HTML Email Digest
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>SpendPace Weekly Financial Digest</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B0C10; color: #FFFFFF; padding: 24px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #12141A; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 28px 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF;">SPENDPACE</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85);">Autonomous Weekly Financial Digest & Runway Radar</p>
          </div>

          <!-- Body -->
          <div style="padding: 24px;">
            <p style="font-size: 15px; font-weight: 700; color: #FFFFFF; margin-top: 0;">
              Hello ${userName},
            </p>
            <p style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
              Here is your verified weekly financial telemetry for the past 7 days. Your spend pace velocity is categorized as 
              <strong style="color: ${paceStatus === "HEALTHY & DISCIPLINED" ? "#10B981" : "#EF4444"};">${paceStatus}</strong>.
            </p>

            <!-- Metrics Grid -->
            <div style="display: table; width: 100%; margin: 20px 0;">
              <div style="display: table-row;">
                <div style="display: table-cell; width: 50%; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
                  <span style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase;">7-Day Outflow</span>
                  <div style="font-size: 18px; font-weight: 900; color: #F43F5E; margin-top: 4px;">${formatCurrency(total7DaySpent, currency)}</div>
                  <span style="font-size: 11px; color: #64748B;">Avg ${formatCurrency(avgDailySpent, currency)}/day</span>
                </div>
                <div style="display: table-cell; width: 4%;"></div>
                <div style="display: table-cell; width: 46%; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
                  <span style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase;">Safe Velocity Limit</span>
                  <div style="font-size: 18px; font-weight: 900; color: #10B981; margin-top: 4px;">${formatCurrency(safeDaily, currency)}/day</div>
                  <span style="font-size: 11px; color: #64748B;">Protected Runway</span>
                </div>
              </div>
            </div>

            <!-- Active Goals -->
            ${goals.length > 0 ? `
              <div style="margin-top: 20px;">
                <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #94A3B8; margin-bottom: 8px;">Savings Goals Progress</h3>
                ${goals.map(g => {
                  const pct = Math.min(100, Math.round((g.currentAmount / (g.targetAmount || 1)) * 100));
                  return `
                    <div style="padding: 10px 12px; background: rgba(255,255,255,0.02); border-radius: 10px; margin-bottom: 6px;">
                      <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #FFFFFF;">
                        <span>${g.title}</span>
                        <span style="color: #10B981;">${pct}%</span>
                      </div>
                      <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">${formatCurrency(g.currentAmount, currency)} of ${formatCurrency(g.targetAmount, currency)}</div>
                    </div>
                  `;
                }).join("")}
              </div>
            ` : ""}

            <div style="margin-top: 24px; padding: 14px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; font-size: 12px; color: #E2E8F0; line-height: 1.5;">
              💡 <strong>Pace Recommendation:</strong> Log daily micro-spends as soon as you tap UPI or scan receipts. Every rupee saved under your safe limit rolls over automatically.
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://spendpace.vercel.app/dashboard" style="display: inline-block; padding: 12px 28px; background-color: #10B981; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 800; border-radius: 12px;">Open SpendPace Dashboard</a>
            </div>
          </div>

          <div style="padding: 16px; background-color: #0B0C10; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.06);">
            SpendPace Autonomous Cashflow Engine • Verified PostgreSQL Ledger
          </div>
        </div>
      </body>
      </html>
    `;

    // 3. Configure SMTP Transporter
    const smtpHost = process.env.SMTP_HOST || "";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";
    const smtpFrom = process.env.SMTP_FROM || '"SpendPace" <notifications@spendpace.com>';

    let smtpSent = false;
    let smtpError = null;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: smtpFrom,
          to: userEmail,
          subject: `SpendPace Weekly Financial Summary - ${paceStatus}`,
          html: htmlEmail,
        });

        smtpSent = true;
      } catch (err) {
        console.error("SMTP delivery error:", err);
        smtpError = err.message;
      }
    } else {
      smtpError = "SMTP credentials not configured. Digest generated in preview mode.";
    }

    return NextResponse.json({
      success: true,
      recipient: userEmail,
      smtpSent,
      smtpError,
      summary: {
        total7DaySpent,
        total7DayIncome,
        avgDailySpent,
        safeDaily,
        paceStatus,
        transactionCount: transactions.length,
      },
      previewHtml: htmlEmail,
      message: smtpSent 
        ? `Weekly summary email dispatched via SMTP to ${userEmail}` 
        : `Weekly digest synthesized successfully for ${userEmail} (Preview ready)`,
    });
  } catch (error) {
    console.error("Weekly summary error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
