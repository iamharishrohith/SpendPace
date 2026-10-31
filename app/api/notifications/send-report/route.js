import { query } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getAuthenticatedUser, unauthorizedResponse, escapeHtml } from "@/lib/auth";

export async function POST(req) {
  try {
    const userAuth = await getAuthenticatedUser(req);
    if (!userAuth) return unauthorizedResponse();

    const userId = userAuth.id;
    const body = await req.json().catch(() => ({}));
    const reportType = (body.type || "weekly").toLowerCase(); // "weekly" | "monthly"

    // 1. Fetch comprehensive user profile, transactions, goals, and liabilities
    const [userRes, txRes, goalRes, liabRes] = await Promise.all([
      query(`
        SELECT 
          id, email, "fullName", "monthlyIncome"::float, "spouseIncome"::float, 
          "otherIncome"::float, COALESCE("partTimeIncome", 0)::float as "partTimeIncome",
          "baseCurrency", "payCycleDay",
          COALESCE("smtpHost", '') as "smtpHost",
          COALESCE("smtpPort", 587) as "smtpPort",
          COALESCE("smtpUser", '') as "smtpUser",
          "smtpPass",
          COALESCE("smtpFrom", '') as "smtpFrom",
          COALESCE("smtpSecure", false) as "smtpSecure",
          COALESCE("reportRecipientEmail", '') as "reportRecipientEmail"
        FROM "User" 
        WHERE id = $1
      `, [userId]),
      query(`
        SELECT t.id, t.description, t.amount::float, t.type, t."transactionDate", c.name as category
        FROM "Transaction" t
        LEFT JOIN "Category" c ON t."categoryId" = c.id
        WHERE t."userId" = $1
        ORDER BY t."transactionDate" DESC
        LIMIT 100
      `, [userId]),
      query(`SELECT id, title, category, "targetAmount"::float, "currentAmount"::float, "targetDate" FROM "Goal" WHERE "userId" = $1 ORDER BY priority ASC LIMIT 5`, [userId]),
      query(`SELECT id, name, category, "monthlyPayment"::float FROM "Liability" WHERE "userId" = $1`, [userId]),
    ]);

    const user = userRes.rows[0] || {};
    const allTransactions = txRes.rows || [];
    const goals = goalRes.rows || [];
    const liabilities = liabRes.rows || [];

    const currency = user.baseCurrency || "INR";
    const userName = user.fullName || "SpendPace User";
    const userEmail = body.recipient?.trim() || user.reportRecipientEmail || user.email;

    const monthlyIncome = parseFloat(user.monthlyIncome) || 0;
    const spouseIncome = parseFloat(user.spouseIncome) || 0;
    const partTimeIncome = parseFloat(user.partTimeIncome) || 0;
    const otherIncome = parseFloat(user.otherIncome) || 0;
    const totalInflow = monthlyIncome + spouseIncome + partTimeIncome + otherIncome;
    const committedBills = liabilities.reduce((sum, l) => sum + (parseFloat(l.monthlyPayment) || 0), 0);
    const monthlyPiggyBank = Math.round(totalInflow * 0.10); // 10% autonomous reserve
    const remainingDiscretionary = Math.max(0, totalInflow - committedBills - monthlyPiggyBank);
    const safeDaily = Math.round(remainingDiscretionary / 30);

    let htmlEmail = "";
    let subject = "";

    // -------------------------------------------------------------
    // A. WEEKLY DIGEST (Past 7 Days Focus)
    // -------------------------------------------------------------
    if (reportType === "weekly") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weeklyTxs = allTransactions.filter(t => new Date(t.transactionDate) >= sevenDaysAgo);
      const total7DaySpent = weeklyTxs.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
      const total7DayIncome = weeklyTxs.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
      const avgDailySpent = Math.round(total7DaySpent / 7);
      const paceStatus = avgDailySpent <= safeDaily ? "HEALTHY & OPTIMAL" : "ELEVATED BURN";

      const categoryTotals = {};
      weeklyTxs.filter(t => t.type === "EXPENSE").forEach(t => {
        const cat = t.category || "General";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
      });

      const topCats = Object.entries(categoryTotals)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 4);

      subject = `SpendPace Weekly Financial Digest - ${paceStatus}`;

      htmlEmail = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Weekly Digest</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A0D14; color: #FFFFFF; padding: 24px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #12151E; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 26px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF;">SPENDPACE</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9);">Autonomous Weekly Financial Digest & Runway Radar</p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 15px; font-weight: 700; color: #FFFFFF; margin-top: 0;">
                Hello ${escapeHtml(userName)},
              </p>
              <p style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
                Here is your automated 7-day spending velocity report. Your pace is currently 
                <strong style="color: ${paceStatus === "HEALTHY & OPTIMAL" ? "#10B981" : "#EF4444"};">${paceStatus}</strong>.
              </p>

              <!-- Metrics Row -->
              <table style="width: 100%; border-collapse: separate; border-spacing: 10px 0; margin: 20px 0;">
                <tr>
                  <td style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); width: 50%;">
                    <div style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase;">7-Day Outflow</div>
                    <div style="font-size: 20px; font-weight: 900; color: #F43F5E; margin-top: 4px;">${formatCurrency(total7DaySpent, currency)}</div>
                    <div style="font-size: 11px; color: #64748B;">Avg ${formatCurrency(avgDailySpent, currency)}/day</div>
                  </td>
                  <td style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); width: 50%;">
                    <div style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase;">Safe Daily Limit</div>
                    <div style="font-size: 20px; font-weight: 900; color: #10B981; margin-top: 4px;">${formatCurrency(safeDaily, currency)}/day</div>
                    <div style="font-size: 11px; color: #64748B;">Protected Discretionary</div>
                  </td>
                </tr>
              </table>

              <!-- Category Outflows -->
              ${topCats.length > 0 ? `
                <div style="margin-top: 18px;">
                  <h3 style="font-size: 11px; font-weight: 800; color: #10B981; text-transform: uppercase; margin-bottom: 8px;">Top Spend Categories (Past 7 Days)</h3>
                  ${topCats.map(c => `
                    <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: 8px; margin-bottom: 6px; font-size: 12px;">
                      <span style="color: #FFFFFF; font-weight: 600;">${escapeHtml(c.name)}</span>
                      <span style="color: #F43F5E; font-weight: 700;">${formatCurrency(c.amount, currency)}</span>
                    </div>
                  `).join("")}
                </div>
              ` : ""}

              <!-- Active Goals -->
              ${goals.length > 0 ? `
                <div style="margin-top: 18px;">
                  <h3 style="font-size: 11px; font-weight: 800; color: #3B82F6; text-transform: uppercase; margin-bottom: 8px;">Active Goals Progress</h3>
                  ${goals.map(g => {
                    const pct = Math.min(100, Math.round((g.currentAmount / (g.targetAmount || 1)) * 100));
                    return `
                      <div style="padding: 10px 12px; background: rgba(255,255,255,0.02); border-radius: 10px; margin-bottom: 6px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #FFFFFF;">
                          <span>${escapeHtml(g.title)}</span>
                          <span style="color: #10B981;">${pct}%</span>
                        </div>
                        <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">${formatCurrency(g.currentAmount, currency)} of ${formatCurrency(g.targetAmount, currency)}</div>
                      </div>
                    `;
                  }).join("")}
                </div>
              ` : ""}

              <div style="margin-top: 22px; padding: 14px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); border-radius: 12px; font-size: 12px; color: #E2E8F0; line-height: 1.5;">
                💡 <strong>Weekly Recommendation:</strong> Log micro-spends instantly via OCR receipt scanner or quick-log. Surplus under daily safe pace automatically compounds into next week's runway.
              </div>
            </div>
            <div style="padding: 16px; background-color: #0A0D14; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.06);">
              SpendPace Autonomous Cashflow Engine • Automated Weekly Digest
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // -------------------------------------------------------------
    // B. MONTHLY STATEMENT (Full Cycle & Restructuring Focus)
    // -------------------------------------------------------------
    else {
      const monthExpenses = allTransactions.filter(t => t.type === "EXPENSE");
      const totalMonthSpent = monthExpenses.reduce((s, t) => s + t.amount, 0);
      const cycleNetSavings = Math.max(0, totalInflow - committedBills - totalMonthSpent);

      const categoryMap = {};
      monthExpenses.forEach(t => {
        const cat = t.category || "General";
        categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      });

      const topCats = Object.entries(categoryMap)
        .map(([name, amount]) => ({
          name,
          amount,
          percent: totalMonthSpent > 0 ? Math.round((amount / totalMonthSpent) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      subject = `SpendPace Monthly Statement & Financial Runway Analysis`;

      htmlEmail = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Monthly Statement</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A0D14; color: #FFFFFF; padding: 24px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #12151E; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF;">SPENDPACE</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9);">Monthly Financial Statement & Allocation Ledger</p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 15px; font-weight: 700; color: #FFFFFF; margin-top: 0;">
                Hello ${escapeHtml(userName)},
              </p>
              <p style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
                Here is your comprehensive monthly financial statement synthesized from your encrypted PostgreSQL ledger.
              </p>

              <!-- Monthly Summary Table -->
              <div style="margin: 20px 0; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden;">
                <div style="padding: 12px 16px; background: rgba(255,255,255,0.04); font-size: 11px; font-weight: 800; color: #3B82F6; text-transform: uppercase;">
                  CYCLE CASHFLOW OVERVIEW
                </div>
                <div style="padding: 14px 16px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="font-size: 13px; color: #94A3B8;">Total Household Inflows:</span>
                  <span style="font-size: 13px; font-weight: 800; color: #10B981;">+${formatCurrency(totalInflow, currency)}</span>
                </div>
                <div style="padding: 14px 16px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="font-size: 13px; color: #94A3B8;">Committed Fixed EMIs:</span>
                  <span style="font-size: 13px; font-weight: 800; color: #F59E0B;">-${formatCurrency(committedBills, currency)}</span>
                </div>
                <div style="padding: 14px 16px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="font-size: 13px; color: #94A3B8;">Piggy Bank Future Savings (10%):</span>
                  <span style="font-size: 13px; font-weight: 800; color: #EC4899;">-${formatCurrency(monthlyPiggyBank, currency)}</span>
                </div>
                <div style="padding: 14px 16px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="font-size: 13px; color: #94A3B8;">Recorded Discretionary Outflow:</span>
                  <span style="font-size: 13px; font-weight: 800; color: #F43F5E;">-${formatCurrency(totalMonthSpent, currency)}</span>
                </div>
                <div style="padding: 14px 16px; display: flex; justify-content: space-between; background: rgba(16,185,129,0.05);">
                  <span style="font-size: 14px; font-weight: 800; color: #FFFFFF;">Net Cycle Surplus / Runway:</span>
                  <span style="font-size: 14px; font-weight: 900; color: #10B981;">+${formatCurrency(cycleNetSavings, currency)}</span>
                </div>
              </div>

              <!-- Top Categories -->
              ${topCats.length > 0 ? `
                <div style="margin-top: 20px;">
                  <h3 style="font-size: 11px; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 10px;">Monthly Expenditure Breakdown</h3>
                  ${topCats.map(c => `
                    <div style="margin-bottom: 8px;">
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                        <span style="color: #FFFFFF; font-weight: 600;">${escapeHtml(c.name)}</span>
                        <span style="color: #94A3B8;">${formatCurrency(c.amount, currency)} (${c.percent}%)</span>
                      </div>
                      <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${c.percent}%; height: 100%; background: #3B82F6; border-radius: 4px;"></div>
                      </div>
                    </div>
                  `).join("")}
                </div>
              ` : ""}

              <div style="margin-top: 22px; padding: 14px; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.25); border-radius: 12px; font-size: 12px; color: #E2E8F0; line-height: 1.5;">
                📊 <strong>Autonomous Restructuring Insight:</strong> Safe discretionary pacing is calibrated at <strong>${formatCurrency(safeDaily, currency)}/day</strong>. Adhering to this limit protects your emergency buffer and compounds your 6-month wealth trajectory.
              </div>
            </div>
            <div style="padding: 16px; background-color: #0A0D14; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.06);">
              SpendPace Autonomous Cashflow Engine • Verified Monthly Statement
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // 2. Resolve SMTP Transporter
    const host = user.smtpHost || process.env.SMTP_HOST || "";
    const port = parseInt(user.smtpPort || process.env.SMTP_PORT || "587", 10);
    const smtpUser = user.smtpUser || process.env.SMTP_USER || "";
    const smtpPass = user.smtpPass || process.env.SMTP_PASS || "";
    const smtpFrom = user.smtpFrom || process.env.SMTP_FROM || '"SpendPace Reports" <notifications@spendpace.com>';
    const secure = Boolean(user.smtpSecure || port === 465);

    let smtpSent = false;
    let smtpError = null;

    if (host && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 12000,
        });

        await transporter.sendMail({
          from: smtpFrom,
          to: userEmail,
          subject,
          html: htmlEmail,
        });

        smtpSent = true;

        // Record timestamp in DB
        if (reportType === "weekly") {
          await query(`UPDATE "User" SET "lastWeeklyReportSentAt" = NOW() WHERE id = $1`, [userId]);
        } else {
          await query(`UPDATE "User" SET "lastMonthlyReportSentAt" = NOW() WHERE id = $1`, [userId]);
        }
      } catch (err) {
        console.error(`SMTP ${reportType} delivery error:`, err);
        smtpError = err.message;
      }
    } else {
      smtpError = "SMTP credentials not configured on backend. Digest synthesized in preview mode.";
    }

    return NextResponse.json({
      success: true,
      reportType,
      recipient: userEmail,
      smtpSent,
      smtpError,
      message: smtpSent 
        ? `${reportType === "weekly" ? "Weekly digest" : "Monthly statement"} successfully dispatched via SMTP to ${userEmail}` 
        : `${reportType === "weekly" ? "Weekly digest" : "Monthly statement"} synthesized successfully for ${userEmail} (Preview ready)`,
      previewHtml: htmlEmail,
    });
  } catch (error) {
    if (error.digest === "NEXT_PRERENDER_INTERRUPTED") throw error;
    console.error("Report dispatch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
