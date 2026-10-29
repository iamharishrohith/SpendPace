"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Loader2,
  Activity,
  Layers,
  ChevronRight
} from "lucide-react";

export default function AIDiagnosticsCard({ currency = "INR" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trajectory"); // 'trajectory' | 'categories' | 'leaks'

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/diagnostics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Diagnostics load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl fintech-card p-6 sm:p-8 flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Synthesizing Deep Financial Diagnostics & 6-Month Trajectory...
          </span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-3xl fintech-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Pace • Deep Diagnostics & Forecasting
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Predictive AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-horizon forward telemetry, leak audit & category trends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Health Score Pill */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08]">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Health Index</div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 leading-none">
                {data.overallHealthScore || 82} / 100
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/20">
              {data.healthGrade || "A-"}
            </div>
          </div>

          <button
            onClick={fetchDiagnostics}
            title="Refresh Diagnostic Engine"
            className="p-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Verdict Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          {data.summaryVerdict}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("trajectory")}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "trajectory"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          6-Month Savings Trajectory
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "categories"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Category Cost Predictions
        </button>
        <button
          onClick={() => setActiveTab("leaks")}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "leaks"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Cash Leaks Detected ({data.cashLeaksDetected?.length || 0})
        </button>
      </div>

      {/* Tab 1: 6-Month Predictive Savings Projection */}
      {activeTab === "trajectory" && (
        <div className="space-y-4 animate-in fade-in-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(data.sixMonthSavingsTrajectory || []).map((step, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{step.month}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600">
                      {step.confidence}
                    </span>
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    +{formatCurrency(step.projectedSavings, currency)}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Monthly Surplus</span>
                </div>
                
                <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5">
                  <span className="text-[9px] text-slate-400 block">Cumulative Pool:</span>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(step.cumulativeSurplus, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {data.autonomousPaceNudge && (
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                🎯 <strong>Autonomous Nudge:</strong> {data.autonomousPaceNudge.action}
              </span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                {data.autonomousPaceNudge.potentialGain}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Category Cost Predictions */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in-50">
          {(data.categoryCostPredictions || []).map((cat, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{cat.category}</span>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  cat.trendDirection === "UP" ? "bg-rose-500/10 text-rose-600" :
                  cat.trendDirection === "DOWN" ? "bg-emerald-500/10 text-emerald-600" :
                  "bg-slate-500/10 text-slate-500"
                }`}>
                  {cat.trendDirection === "UP" ? <TrendingUp className="w-3 h-3" /> :
                   cat.trendDirection === "DOWN" ? <TrendingDown className="w-3 h-3" /> : null}
                  <span>{cat.percentChange > 0 ? `+${cat.percentChange}%` : `${cat.percentChange}%`}</span>
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Current Cycle</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {formatCurrency(cat.currentSpend, currency)}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Next Month Forecast</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {formatCurrency(cat.nextMonthForecast, currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Cash Leaks Detected */}
      {activeTab === "leaks" && (
        <div className="space-y-3 animate-in fade-in-50">
          {(data.cashLeaksDetected || []).map((leak, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-rose-500/[0.03] border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{leak.area}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600">
                    {leak.severity} LEAK
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  {leak.recommendation}
                </p>
              </div>

              <div className="text-right pl-6 sm:pl-0 flex-shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Inefficiency</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                  ~{formatCurrency(leak.monthlyWasted, currency)}/mo
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
