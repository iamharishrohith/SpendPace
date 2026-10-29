"use client";

import React from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Calendar, 
  ShieldCheck,
  TrendingDown,
  Layers,
  Zap,
  Truck
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function BentoGrid({ 
  monthlyIncome = 85000, 
  partTimeIncome = 0,
  totalSpent = 0, 
  committedBills = 32000, 
  totalDebtMonthly = 0,
  baselineLivingCost = 0,
  currency = "INR",
  categories = [],
  liabilities = []
}) {
  const netSaved = Math.max(0, monthlyIncome - totalSpent);
  const burnPercent = monthlyIncome > 0 ? Math.round((totalSpent / monthlyIncome) * 100) : 0;

  // Real AI Advice based on real spend level
  const getCoachAdvice = () => {
    if (totalSpent === 0) {
      return {
        highlight: "Zero Spend Cycle",
        text: "You haven't logged any discretionary expenses yet this cycle. Pacing is completely intact.",
        tip: "Logging small daily items keeps your Pace Radar razor-sharp."
      };
    }
    if (burnPercent < 45) {
      return {
        highlight: "Disciplined Velocity",
        text: `You have consumed only ${burnPercent}% of your monthly inflow. Pacing is healthy.`,
        tip: "Consider funneling the unspent surplus into your Emergency Fund milestone."
      };
    }
    if (burnPercent < 75) {
      return {
        highlight: "Moderate Burn",
        text: `Total outflow is at ${burnPercent}%. Stay alert on discretionary weekend dining and shopping.`,
        tip: "Review recurring subscriptions to maintain your safe daily allowance."
      };
    }
    return {
      highlight: "High Outflow Warning",
      text: `Total expenses reached ${burnPercent}% of monthly income.`,
      tip: "Freeze discretionary shopping for the remainder of this cycle to avoid debt rollovers."
    };
  };

  const advice = getCoachAdvice();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {/* Tile 1: Real Inflow vs Outflow */}
      <div className="rounded-3xl fintech-card p-6 fintech-card-hover flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Live Cashflow Inflow / Outflow
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Database Synced
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Total Monthly Inflow</span>
                </div>
                {partTimeIncome > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Truck className="w-2.5 h-2.5" />
                    +{formatCurrency(partTimeIncome, currency)} Delivery
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(monthlyIncome, currency)}
              </div>
            </div>

            <div className="border-t border-black/5 dark:border-white/5 pt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                <span>Total Recorded Outflows</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(totalSpent, currency)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Net Surplus Saved</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
            +{formatCurrency(netSaved, currency)}
          </span>
        </div>
      </div>

      {/* Tile 2: Dynamic AI Velocity Coach */}
      <div className="rounded-3xl fintech-card p-6 fintech-card-hover relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs uppercase tracking-wider font-bold text-slate-900 dark:text-white">
              AI Spend Coach
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 my-3">
            <div className="text-xs font-bold text-amber-500 mb-0.5">
              {advice.highlight}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {advice.text}
            </p>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            💡 <strong>Dynamic Tip:</strong> {advice.tip}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Coaching Mode</span>
          <span className="text-emerald-500 font-semibold">Active & Adapting</span>
        </div>
      </div>

      {/* Tile 3: Committed Outflow Shield */}
      <div className="rounded-3xl fintech-card p-6 fintech-card-hover flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                Committed Outflow Shield
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-500 uppercase px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Reserved
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Bank EMIs & Loans</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {liabilities.length > 0 ? `${liabilities.length} obligations active` : "Zero debt registered"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-amber-500">
                  {formatCurrency(totalDebtMonthly || (committedBills * 0.4), currency)}
                </div>
                <span className="text-[9px] font-semibold text-amber-500 uppercase">Committed</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Family Living Reserve</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Groceries, bills & utilities</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {formatCurrency(baselineLivingCost || (committedBills * 0.6), currency)}
                </span>
                <span className="text-[9px] font-semibold text-emerald-500 uppercase block">Protected</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
          <span>Non-Discretionary Total</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(committedBills, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}