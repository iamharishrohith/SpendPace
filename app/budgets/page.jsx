"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { formatCurrency } from "@/lib/utils";
import { 
  PieChart, 
  Loader2,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  HeartPulse,
  Film,
  ShoppingCart
} from "lucide-react";

export default function BudgetsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const currency = data?.user?.currency || "INR";
  const categories = data?.categories || [];
  const transactions = data?.transactions || [];

  // Calculate real category spend from real database transactions
  const categorySpendMap = {};
  transactions.forEach((tx) => {
    if (tx.type === "EXPENSE") {
      categorySpendMap[tx.category] = (categorySpendMap[tx.category] || 0) + tx.amount;
    }
  });

  const getCategoryIcon = (name) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("dining") || lower.includes("food")) return Utensils;
    if (lower.includes("fuel") || lower.includes("commute")) return Car;
    if (lower.includes("grocery") || lower.includes("groceries")) return ShoppingBag;
    if (lower.includes("utility") || lower.includes("bill")) return Zap;
    if (lower.includes("medical") || lower.includes("health")) return HeartPulse;
    if (lower.includes("entertainment")) return Film;
    return ShoppingCart;
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC] dark:bg-[#0D0E12] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Live Database Allocations
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Prisma Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Category Budget Guard
          </h1>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.name);
                const spent = categorySpendMap[cat.name] || 0;
                const allocated = 15000; // Baseline dynamic allocation
                const percent = Math.min(100, Math.round((spent / allocated) * 100));

                return (
                  <div key={cat.id} className="p-5 sm:p-6 rounded-3xl fintech-card fintech-card-hover space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] flex items-center justify-center font-bold">
                          <Icon className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-base font-bold text-slate-900 dark:text-white">
                            {cat.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Spent {formatCurrency(spent, currency)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-base font-black ${percent > 80 ? "text-rose-500" : percent > 50 ? "text-amber-500" : "text-emerald-500"}`}>
                          {percent}%
                        </div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          {percent > 80 ? "Burn Alert" : percent > 50 ? "Moderate" : "Safe Pacing"}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out`}
                        style={{ width: `${Math.max(4, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}