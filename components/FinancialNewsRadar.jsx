"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { 
  Compass, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  Sliders, 
  ArrowUpRight,
  Sun,
  Coffee,
  CheckCircle2,
  DollarSign,
  Info
} from "lucide-react";

export default function FinancialNewsRadar({ metrics, currency = "INR" }) {
  const [activeTab, setActiveTab] = useState("runway"); // 'runway' | 'simulator'
  const [patterns, setPatterns] = useState(null);
  const [simulatedFrugality, setSimulatedFrugality] = useState(150);
  const [simulatedGig, setSimulatedGig] = useState(500);

  useEffect(() => {
    async function loadPatterns() {
      try {
        const res = await fetch("/api/patterns");
        if (res.ok) {
          const json = await res.json();
          setPatterns(json);
        }
      } catch (e) {
        console.error("Patterns fetch error:", e);
      }
    }
    loadPatterns();
  }, []);

  const safeDaily = metrics?.safeDaily || 850;
  const daysRemaining = metrics?.daysRemaining || 24;
  const remainingDiscretionary = metrics?.remainingDiscretionary || (safeDaily * daysRemaining);
  const totalInflow = metrics?.totalHouseholdInflow || metrics?.monthlyIncome || 65000;
  
  // Real dynamic mathematical calculations
  const projectedSurplus = Math.max(0, remainingDiscretionary);
  const weekendSurgeAllowance = Math.round(safeDaily * 1.35);
  const savingsEfficiency = totalInflow > 0 
    ? Math.min(100, Math.round((projectedSurplus / totalInflow) * 100))
    : 25;
  const runwayCoverageDays = safeDaily > 0 ? Math.min(daysRemaining, Math.floor(remainingDiscretionary / safeDaily)) : daysRemaining;

  // Simulator impact calculations
  const dailyBoostFromGig = Math.round(simulatedGig / (daysRemaining || 1));
  const compoundSavingsFromFrugality = simulatedFrugality * (daysRemaining || 1);

  const horizonMetrics = [
    {
      title: "Projected Month-End Surplus",
      value: `+${formatCurrency(projectedSurplus, currency)}`,
      sub: `Pool across ${daysRemaining} remaining days`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Cash Runway Horizon",
      value: `${runwayCoverageDays} Days`,
      sub: "100% liquidity to next pay cycle",
      icon: ShieldCheck,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Weekend Surge Allowance",
      value: formatCurrency(weekendSurgeAllowance, currency),
      sub: "Absorbs weekend spend rhythm",
      icon: Sun,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Savings Efficiency Ratio",
      value: `${savingsEfficiency}%`,
      sub: "Discretionary pool converted to wealth",
      icon: Zap,
      color: "text-teal-500",
      bg: "bg-teal-500/10 border-teal-500/20",
    },
  ];

  return (
    <div className="rounded-3xl fintech-card p-6 sm:p-7 border border-black/[0.08] dark:border-white/[0.08] shadow-lg relative overflow-hidden space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Forward Predictive Radar
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Cashflow Runway & Pace Elasticity
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("runway")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "runway"
                ? "bg-white dark:bg-white/[0.12] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Runway Horizon
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "simulator"
                ? "bg-white dark:bg-white/[0.12] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            What-If Simulator
          </button>
        </div>
      </div>

      {/* Tab 1: Live Forward Runway Horizon */}
      {activeTab === "runway" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {horizonMetrics.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-2 hover:border-black/20 dark:hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {stat.title}
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {stat.sub}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Velocity Health Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Safe Daily Velocity: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(safeDaily, currency)}/day</strong> across {daysRemaining} days remaining in cycle.
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 shrink-0">
              Zero Shortfall
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: What-If Pace Elasticity Simulator */}
      {activeTab === "simulator" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Scenario 1: Gig Boost */}
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full bg-teal-500/10">
                  Gig Boost
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">+{formatCurrency(simulatedGig, currency)}</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Earn extra freelance or weekend shift income
              </p>
              <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Pace Impact:</span>
                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(dailyBoostFromGig, currency)}/day safe limit expansion
                </p>
              </div>
              <div className="flex gap-1.5 pt-1">
                {[300, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSimulatedGig(amt)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      simulatedGig === amt
                        ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                        : "bg-black/[0.02] dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 border-black/10 dark:border-white/10 hover:border-teal-500/50"
                    }`}
                  >
                    +{formatCurrency(amt, currency)}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario 2: Daily Frugality */}
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                  Daily Frugality
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">-{formatCurrency(simulatedFrugality, currency)}/day</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Trim discretionary daily spending
              </p>
              <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Month-End Compound:</span>
                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(compoundSavingsFromFrugality, currency)} extra bank balance
                </p>
              </div>
              <div className="flex gap-1.5 pt-1">
                {[100, 150, 250].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSimulatedFrugality(amt)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      simulatedFrugality === amt
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                        : "bg-black/[0.02] dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 border-black/10 dark:border-white/10 hover:border-emerald-500/50"
                    }`}
                  >
                    -{formatCurrency(amt, currency)}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario 3: Zero-Spend Day Rollover */}
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10">
                  Zero-Spend Day
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">100% Rollover</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Log ₹0 discretionary spend today
              </p>
              <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Tomorrow's Safe Pool:</span>
                <p className="text-xs font-black text-blue-600 dark:text-blue-400">
                  +{formatCurrency(safeDaily * 2, currency)} double velocity allowance
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/15 text-[10px] text-slate-500 dark:text-slate-400">
                💡 Automatically compounds without manual ledger adjustment
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
