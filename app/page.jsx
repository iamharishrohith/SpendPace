"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Receipt,
  Lock,
  CheckCircle2,
  ChevronRight,
  Target,
  PieChart,
  Calendar,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function LandingPage() {
  const [sliderIncome, setSliderIncome] = useState(85000);
  const [sliderBills, setSliderBills] = useState(32000);
  const [currency] = useState("INR");

  const sampleDays = 18;
  const sampleDiscretionary = Math.max(0, sliderIncome - sliderBills);
  const sampleSafeDaily = Math.round(sampleDiscretionary / sampleDays);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0D0E12] text-slate-900 dark:text-slate-100 transition-colors selection:bg-emerald-500/20">
      <Navbar />

      {/* Hero Section with Aceternity Spotlight Style */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Spending Pacing Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
            Stop guessing where it went.{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-400 bg-clip-text text-transparent">
              Pace where it goes.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            SpendPace replaces the end-of-month guilt trap. Get a live, dynamic <strong>Daily Safe-to-Spend limit</strong> that automatically recalibrates with every transaction, screenshot, and recurring bill.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-600/25 transition-all hover:scale-102 flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 font-semibold text-base transition-all flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200"
            >
              <span>Explore Live Command Center</span>
              <ChevronRight className="w-4 h-4 text-emerald-500" />
            </Link>
          </div>
        </div>

        {/* Interactive Velocity Preview Simulator */}
        <div id="simulator" className="mt-16 max-w-2xl mx-auto rounded-3xl fintech-card p-6 sm:p-8 text-left border border-black/10 dark:border-white/10 shadow-2xl relative z-10 scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Interactive Pace Velocity Simulator
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Live Recalibration
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold mb-2">
                <span>Monthly Net Take-Home:</span>
                <span className="text-emerald-500 font-extrabold text-base">{formatCurrency(sliderIncome, currency)}</span>
              </div>
              <input
                type="range"
                min="30000"
                max="250000"
                step="5000"
                value={sliderIncome}
                onChange={(e) => setSliderIncome(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold mb-2">
                <span>Committed Bills (Rent, EMIs, Insurance):</span>
                <span className="text-amber-500 font-extrabold text-base">{formatCurrency(sliderBills, currency)}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="150000"
                step="2500"
                value={sliderBills}
                onChange={(e) => setSliderBills(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-bold">
                Calculated Safe Velocity ({sampleDays} Days Remaining)
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
                {formatCurrency(sampleSafeDaily, currency)} <span className="text-sm font-normal text-slate-400">/ day</span>
              </div>
            </div>

            <Link
              href="/login"
              className="px-5 py-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-xs font-bold text-slate-900 dark:text-white transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Lock This Pace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillar Showcase */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs uppercase tracking-wider font-bold text-emerald-500">
            Engineered for Modern Cashflow
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Everything your money needs to stay on track
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Micro-Fragment 1: Autonomous Pacing Strip */}
          <div className="p-7 rounded-3xl fintech-card fintech-card-hover flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Daily Pacing Calibration</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px]">
                    Live Rhythm
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">₹2,944<span className="text-xs font-normal text-slate-400">/day</span></span>
                  <span className="text-[11px] font-bold text-emerald-500">+₹180 rollover</span>
                </div>
                {/* 3-day rhythm mini dots */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block">Day 1</span>
                    <span className="text-[10px] font-black text-emerald-500">✓ Saved</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block">Day 2</span>
                    <span className="text-[10px] font-black text-emerald-500">✓ Saved</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-center shadow-xs">
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block">Today</span>
                    <span className="text-[10px] font-black text-emerald-500">Active</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Dynamic Safe-to-Spend
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  No retrospective guilt charts. SpendPace gives you a single live allowance each morning that dynamically tightens or loosens based on your actual pace.
                </p>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1.5">
              <span>Auto-recalibrates every morning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Micro-Fragment 2: Multimodal Receipt OCR Pipeline */}
          <div className="p-7 rounded-3xl fintech-card fintech-card-hover flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-teal-500" />
                    <span>Blinkit Superstore</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    99.4% OCR Match
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">4 Items • UPI Transaction</span>
                  <span className="text-lg font-black text-rose-500 tabular-nums">-₹842.00</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                  <span>Category Auto-Mapped:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Groceries & Ration</span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Instant Vision OCR
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  Drop payment screenshots (UPI, GPay, PhonePe) or paper invoices. Multimodal AI parses merchant, amount, category, and items in under 2 seconds.
                </p>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-teal-500 flex items-center gap-1.5">
              <span>Zero manual entry required</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Micro-Fragment 3: Milestone Acceleration Meter */}
          <div className="p-7 rounded-3xl fintech-card fintech-card-hover flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-800 dark:text-slate-200">Emergency Reserve</span>
                  <span className="text-amber-500">63% Funded</span>
                </div>
                <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full w-[63%]" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="tabular-nums">₹95,000 / ₹1,50,000</span>
                  <span className="text-emerald-500 font-bold">⚡ 18 days sooner</span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Milestone Acceleration
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  Connect daily spending directly to goals. AI simulates how trimming two restaurant dinners advances your Emergency Reserve or Gold milestone by weeks.
                </p>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-amber-500 flex items-center gap-1.5">
              <span>Compounding discipline feedback</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Security & Data Integrity Banner */}
      <section id="security" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="rounded-3xl fintech-card p-8 sm:p-12 border border-black/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
              <Lock className="w-3.5 h-3.5" />
              <span>FinTech-Grade Security</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Your financial records belong exclusively to you
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Data encrypted with AES-256 at rest, strict tenant isolation via PostgreSQL Row-Level Security, and 100% compliance with data privacy standards. Zero selling of transaction data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all"
            >
              Create Encrypted Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 dark:border-white/5 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        SpendPace • Autonomous Spend Velocity & Budgeting • Next.js, Prisma Postgres & Tailwind CSS
      </footer>
    </div>
  );
}