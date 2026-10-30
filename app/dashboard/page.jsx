"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PaceRadar from "@/components/PaceRadar";
import BentoGrid from "@/components/BentoGrid";
import CommandBar from "@/components/CommandBar";
import ReceiptDropzone from "@/components/ReceiptDropzone";
import AddTransactionModal from "@/components/AddTransactionModal";
import BottomNav from "@/components/BottomNav";
import QuickSpendTracker from "@/components/QuickSpendTracker";
import FinancialNewsRadar from "@/components/FinancialNewsRadar";
import DownloadMonthlyPdfBtn from "@/components/DownloadMonthlyPdfBtn";
import GoalShortageAlert from "@/components/GoalShortageAlert";
import AIDiagnosticsCard from "@/components/AIDiagnosticsCard";
import AICashflowAdvisorModal from "@/components/AICashflowAdvisorModal";
import CartoonAIEyes from "@/components/CartoonAIEyes";
import { formatCurrency } from "@/lib/utils";
import { 
  Sparkles, 
  ArrowDownRight, 
  Plus, 
  Receipt,
  Layers,
  Inbox,
  Loader2,
  RefreshCw,
  Sliders,
  AlertTriangle,
  CalendarCheck,
  Handshake,
  ArrowRight,
  MessageSquare,
  Bot
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Hydrate instant SWR cache from localStorage on client mount to eliminate blank screen
  useEffect(() => {
    try {
      const cached = localStorage.getItem("spendpace_dashboard_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.metrics) {
          setData(parsed);
          setLoading(false);
        }
      }
    } catch (e) {}

    fetchDashboard();
  }, []);

  // Fetch live dashboard metrics & transactions from Prisma Postgres DB
  const fetchDashboard = async (retryCount = 0) => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `Failed to load dashboard data (HTTP ${res.status})`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
      // Persist to instant SWR cache
      try {
        localStorage.setItem("spendpace_dashboard_cache", JSON.stringify(json));
      } catch (e) {}
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (retryCount < 3) {
        const backoffMs = Math.min(1000 * Math.pow(1.5, retryCount), 3000);
        console.warn(`Retrying dashboard fetch (attempt ${retryCount + 1}/3 in ${Math.round(backoffMs)}ms)...`);
        setTimeout(() => fetchDashboard(retryCount + 1), backoffMs);
        return;
      }
      if (!data) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const currency = data?.user?.currency || "INR";
  const monthlyIncome = data?.metrics?.monthlyIncome || 0;
  const partTimeIncome = data?.metrics?.partTimeIncome || data?.user?.partTimeIncome || 0;
  const committedBills = data?.metrics?.committedBills || 0;
  const totalDebtMonthly = data?.metrics?.totalDebtMonthly || 0;
  const baselineLivingCost = data?.metrics?.baselineLivingCost || 0;
  const currentSpent = data?.metrics?.totalSpent || 0;
  const daysRemaining = data?.metrics?.daysRemaining || 1;
  const transactions = data?.transactions || [];
  const liabilities = data?.liabilities || [];
  const user = data?.user || {};

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC] dark:bg-[#0D0E12] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar 
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenCommandBar={() => setIsCommandBarOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                Live Cloud Engine • Prisma Postgres
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Pacing Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              Command Dashboard
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-slate-700 dark:text-slate-300">
                {user.maritalStatus || "Single"} • {user.occupationSubRole || user.occupationCategory || "Salaried"}
              </span>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Recalibrate Structure</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboard}
              aria-label="Refresh Data"
              className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowScanner(!showScanner)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-slate-700 dark:text-slate-200"
            >
              <Receipt className="w-4 h-4 text-emerald-500" />
              <span>{showScanner ? "Hide Scanner" : "Scan Receipt"}</span>
            </button>

            <DownloadMonthlyPdfBtn />

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Dynamic Scanner Dropzone Drawer */}
        {showScanner && (
          <div className="animate-in fade-in-0 duration-300">
            <ReceiptDropzone 
              onSuccess={fetchDashboard}
              currency={currency}
            />
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Loading verified database records...</p>
          </div>
        )}

        {/* Connection Error State with One-Click Retry */}
        {!loading && error && !data && (
          <div className="py-16 px-6 max-w-lg mx-auto text-center space-y-4 rounded-3xl bg-rose-500/5 border border-rose-500/20">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Database Sync Interrupted
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {error}
              </p>
            </div>
            <button
              onClick={() => fetchDashboard(0)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {!loading && data && (
          <>
            {/* Goal Shortage Risk Radar Alert */}
            {data.shortageAlert && (
              <GoalShortageAlert 
                alert={data.shortageAlert} 
                currency={currency} 
                onActionComplete={fetchDashboard} 
              />
            )}

            {/* The Precision Pace Radar Arc Component */}
            <PaceRadar 
              monthlyIncome={monthlyIncome}
              committedBills={committedBills}
              currentSpent={currentSpent}
              daysRemaining={daysRemaining}
              currency={currency}
              onRefresh={fetchDashboard}
            />

            {/* Zero-Typing Micro-Spend Quick Tracker */}
            <QuickSpendTracker onExpenseLogged={fetchDashboard} />

            {/* Temporal Patterns & Calendar Quick Gateway */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/patterns"
                className="group p-5 rounded-3xl fintech-card hover:border-emerald-500/50 transition-all flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Spending Pattern Analyser & Calendar
                      </h4>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Live Ledger
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Daily save ticks (✓), red over-limit tags, 3-day waves & weekend surge
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] group-hover:bg-emerald-500 group-hover:text-white text-slate-400 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link
                href="/settings"
                className="group p-5 rounded-3xl fintech-card hover:border-teal-500/50 transition-all flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
                    <Handshake className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Friends & Informal Money Lent
                      </h4>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20">
                        WhatsApp Nudge
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Manage friendly receivables, track frozen capital & send reminders
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] group-hover:bg-teal-500 group-hover:text-white text-slate-400 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>

            {/* SpendPace Deep Financial Diagnostics & Predictive Forecasting */}
            <AIDiagnosticsCard currency={currency} />

            {/* Bento Grid Analytics */}
            <BentoGrid 
              monthlyIncome={monthlyIncome}
              partTimeIncome={partTimeIncome}
              totalSpent={currentSpent}
              committedBills={committedBills}
              totalDebtMonthly={totalDebtMonthly}
              baselineLivingCost={baselineLivingCost}
              currency={currency}
              categories={data?.categories || []}
              liabilities={liabilities}
            />

            {/* Forward Cashflow Horizon & Pace Elasticity Radar */}
            <FinancialNewsRadar metrics={data.metrics} currency={currency} />

            {/* Real Transaction Stream (Zero Mock Data) */}
            <div className="rounded-3xl fintech-card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Verified Transaction Ledger
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live records persisted in Prisma Postgres
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <DownloadMonthlyPdfBtn />
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                    {transactions.length} Recorded
                  </span>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      No transactions recorded yet
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                      Your ledger is currently clean. Click <strong>Log Expense</strong> or drop a receipt to begin tracking your live daily pace.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                  >
                    + Add First Expense
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-black/5 dark:divide-white/5">
                  {transactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="py-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] px-3 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] flex items-center justify-center font-bold">
                          <ArrowDownRight className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {tx.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-medium">{tx.category || "General"}</span>
                            <span>•</span>
                            <span>{new Date(tx.transactionDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            {tx.source === "RECEIPT_OCR" && (
                              <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                                OCR
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-base sm:text-lg font-black text-rose-500">
                        -{formatCurrency(tx.amount, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <BottomNav onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Floating Modals */}
      <CommandBar 
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onSuccess={fetchDashboard}
        currency={currency}
      />

      <AddTransactionModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchDashboard}
        currency={currency}
      />

      {/* Floating Animated Cartoon Eyes AI Advisor Bubble */}
      <button
        onClick={() => setIsAdvisorOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-5 z-40 flex items-center gap-3 p-1.5 pr-4 rounded-full bg-slate-900/90 dark:bg-black/90 backdrop-blur-md border border-emerald-500/30 text-white shadow-2xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all group"
        title="Chat with Pace • AI Copilot"
      >
        <CartoonAIEyes size="md" />
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Pace AI
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-[10px] text-slate-400 block leading-tight">
            Click to Chat
          </span>
        </div>
      </button>

      {/* SpendPace Autonomous Cashflow Advisor Chat Modal */}
      <AICashflowAdvisorModal 
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
      />
    </div>
  );
}