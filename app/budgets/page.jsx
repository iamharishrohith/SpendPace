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
  ShoppingCart,
  Plus,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  X,
  TrendingUp,
  Sparkles
} from "lucide-react";

export default function BudgetsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBudget, setEditingBudget] = useState(null);
  const [allocInput, setAllocInput] = useState("");
  const [thresholdInput, setThresholdInput] = useState("80");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchBudgets = async () => {
    try {
      const res = await fetch("/api/budgets");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Budgets fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setAllocInput(budget.allocatedAmount ? budget.allocatedAmount.toString() : "10000");
    setThresholdInput(Math.round((budget.alertThreshold || 0.8) * 100).toString());
  };

  const handleSaveBudget = async () => {
    if (!editingBudget) return;
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: editingBudget.categoryId,
          allocatedAmount: parseFloat(allocInput) || 0,
          alertThreshold: (parseFloat(thresholdInput) || 80) / 100,
          monthYear: data?.monthYear,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save budget");

      setStatusMsg({ type: "success", text: `Updated budget for ${editingBudget.categoryName}` });
      setEditingBudget(null);
      await fetchBudgets();
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

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

  const budgets = data?.budgets || [];
  const currency = "INR";

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC] dark:bg-[#0D0E12] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                Category Allocations & Guards
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Live Postgres Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              Smart Category Budgeting
            </h1>
          </div>

          {data && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Cycle: <strong>{data.monthYear}</strong></span>
            </div>
          )}
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
            statusMsg.type === "success" 
              ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/25 text-rose-500"
          }`}>
            {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top KPI Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl fintech-card space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Allocated Budget</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(data?.totalAllocated || 0, currency)}
                </div>
                <p className="text-[11px] text-slate-500">Across {budgets.length} categorized envelopes</p>
              </div>

              <div className="p-5 rounded-3xl fintech-card space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Month-to-Date Spend</span>
                <div className="text-xl sm:text-2xl font-black text-rose-500">
                  {formatCurrency(data?.totalSpent || 0, currency)}
                </div>
                <p className="text-[11px] text-slate-500">{data?.overallUsagePercent}% of overall envelope utilized</p>
              </div>

              <div className="p-5 rounded-3xl fintech-card space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Safe Remaining Headroom</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-500">
                  {formatCurrency(data?.totalRemaining || 0, currency)}
                </div>
                <p className="text-[11px] text-slate-500">Unspent buffer protecting liquidity</p>
              </div>
            </div>

            {/* Category Budgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((cat) => {
                const Icon = getCategoryIcon(cat.categoryName);
                const percent = cat.usagePercent;
                const isOver = cat.isOverBudget;
                const isWarning = cat.status === "WARNING";

                return (
                  <div key={cat.categoryId} className="p-5 sm:p-6 rounded-3xl fintech-card fintech-card-hover space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold"
                          style={{ backgroundColor: `${cat.colorHex}18` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: cat.colorHex }} />
                        </div>
                        <div>
                          <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{cat.categoryName}</span>
                            {cat.isCustomSet && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500">
                                Customized
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Spent {formatCurrency(cat.spentAmount, currency)} of {formatCurrency(cat.allocatedAmount, currency)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-base font-black ${
                          isOver ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-500"
                        }`}>
                          {percent}%
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${
                          isOver ? "text-rose-500" : isWarning ? "text-amber-500" : "text-slate-400"
                        }`}>
                          {isOver ? "Limit Exceeded" : isWarning ? "Burn Alert" : "Safe Pacing"}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(4, percent))}%` }}
                      />
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Headroom: <strong>{formatCurrency(cat.remainingAmount, currency)}</strong>
                      </span>
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-black/[0.04] dark:bg-white/[0.06] hover:bg-emerald-500 hover:text-white transition-all text-slate-700 dark:text-slate-300"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Adjust Limit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal: Adjust / Set Budget */}
        {editingBudget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl fintech-card p-6 sm:p-7 border border-black/10 dark:border-white/15 space-y-5 bg-[#FFFFFF] dark:bg-[#12141A] shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Adjust Category Budget
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Set safe monthly envelope for <strong>{editingBudget.categoryName}</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setEditingBudget(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 bg-black/5 dark:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Monthly Allocated Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={allocInput}
                    onChange={(e) => setAllocInput(e.target.value)}
                    placeholder="e.g. 12000"
                    className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Alert Warning Threshold (% of limit)
                  </label>
                  <input
                    type="number"
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(e.target.value)}
                    placeholder="e.g. 80"
                    min="10"
                    max="100"
                    className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Triggers a high-burn warning badge when category spend crosses this percentage.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Current spend in this envelope: <strong>{formatCurrency(editingBudget.spentAmount, currency)}</strong>
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBudget(null)}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-black/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveBudget}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Allocation</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
