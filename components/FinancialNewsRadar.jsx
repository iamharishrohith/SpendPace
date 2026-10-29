"use client";

import React, { useState } from "react";
import { 
  Fuel, 
  Coins, 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  ExternalLink, 
  Newspaper,
  ChevronRight,
  Flame,
  Radio
} from "lucide-react";

export default function FinancialNewsRadar() {
  const [activeTab, setActiveTab] = useState("macro"); // 'macro' or 'news'

  const macroStats = [
    {
      title: "Petrol (Metro Avg)",
      value: "₹101.20 / L",
      sub: "Stable today",
      trend: "neutral",
      icon: Fuel,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "24K Gold Rate",
      value: "₹7,860 / g",
      sub: "+0.4% this week",
      trend: "up",
      icon: Coins,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      title: "RBI Repo Rate",
      value: "6.50%",
      sub: "Home EMI stable",
      trend: "neutral",
      icon: Landmark,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "LPG 14.2kg Cylinder",
      value: "₹803.00",
      sub: "Subsidized home rate",
      trend: "down",
      icon: Flame,
      color: "text-rose-500",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
  ];

  const newsBulletins = [
    {
      id: 1,
      tag: "Fuel & Commute",
      time: "2h ago",
      title: "Crude oil consolidates around $74/bbl: Domestic retail petrol & diesel prices expected to remain stable.",
      actionTip: "Ideal window to lock monthly petrol budget envelope without price shock.",
    },
    {
      id: 2,
      tag: "Gold & Wealth",
      time: "5h ago",
      title: "Gold prices witness steady festive accumulation: Central banks continue sovereign gold reserve buildup.",
      actionTip: "Check your Sovereign Gold Asset milestone in SpendPace Goals.",
    },
    {
      id: 3,
      tag: "Banking & EMIs",
      time: "1d ago",
      title: "Monetary Policy Committee maintains repo rate pause: Bank floating lending rates to remain steady through quarter.",
      actionTip: "Fixed EMI outflow calculations remain valid for the next 3 cycles.",
    },
    {
      id: 4,
      tag: "Household Index",
      time: "1d ago",
      title: "Food consumer inflation eases slightly on seasonal vegetable arrivals across wholesale markets.",
      actionTip: "Safe daily grocery pace can absorb minor seasonal spikes comfortably.",
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
              Live Regional Economic Radar
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Macro Fuel, Gold & Inflation Pulse
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("macro")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "macro"
                ? "bg-white dark:bg-white/[0.12] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Regional Rates
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "news"
                ? "bg-white dark:bg-white/[0.12] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Financial News
          </button>
        </div>
      </div>

      {/* Tab 1: Live Regional Rates Grid */}
      {activeTab === "macro" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {macroStats.map((stat) => {
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
      )}

      {/* Tab 2: Curated Bulletins */}
      {activeTab === "news" && (
        <div className="space-y-3">
          {newsBulletins.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                  {item.tag}
                </span>
                <span className="text-slate-400">{item.time}</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {item.title}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">💡 Pace Tip:</span> {item.actionTip}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
