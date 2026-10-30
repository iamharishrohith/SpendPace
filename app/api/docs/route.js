import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "SpendPace Autonomous Finance API",
      version: "1.1.0",
      description: "Full-stack API specification for SpendPace - AI-Powered Personal Finance Manager with Smart Budgeting and Expense Forecasting.",
      contact: {
        name: "SpendPace Engineering",
        url: "https://spendpace.vercel.app",
      },
    },
    servers: [
      { url: "https://spendpace.vercel.app", description: "Production Cloud Server" },
      { url: "http://localhost:3000", description: "Local Development Server" },
    ],
    paths: {
      "/api/auth": {
        post: {
          summary: "Register or Authenticate User",
          description: "Performs email validation, rate limiting, password validation, and provisions default accounts.",
          responses: { "200": { description: "Authentication successful, session cookie set" } },
        },
      },
      "/api/dashboard": {
        get: {
          summary: "Consolidated Dashboard Telemetry",
          description: "Sub-15ms cached response delivering real-time safe daily pace, accounts, liabilities, goals, and transactions.",
          responses: { "200": { description: "Full dashboard state" } },
        },
      },
      "/api/budgets": {
        get: {
          summary: "Get Category Budgets",
          description: "Returns allocated limits, live spent amount, remaining headroom, and over-budget burn status.",
          responses: { "200": { description: "List of category budgets" } },
        },
        post: {
          summary: "Create or Update Monthly Category Budget",
          description: "Upserts monthly allocated limit and alert threshold for a specific category.",
          responses: { "200": { description: "Budget upserted successfully" } },
        },
      },
      "/api/transactions": {
        get: { summary: "Fetch Transactions Ledger" },
        post: { summary: "Log Single Expense or Income Record" },
      },
      "/api/ocr": {
        post: {
          summary: "Vision Multimodal Receipt Scanner",
          description: "Ingests base64 image or PDF receipts and parses merchant, amount, date, and category via Gemini Vision OCR.",
          responses: { "200": { description: "Extracted receipt payload" } },
        },
      },
      "/api/patterns": {
        get: {
          summary: "Spending Pattern Analyser & Calendar",
          description: "Computes 3-day micro-replenishment waves, weekend surge multiplier, and daily limit compliance.",
          responses: { "200": { description: "Pattern analytics payload" } },
        },
      },
      "/api/ai/diagnostics": {
        get: {
          summary: "AI Diagnostics & 6-Month Predictive Trajectory",
          description: "Generates financial health score, grade, cash leak alerts, and 6-month projected cumulative surplus.",
          responses: { "200": { description: "Diagnostic report" } },
        },
      },
      "/api/ai/chat": {
        post: {
          summary: "Pace Autonomous Copilot Chat",
          description: "Conversational cashflow advisor with autonomous expense and task logging capabilities.",
          responses: { "200": { description: "Copilot response with optional action execution" } },
        },
      },
      "/api/notifications/weekly-summary": {
        post: {
          summary: "Send Weekly Summary Email via SMTP",
          description: "Generates HTML weekly financial digest and dispatches via configured SMTP transporter.",
          responses: { "200": { description: "Email dispatch result" } },
        },
      },
      "/api/reports/monthly-pdf": {
        get: {
          summary: "Downloadable Monthly Financial Report",
          description: "Returns structured monthly statement data ready for printable PDF export.",
          responses: { "200": { description: "Monthly report statement" } },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
