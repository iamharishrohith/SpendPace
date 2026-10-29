"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Clock, 
  TrendingUp, 
  Sparkles,
  ArrowUpRight,
  Zap
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PaceRadar({ 
  monthlyIncome = 85000, 
  committedBills = 32000, 
  currentSpent = 0, 
  daysRemaining = 18,
  currency = "INR",
  onRefresh
}) {
  const [weekendFlex, setWeekendFlex] = useState(false);

  // Accurate math
  const totalDiscretionary = Math.max(0, monthlyIncome - committedBills);
  const remainingDiscretionary = Math.max(0, totalDiscretionary - currentSpent);
  
  let safeDaily = daysRemaining > 0 ? remainingDiscretionary / daysRemaining : 0;
  if (weekendFlex) {
    safeDaily = safeDaily * 1.2; // 20% weekend flex
  }

  const burnRate = totalDiscretionary > 0 
    ? Math.min(100, Math.round((currentSpent / totalDiscretionary) * 100))
    : 0;

  // Arc Gauge Math (240 degree arc)
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(2, burnRate))) / 100;

  // Status configuration
  const getStatus = () => {
    if (burnRate < 65) {
      return {
        label: "Optimal Pace",
        color: "text-emerald-500",
        badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        stroke: "#10B981",
        glow: "glow-emerald",
        summary: "Spending velocity is well within monthly safe limits."
      };
    }
    if (burnRate < 85) {
      return {
        label: "Caution Pace",
        color: "text-amber-500",
        badgeBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        stroke: "#F59E0B",
        glow: "glow-amber",
        summary: "Nearing discretionary threshold. Moderate non-essential purchases."
      };
    }
    return {
      label: "Burn Warning",
      color: "text-rose-500",
      badgeBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      stroke: "#F43F5E",
      glow: "glow-rose",
      summary: "Current burn rate will exhaust discretionary pool before next payday."
    };
  };

  const status = getStatus();

  return (
    <div className={`relative overflow-hidden rounded-3xl fintech-card p-6 sm:p-8 transition-all ${status.glow}`}>
      {/* Subtle ambient lighting */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-amber-500/10 dark:bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Autonomous Spend Velocity
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${status.badgeBg} flex items-center gap-1.5`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {status.label}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Daily Safe-to-Spend
          </h2>
        </div>

        {/* Weekend Flex Mode Button */}
        <button
          onClick={() => setWeekendFlex(!weekendFlex)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            weekendFlex 
              ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
              : "border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Weekend Flex {weekendFlex ? "Active (+20%)" : "Inactive"}</span>
        </button>
      </div>

      {/* Centerpiece: Precision Arc Gauge & Hero Stat */}
      <div className="my-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left: Giant Odometer Number */}
        <div className="space-y-2 text-center md:text-left">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Safe Allowance for Today
          </div>
          <div className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(Math.round(safeDaily), currency)}
            <span className="text-xl sm:text-2xl font-normal text-slate-400 ml-2">
              / day
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Pacing across <strong className="text-slate-800 dark:text-slate-200">{daysRemaining} days</strong> remaining in this pay cycle. {status.summary}
          </p>
        </div>

        {/* Right: High-Precision Circular Arc Gauge */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-[210deg]" viewBox="0 0 220 220">
            {/* Background Arc */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke="currentColor"
              className="text-black/5 dark:text-white/10"
              strokeWidth="16"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Colored Dynamic Stroke */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke={status.stroke}
              strokeWidth="16"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Gauge Reading */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold uppercase text-slate-400">Burn Rate</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {burnRate}%
            </span>
            <span className="text-[10px] text-slate-400">of Discretionary</span>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-black/5 dark:border-white/5 relative z-10">
        <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Unallocated Buffer</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(remainingDiscretionary, currency)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>Committed Bills</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(committedBills, currency)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Cycle Days Left</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {daysRemaining} Days
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Monthly Net Income</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(monthlyIncome, currency)}
          </div>
        </div>
      </div>
    </div>
  );
}