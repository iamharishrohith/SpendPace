"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Sparkles,
  BarChart3,
  CalendarCheck,
  Coffee,
  X,
  ArrowRight,
  Info,
  CalendarDays,
  ShieldCheck,
  Flame,
  SunMedium,
  Briefcase
} from "lucide-react";

export default function PatternsPage() {
  const [currentMonth, setCurrentMonth] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Initialize currentMonth on client to satisfy Next.js 16 partial prerendering
  useEffect(() => {
    const d = new Date();
    const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(formatted);
  }, []);

  const fetchPatterns = async (monthStr, retryCount = 0) => {
    if (!monthStr) return;
    
    // Check local SWR cache on first attempt to eliminate blank loading state
    if (retryCount === 0 && !data) {
      try {
        const cached = localStorage.getItem(`spendpace_patterns_cache_${monthStr}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.calendarDays) {
            setData(parsed);
            setLoading(false);
          }
        }
      } catch (e) {}
    }

    if (!data) setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/patterns?month=${monthStr}`, { cache: "no-store" });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to load spending patterns (HTTP ${res.status})`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
      try {
        localStorage.setItem(`spendpace_patterns_cache_${monthStr}`, JSON.stringify(json));
      } catch (e) {}
    } catch (err) {
      console.error(`Patterns fetch error (attempt ${retryCount + 1}/3):`, err);
      if (retryCount < 3) {
        const backoffMs = Math.min(1000 * Math.pow(1.5, retryCount), 3000);
        setTimeout(() => fetchPatterns(monthStr, retryCount + 1), backoffMs);
        return;
      }
      if (!data) {
        setError(err.message || "Could not retrieve pattern analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMonth) {
      fetchPatterns(currentMonth);
    }
  }, [currentMonth]);

  const handlePrevMonth = () => {
    if (!currentMonth) return;
    const [y, m] = currentMonth.split("-").map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setCurrentMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleNextMonth = () => {
    if (!currentMonth) return;
    const [y, m] = currentMonth.split("-").map(Number);
    const nextDate = new Date(y, m, 1);
    setCurrentMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`);
  };

  const formatCurrency = (val) => `₹${Math.round(val || 0).toLocaleString("en-IN")}`;

  // Pad the start of calendar grid for the 1st day of the month
  const emptyLeadDays = data ? Array.from({ length: data.firstDayOfWeek }) : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0D0E12] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header & Month Navigator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#16181E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <CalendarCheck className="w-4 h-4" />
              <span>Temporal Rhythm Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Spending Pattern Analyser & Calendar
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Interactive daily calendar with real-time Save Ticks, red over-limit indicators, and periodic replenishment waves.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto bg-black/[0.03] dark:bg-white/[0.04] p-1.5 rounded-2xl border border-black/[0.05] dark:border-white/[0.06]">
            <button
              onClick={handlePrevMonth}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all disabled:opacity-40"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-1.5 text-center min-w-[150px]">
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                {data?.monthName || "Loading..."}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Safe Daily: {data?.metrics?.safeDaily ? formatCurrency(data.metrics.safeDaily) : "—"}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all disabled:opacity-40"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Summary Cards */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#16181E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Month Spend
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(data.metrics.totalMonthSpent)}
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                from {formatCurrency(data.metrics.totalDiscretionary)} discretionary
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                  Under Safe Limit Days
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {data.metrics.underLimitDaysCount} <span className="text-sm font-semibold text-emerald-500">Days</span>
              </div>
              <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 font-medium block">
                Saved total {formatCurrency(data.metrics.totalSavedPace)}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
                  Over-Limit Spikes
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {data.metrics.overLimitDaysCount} <span className="text-sm font-semibold text-rose-500">Days</span>
              </div>
              <span className="text-[11px] text-rose-700/80 dark:text-rose-300/80 font-medium block">
                Extra burn +{formatCurrency(data.metrics.totalOverPace)}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
                  Weekend Surge Factor
                </span>
                <SunMedium className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {data.leaveVsWork.weekendSurgeFactor}x
              </div>
              <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80 font-medium block">
                Off-day avg: {formatCurrency(data.leaveVsWork.avgLeaveSpend)} vs Work: {formatCurrency(data.leaveVsWork.avgWorkSpend)}
              </span>
            </div>
          </div>
        )}

        {/* Interactive Calendar Section */}
        <section className="p-6 rounded-3xl bg-white dark:bg-[#16181E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-500" />
                <span>Monthly Daily Pace Ledger</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Days with <span className="text-emerald-500 font-bold">✓</span> stayed under safe limit ({data?.metrics?.safeDaily ? formatCurrency(data.metrics.safeDaily) : "Safe Daily"}). Days in <span className="text-rose-500 font-bold">Red</span> exceeded safe daily burn. Click any day to view itemized transactions.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[9px] font-black">✓</span>
                <span>Pace Preserved</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500"></span>
                <span>Over Limit</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Leave Day</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-medium">Computing temporal cycles and day ledgers...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-center space-y-2">
              <p className="font-bold text-sm">{error}</p>
              <button
                onClick={() => fetchPatterns(currentMonth)}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Day Headers (Sun - Sat) with Sticky Top */}
              <div className="grid grid-cols-7 gap-2 min-w-[700px] mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 bg-white/95 dark:bg-[#16181E]/95 backdrop-blur-md py-2 border-b border-black/[0.04] dark:border-white/[0.04]">
                <span className="text-amber-600 dark:text-amber-400 font-extrabold">Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold">Sat</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                {/* Empty lead cells for first week alignment */}
                {emptyLeadDays.map((_, i) => (
                  <div key={`lead-${i}`} className="min-h-[105px] rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-transparent" />
                ))}

                {/* Day Cards */}
                {data?.calendarDays.map((day) => {
                  const isToday =
                    new Date().toISOString().split("T")[0] === day.date;
                  const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;

                  return (
                    <button
                      key={day.dayNumber}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`text-left p-3 min-h-[105px] rounded-2xl border transition-all flex flex-col justify-between group relative ${
                        day.isOverLimit
                          ? "bg-rose-500/[0.08] dark:bg-rose-500/[0.12] border-rose-500/40 hover:border-rose-500 hover:shadow-md hover:shadow-rose-500/10"
                          : day.spent > 0
                          ? isWeekend 
                            ? "bg-amber-500/[0.03] dark:bg-white/[0.04] border-amber-500/20 dark:border-white/[0.09] hover:border-emerald-500/50 hover:shadow-md"
                            : "bg-white dark:bg-[#1A1D24] border-black/[0.08] dark:border-white/[0.08] hover:border-emerald-500/50 hover:shadow-md"
                          : isWeekend
                          ? "bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06] hover:border-black/20 dark:hover:border-white/20"
                          : "bg-black/[0.015] dark:bg-white/[0.015] border-black/[0.04] dark:border-white/[0.04] hover:border-black/20 dark:hover:border-white/20"
                      } ${isToday ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#0D0E12]" : ""}`}
                    >
                      {/* Top Row: Date & Leave Day indicator */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-black ${isToday ? "text-emerald-500" : "text-slate-800 dark:text-slate-200"}`}>
                            {day.dayNumber}
                          </span>
                          {isToday && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500 text-white">
                              Today
                            </span>
                          )}
                        </div>

                        {day.isLeaveDay && (
                          <span
                            title="Scheduled Leave/Off Day"
                            className="w-2 h-2 rounded-full bg-amber-400"
                          />
                        )}
                      </div>

                      {/* Middle: Spent Amount */}
                      <div className="my-1">
                        <div className={`text-sm font-black truncate ${
                          day.isOverLimit
                            ? "text-rose-600 dark:text-rose-400"
                            : day.spent > 0
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-400 dark:text-slate-500"
                        }`}>
                          {day.spent > 0 ? formatCurrency(day.spent) : "₹0"}
                        </div>
                        {day.transactionsCount > 0 && (
                          <span className="text-[10px] text-slate-400 block truncate">
                            {day.transactionsCount} {day.transactionsCount === 1 ? "expense" : "expenses"}
                          </span>
                        )}
                      </div>

                      {/* Bottom Status Badge */}
                      <div className="w-full pt-1 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-[10px] font-bold">
                        {day.isOverLimit ? (
                          <span className="text-rose-600 dark:text-rose-400 font-black truncate">
                            +{formatCurrency(day.overAmount)}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 truncate">
                            <span className="font-black">✓</span>
                            <span>{day.spent > 0 ? `Saved ${formatCurrency(day.savedAmount)}` : `Saved full`}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Pattern Analytics Grid (Monthly Start/Mid/End, Weekly, 3-Days Once, Leave Days) */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Monthly Temporal Rhythm (Start vs Mid vs End) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#16181E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Monthly Phase Dynamics
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reveals how spending concentrates across salary arrival (1–10), mid-month stability (11–20), and month-end tightening (21–End).
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { key: "monthStart", data: data.temporalPatterns.monthStart, color: "bg-teal-500", label: "Month Start (Days 1–10)" },
                  { key: "monthMid", data: data.temporalPatterns.monthMid, color: "bg-blue-500", label: "Mid-Cycle (Days 11–20)" },
                  { key: "monthEnd", data: data.temporalPatterns.monthEnd, color: "bg-amber-500", label: "Month-End (Days 21–End)" },
                ].map((phase) => {
                  const total = data.metrics.totalMonthSpent || 1;
                  const pct = Math.round((phase.data.spent / total) * 100);
                  return (
                    <div key={phase.key} className="space-y-1.5 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">{phase.label}</span>
                        <span className="text-slate-900 dark:text-white font-mono">{formatCurrency(phase.data.spent)} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full ${phase.color} transition-all duration-500`}
                          style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Weekly & Day-Wise Rhythms */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#16181E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Day-of-Week Rhythm (Mon–Sun)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Average daily burn across weekdays versus weekends.
              </p>

              <div className="grid grid-cols-7 gap-2 pt-2 text-center">
                {data.dayOfWeekPatterns.map((dow) => {
                  const isHighest = Math.max(...data.dayOfWeekPatterns.map(d => d.average)) === dow.average && dow.average > 0;
                  return (
                    <div
                      key={dow.day}
                      className={`p-2.5 rounded-2xl border transition-all ${
                        isHighest
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                          : "bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]"
                      }`}
                    >
                      <span className="text-[11px] font-bold uppercase block text-slate-400">
                        {dow.day}
                      </span>
                      <span className="text-xs font-black block my-1 font-mono text-slate-900 dark:text-white">
                        {formatCurrency(dow.average)}
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        {dow.count} {dow.count === 1 ? "day" : "days"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. 3-Days Once Micro-Cycles (Ration / Grocery / Restock waves) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#16181E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  3-Days Once Periodic Waves
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Identifies 72-hour cyclical replenishment patterns like ration, vegetables, petrol top-ups, and grocery waves.
              </p>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {data.threeDayWaves.map((wave) => (
                  <div
                    key={wave.label}
                    className={`flex items-center justify-between p-3 rounded-2xl border ${
                      wave.isHeavyWave
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        {wave.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Avg: {formatCurrency(wave.averagePerDay)}/day
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-black font-mono block ${
                        wave.isHeavyWave ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"
                      }`}>
                        {formatCurrency(wave.spent)}
                      </span>
                      {wave.isHeavyWave && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Heavy Wave
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Leave Days vs Work Days Analysis */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#16181E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Leave Days vs Work Days Analysis
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  {data.leaveVsWork.leaveDaysSchedule}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compares discretionary outflow on off-days versus active work days according to your profile leave schedule.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
                    Leave / Off-Days
                  </span>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {formatCurrency(data.leaveVsWork.avgLeaveSpend)}
                    <span className="text-xs font-medium text-amber-700/70 dark:text-amber-300/70"> /day</span>
                  </div>
                  <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80 block">
                    {data.leaveVsWork.leaveDaysCount} off-days in cycle
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                    Active Work Days
                  </span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(data.leaveVsWork.avgWorkSpend)}
                    <span className="text-xs font-medium text-emerald-700/70 dark:text-emerald-300/70"> /day</span>
                  </div>
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 block">
                    {data.leaveVsWork.workDaysCount} work days in cycle
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  You spend <strong className="text-slate-900 dark:text-white">{data.leaveVsWork.weekendSurgeFactor}x</strong> more on off-days compared to regular work days. You can adjust your work schedule anytime in Profile Settings.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Day Itemized Transactions Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#16181E] border border-black/10 dark:border-white/10 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Day Ledger Details
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedDay.dayName}, {selectedDay.date}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Daily Metric Pill */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Spent</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {formatCurrency(selectedDay.spent)}
                </span>
              </div>

              <div className={`p-3 rounded-2xl border ${
                selectedDay.isOverLimit
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              }`}>
                <span className="text-[10px] font-bold uppercase block">
                  {selectedDay.isOverLimit ? "Exceeded Limit By" : "Pace Preserved"}
                </span>
                <span className="text-lg font-black">
                  {selectedDay.isOverLimit
                    ? `+${formatCurrency(selectedDay.overAmount)}`
                    : `✓ ${formatCurrency(selectedDay.savedAmount)}`}
                </span>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Itemized Expenses ({selectedDay.transactions.length})
              </h4>

              {selectedDay.transactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  Zero expenses recorded on this day. 100% of the daily limit was preserved!
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {selectedDay.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {tx.name || "Expense"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {tx.category || "General"} • {tx.accountName || "Account"}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
