"use client";

import React, { useState } from "react";
import { Download, Loader2, FileText, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DownloadMonthlyPdfBtn({ className = "" }) {
  const [downloading, setDownloading] = useState(false);

  const handleGeneratePdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/reports/monthly-pdf");
      if (!res.ok) throw new Error("Failed to generate report data");
      const report = await res.json();

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to download and print your Monthly Financial PDF Statement.");
        return;
      }

      const currency = report.user?.currency || "INR";
      const now = new Date(report.generatedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>SpendPace Monthly Financial Statement - ${report.reportMonth}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              margin: 0;
              padding: 0;
              font-size: 12px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #10B981;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .brand {
              font-size: 24px;
              font-weight: 900;
              letter-spacing: -0.5px;
              color: #10B981;
              margin: 0;
            }
            .brand-sub {
              font-size: 11px;
              color: #64748B;
              font-weight: 600;
              margin-top: 2px;
            }
            .doc-info {
              text-align: right;
              font-size: 11px;
              color: #475569;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 24px;
            }
            .kpi-card {
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 12px;
              background-color: #F8FAFC;
            }
            .kpi-label {
              font-size: 10px;
              font-weight: 700;
              color: #64748B;
              text-transform: uppercase;
            }
            .kpi-value {
              font-size: 16px;
              font-weight: 900;
              margin-top: 4px;
              color: #0F172A;
            }
            .section-title {
              font-size: 14px;
              font-weight: 800;
              color: #0F172A;
              border-bottom: 1px solid #E2E8F0;
              padding-bottom: 6px;
              margin-top: 20px;
              margin-bottom: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-bottom: 20px;
            }
            th {
              text-align: left;
              padding: 8px 10px;
              background-color: #F1F5F9;
              color: #475569;
              font-weight: 700;
              border-bottom: 1px solid #CBD5E1;
            }
            td {
              padding: 8px 10px;
              border-bottom: 1px solid #E2E8F0;
              color: #1E293B;
            }
            tr:nth-child(even) { background-color: #F8FAFC; }
            .badge-income { color: #10B981; font-weight: 700; }
            .badge-expense { color: #F43F5E; font-weight: 700; }
            .footer {
              margin-top: 30px;
              padding-top: 12px;
              border-top: 1px solid #E2E8F0;
              text-align: center;
              font-size: 10px;
              color: #94A3B8;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="brand">SPENDPACE</h1>
              <div class="brand-sub">Autonomous Personal Finance & Predictive Cashflow Statement</div>
              <div style="margin-top: 6px; font-weight: 700;">Account: ${report.user.name} (${report.user.email})</div>
            </div>
            <div class="doc-info">
              <div><strong>Statement Period:</strong> ${report.reportMonth}</div>
              <div><strong>Generated:</strong> ${now}</div>
              <div><strong>Status:</strong> Verified Cloud Ledger</div>
            </div>
          </div>

          <div class="grid">
            <div class="kpi-card">
              <div class="kpi-label">Total Monthly Inflow</div>
              <div class="kpi-value" style="color: #10B981;">${formatCurrency(report.summary.totalInflow, currency)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Committed Debt & EMIs</div>
              <div class="kpi-value" style="color: #F43F5E;">${formatCurrency(report.summary.totalDebt, currency)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Actual Spend</div>
              <div class="kpi-value" style="color: #6366F1;">${formatCurrency(report.summary.totalSpent, currency)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Net Projected Surplus</div>
              <div class="kpi-value" style="color: #10B981;">+${formatCurrency(report.summary.netSavings, currency)}</div>
            </div>
          </div>

          <div class="section-title">Category Spending Distribution</div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th style="text-align: right;">Spent Amount</th>
                <th style="text-align: right;">% of Total Outflow</th>
              </tr>
            </thead>
            <tbody>
              ${report.categoryBreakdown.length > 0 ? report.categoryBreakdown.map(c => `
                <tr>
                  <td><strong>${c.category}</strong></td>
                  <td style="text-align: right;">${formatCurrency(c.amount, currency)}</td>
                  <td style="text-align: right;">${c.percent}%</td>
                </tr>
              `).join("") : '<tr><td colspan="3" style="text-align: center; color: #94A3B8;">No expenses recorded this cycle</td></tr>'}
            </tbody>
          </table>

          <div class="section-title">Verified Transaction Log (Recent Records)</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${report.transactions.length > 0 ? report.transactions.map(t => `
                <tr>
                  <td>${new Date(t.transactionDate).toISOString().split('T')[0]}</td>
                  <td><strong>${t.description}</strong></td>
                  <td>${t.category || "General"}</td>
                  <td><span class="${t.type === 'INCOME' ? 'badge-income' : 'badge-expense'}">${t.type}</span></td>
                  <td style="text-align: right; font-weight: 700;">${formatCurrency(t.amount, currency)}</td>
                </tr>
              `).join("") : '<tr><td colspan="5" style="text-align: center; color: #94A3B8;">Zero transactions logged</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Generated autonomously by SpendPace Financial Intelligence Platform • Strict Postgres Verification • https://spendpace.vercel.app
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to compile monthly financial statement.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleGeneratePdf}
      disabled={downloading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all shadow-sm active:scale-95 disabled:opacity-50 ${className}`}
      title="Download Printable Monthly PDF Statement"
    >
      {downloading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      <span>{downloading ? "Compiling Statement..." : "Download Monthly PDF"}</span>
    </button>
  );
}
