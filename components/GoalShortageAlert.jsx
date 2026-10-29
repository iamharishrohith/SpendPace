"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { 
  AlertTriangle, 
  ShieldAlert, 
  TrendingDown, 
  ArrowRight, 
  Check, 
  Clock, 
  Sparkles, 
  Zap, 
  X,
  Loader2
} from "lucide-react";

export default function GoalShortageAlert({ alert, currency = "INR", onActionComplete }) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  if (!alert || !alert.hasShortage || dismissed) return null;

  const handleTightenSpend = async () => {
    setLoadingAction("tighten");
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: alert.goalId,
          action: "TOGGLE_TIGHTEN",
          autoTightenPace: !alert.autoTightenPace,
        }),
      });
      if (res.ok) {
        setActionSuccess(alert.autoTightenPace ? "Pacing restored to standard limit" : `Pacing throttled to guarantee ${alert.goalTitle}!`);
        if (onActionComplete) onActionComplete();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExtendDeadline = async () => {
    setLoadingAction("extend");
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: alert.goalId,
          action: "EXTEND_DEADLINE",
          extendDays: alert.suggestedExtensionDays || 30,
        }),
      });
      if (res.ok) {
        setActionSuccess(`Target date extended by +${alert.suggestedExtensionDays || 30} days to relieve daily velocity!`);
        if (onActionComplete) onActionComplete();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-rose-500/40 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent p-5 sm:p-6 shadow-xl shadow-rose-500/10 transition-all animate-in fade-in-0 duration-300">
      {/* Background glow accent */}
      <div className="absolute -right-12 -top-12 w-44 h-44 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        {/* Left Info Cluster */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm shadow-rose-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Goal Shortage Risk • Alert</span>
            </span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              High burn rate threatens target milestone
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Shortage Warning: {alert.goalTitle} Target ({formatCurrency(alert.targetAmount, currency)})
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl mt-0.5 leading-relaxed">
              At your current daily discretionary spending, you are running a <strong className="text-rose-600 dark:text-rose-400">-{formatCurrency(alert.shortageAmount, currency)}/day shortfall</strong> to hit this goal by {new Date(alert.targetDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span className="bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-xl">
              Saved: <strong className="text-slate-900 dark:text-white">{formatCurrency(alert.currentAmount, currency)}</strong>
            </span>
            <span className="bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-xl">
              Deficit: <strong className="text-rose-500">{formatCurrency(alert.deficit, currency)}</strong>
            </span>
            <span className="bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-xl">
              Days Left: <strong className="text-slate-900 dark:text-white">{alert.goalDaysRemaining} days</strong>
            </span>
            <span className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 px-2.5 py-1 rounded-xl font-bold">
              Required: {formatCurrency(alert.requiredDaily, currency)} / day
            </span>
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 flex-shrink-0">
          {actionSuccess ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <Check className="w-4 h-4" />
              <span>{actionSuccess}</span>
            </div>
          ) : (
            <>
              {/* Option 1: Reduce daily automated spend to protect goal */}
              <button
                type="button"
                onClick={handleTightenSpend}
                disabled={loadingAction !== null}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  alert.autoTightenPace
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25 active:scale-95"
                }`}
              >
                {loadingAction === "tighten" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {alert.autoTightenPace
                    ? "✓ Pacing Shield Active (Auto-Tightened)"
                    : `Reduce Daily Spend (-${formatCurrency(alert.suggestedTightenAmount, currency)}/day)`}
                </span>
              </button>

              {/* Option 2: Extend goal deadline */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExtendDeadline}
                  disabled={loadingAction !== null}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-white/10 hover:bg-black/5 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 border border-black/10 dark:border-white/10 transition-all"
                >
                  {loadingAction === "extend" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Clock className="w-3 h-3 text-amber-500" />
                  )}
                  <span>Extend Deadline (+30d)</span>
                </button>

                <Link
                  href="/goals"
                  className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
                >
                  <span>Goals</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Dismiss Alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

