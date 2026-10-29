"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { formatCurrency } from "@/lib/utils";
import { 
  Target, 
  Sparkles, 
  Loader2, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  ShieldAlert, 
  TrendingDown, 
  Clock, 
  Share2, 
  Flame, 
  Coins, 
  Car, 
  GraduationCap, 
  Plane, 
  AlertTriangle, 
  X, 
  Check, 
  Copy, 
  DollarSign, 
  Trash2,
  Zap,
  ArrowRight
} from "lucide-react";

const GOAL_TEMPLATES = [
  {
    title: "Diwali / Festive Shopping & Gifting",
    category: "FESTIVAL",
    icon: Flame,
    defaultTarget: 25000,
    defaultDays: 45,
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/30",
    badge: "text-amber-500 bg-amber-500/10",
  },
  {
    title: "Sovereign Gold / Physical Gold Asset",
    category: "ASSET",
    icon: Coins,
    defaultTarget: 60000,
    defaultDays: 90,
    color: "from-yellow-500/20 to-amber-500/10",
    border: "border-yellow-500/30",
    badge: "text-yellow-500 bg-yellow-500/10",
  },
  {
    title: "3-Month Emergency Survival Cushion",
    category: "EMERGENCY",
    icon: ShieldAlert,
    defaultTarget: 100000,
    defaultDays: 180,
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/30",
    badge: "text-emerald-500 bg-emerald-500/10",
  },
  {
    title: "Bike / EV Scooter Down Payment",
    category: "VEHICLE",
    icon: Car,
    defaultTarget: 35000,
    defaultDays: 60,
    color: "from-blue-500/20 to-indigo-500/10",
    border: "border-blue-500/30",
    badge: "text-blue-500 bg-blue-500/10",
  },
  {
    title: "School / College Semester Fees",
    category: "EDUCATION",
    icon: GraduationCap,
    defaultTarget: 40000,
    defaultDays: 75,
    color: "from-purple-500/20 to-violet-500/10",
    border: "border-purple-500/30",
    badge: "text-purple-500 bg-purple-500/10",
  },
  {
    title: "Annual Family Vacation / Pilgrimage",
    category: "TRAVEL",
    icon: Plane,
    defaultTarget: 30000,
    defaultDays: 60,
    color: "from-sky-500/20 to-cyan-500/10",
    border: "border-sky-500/30",
    badge: "text-sky-500 bg-sky-500/10",
  },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("INR");
  const [extraContribution, setExtraContribution] = useState(2500);

  // Modals & Action States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(null); // goal object
  const [depositAmount, setDepositAmount] = useState("");
  const [notification, setNotification] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // New Goal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("FESTIVAL");
  const [newTargetAmount, setNewTargetAmount] = useState(25000);
  const [newCurrentAmount, setNewCurrentAmount] = useState(0);
  const [newTargetDate, setNewTargetDate] = useState("");
  const [newAutoTighten, setNewAutoTighten] = useState(true);

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/goals", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load goals");
      const json = await res.json();
      setGoals(json.goals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
    const d = new Date();
    d.setDate(d.getDate() + 45);
    setNewTargetDate(d.toISOString().split("T")[0]);
  }, []);

  const triggerNotify = (text, type = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Create New Goal
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTargetAmount) return;

    setActionLoading("create");
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          targetAmount: parseFloat(newTargetAmount),
          currentAmount: parseFloat(newCurrentAmount) || 0,
          targetDate: newTargetDate,
          priority: 1,
          autoTightenPace: Boolean(newAutoTighten),
        }),
      });

      if (!res.ok) throw new Error("Failed to create goal");
      await fetchGoals();
      setShowAddModal(false);
      setNewTitle("");
      triggerNotify("Future target created and live tracking activated!");
    } catch (err) {
      triggerNotify(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // 2. Select Template Preset
  const handleApplyTemplate = (tpl) => {
    setNewTitle(tpl.title);
    setNewCategory(tpl.category);
    setNewTargetAmount(tpl.defaultTarget);
    const d = new Date();
    d.setDate(d.getDate() + tpl.defaultDays);
    setNewTargetDate(d.toISOString().split("T")[0]);
  };

  // 3. Deposit / Save Money directly to Goal
  const handleDepositFunds = async () => {
    if (!showDepositModal || !depositAmount) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    setActionLoading("deposit");
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: showDepositModal.id,
          action: "ADD_FUNDS",
          amount,
        }),
      });

      if (!res.ok) throw new Error("Failed to add funds");
      await fetchGoals();
      setShowDepositModal(null);
      setDepositAmount("");
      triggerNotify(`Saved ${formatCurrency(amount, currency)} into ${showDepositModal.title}!`);
    } catch (err) {
      triggerNotify(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // 4. Extend Target Goal Timing
  const handleExtendDeadline = async (goalId, days) => {
    setActionLoading("extend-" + goalId);
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId,
          action: "EXTEND_DEADLINE",
          extendDays: days,
        }),
      });

      if (!res.ok) throw new Error("Failed to extend deadline");
      await fetchGoals();
      triggerNotify(`Timeline extended by +${days} days. Daily savings requirement reduced!`);
    } catch (err) {
      triggerNotify(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // 5. Toggle Auto-Tighten Daily Spending Pace
  const handleToggleAutoTighten = async (goalId, currentVal) => {
    setActionLoading("tighten-" + goalId);
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId,
          action: "TOGGLE_TIGHTEN",
          autoTightenPace: !currentVal,
        }),
      });

      if (!res.ok) throw new Error("Failed to toggle pacing shield");
      await fetchGoals();
      triggerNotify(!currentVal ? "Auto-Pacing Shield activated: Daily spend will automatically throttle to protect this goal!" : "Auto-Pacing Shield deactivated.");
    } catch (err) {
      triggerNotify(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // 6. Share the Track
  const handleShareTrack = async (goal) => {
    const text = `🎯 SpendPace Milestone: "${goal.title}"\nTarget: ${formatCurrency(goal.targetAmount, currency)} | Saved: ${formatCurrency(goal.currentAmount, currency)} (${goal.percentReached}%)\nDays Remaining: ${goal.daysRemaining} days\nTracking live on SpendPace!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SpendPace Goal: ${goal.title}`,
          text,
          url: window.location.href,
        });
        return;
      } catch (e) {}
    }

    try {
      await navigator.clipboard.writeText(text);
      triggerNotify("Milestone tracking summary copied to clipboard! Share anywhere.");
    } catch (e) {
      triggerNotify("Failed to copy track", "error");
    }
  };

  // 7. Delete Goal
  const handleDeleteGoal = async (goalId) => {
    if (!confirm("Are you sure you want to remove this goal?")) return;
    try {
      const res = await fetch(`/api/goals?id=${goalId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchGoals();
        triggerNotify("Goal milestone removed");
      }
    } catch (e) {
      triggerNotify("Failed to delete goal", "error");
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC] dark:bg-[#0D0E12] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Cluster */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                Future Targets & Festive Milestones
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Pacing Automation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              Financial Goals Accelerator
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Plan upcoming festival expenses, gold purchases, and emergency buffers. If your daily spend runs too high, 
              SpendPace automatically alerts and throttles daily velocity to ensure your target is never compromised.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-102 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Future Target</span>
            </button>
          </div>
        </div>

        {/* Floating Notification Toast */}
        {notification && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in fade-in-0 duration-200 ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}>
            {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-xs font-semibold">{notification.text}</span>
          </div>
        )}

        {/* Dynamic Simulator Banner */}
        <div className="p-6 sm:p-8 rounded-3xl fintech-card border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Velocity Milestone Simulator
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-6">
            Adjust your monthly savings redirect to see how throttling non-essential expenses accelerates your next festival or asset milestone.
          </p>

          <div className="space-y-4 max-w-xl">
            <div className="flex justify-between text-xs sm:text-sm font-semibold">
              <span>Redirect Discretionary Savings:</span>
              <span className="text-emerald-500 font-bold">+{formatCurrency(extraContribution, currency)} / month</span>
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="500"
              value={extraContribution}
              onChange={(e) => setExtraContribution(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>
              ⚡ Pacing Impact: Accelerates milestone completion by approximately <strong className="text-emerald-500">{Math.round(extraContribution / 120)} days</strong>.
            </span>
          </div>
        </div>

        {/* Real Goals Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Loading verified milestone ledger...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="py-16 text-center space-y-4 rounded-3xl fintech-card p-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No active goals or festival targets yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Set an upcoming festival expense target (Diwali, Pongal, Eid) or emergency reserve to activate automatic pace shielding.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
            >
              + Create First Target
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const isShortage = goal.status === "SHORTAGE_RISK";
              const isCompleted = goal.status === "COMPLETED";

              return (
                <div 
                  key={goal.id} 
                  className={`p-6 rounded-3xl fintech-card flex flex-col justify-between space-y-5 transition-all duration-300 ${
                    isShortage 
                      ? "border-2 border-rose-500/40 shadow-lg shadow-rose-500/10 bg-rose-500/[0.02]" 
                      : goal.autoTightenPace 
                        ? "border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10" 
                        : "border border-black/[0.08] dark:border-white/[0.08]"
                  }`}
                >
                  <div>
                    {/* Top Status & Badge Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                        {goal.category || "GENERAL"}
                      </span>

                      {/* Status Badges */}
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Achieved</span>
                        </span>
                      ) : isShortage ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500 text-white shadow-sm shadow-rose-500/30 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Shortage Risk</span>
                        </span>
                      ) : goal.autoTightenPace ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Zap className="w-3 h-3" />
                          <span>Pacing Shield</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-500">
                          {goal.percentReached}% Reached
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {goal.title}
                      </h3>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                        title="Delete Target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Financial Figures */}
                    <div className="mt-3 space-y-0.5">
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(goal.currentAmount, currency)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>Target: {formatCurrency(goal.targetAmount, currency)}</span>
                        <span>Deficit: <strong className="text-rose-500">{formatCurrency(goal.remainingAmount, currency)}</strong></span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full h-2.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden mb-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            isCompleted 
                              ? "bg-emerald-500" 
                              : isShortage 
                                ? "bg-gradient-to-r from-amber-500 to-rose-500" 
                                : "bg-gradient-to-r from-emerald-500 to-teal-400"
                          }`}
                          style={{ width: `${goal.percentReached}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{goal.daysRemaining} days left</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Req: {formatCurrency(goal.requiredDailySavings, currency)}/day
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Controls & Human FinTech Expansion */}
                  <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-2.5">
                    {/* Primary Button: Save / Add Funds Directly */}
                    <button
                      onClick={() => setShowDepositModal(goal)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save / Add Funds</span>
                    </button>

                    {/* Control Row: Auto-Tighten Spend & Extend Deadline */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleToggleAutoTighten(goal.id, goal.autoTightenPace)}
                        disabled={actionLoading === "tighten-" + goal.id}
                        className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                          goal.autoTightenPace
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-black/[0.03] dark:bg-white/[0.04] border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                        title="Throttles daily discretionary spending limit so this goal is guaranteed"
                      >
                        <TrendingDown className="w-3 h-3 text-emerald-500" />
                        <span>{goal.autoTightenPace ? "Shield Active" : "Auto-Throttle"}</span>
                      </button>

                      <button
                        onClick={() => handleExtendDeadline(goal.id, 30)}
                        disabled={actionLoading === "extend-" + goal.id}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-bold bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                        title="Extends target date by +30 days to reduce daily savings burden"
                      >
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Extend (+30d)</span>
                      </button>
                    </div>

                    {/* Share Track Action */}
                    <button
                      onClick={() => handleShareTrack(goal)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Share Track</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Future Target with Festive Presets */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-xl rounded-3xl fintech-card p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Create Future Milestone / Festival Target
                    </h3>
                    <p className="text-xs text-slate-500">
                      Preset templates with automated pacing protection
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Template Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1-Click Festive & Milestones Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GOAL_TEMPLATES.map((tpl, i) => {
                    const Icon = tpl.icon;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className="p-2.5 rounded-xl text-left border border-black/10 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[11px] font-bold truncate text-slate-900 dark:text-white">
                            {tpl.category}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {formatCurrency(tpl.defaultTarget, currency)} • {tpl.defaultDays}d
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Goal Form Fields */}
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diwali Festive Shopping, Sovereign Gold, Child Admission"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Target Amount (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="500"
                      step="500"
                      value={newTargetAmount}
                      onChange={(e) => setNewTargetAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Initial Savings Deposited (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={newCurrentAmount}
                      onChange={(e) => setNewCurrentAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Target Deadline Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newTargetDate}
                      onChange={(e) => setNewTargetDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Milestone Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1A1D24] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="FESTIVAL" className="bg-white dark:bg-[#16181E] text-slate-900 dark:text-white">Festival & Holidays</option>
                      <option value="ASSET" className="bg-white dark:bg-[#16181E] text-slate-900 dark:text-white">Gold & Investments</option>
                      <option value="EMERGENCY" className="bg-white dark:bg-[#16181E] text-slate-900 dark:text-white">Emergency Buffer</option>
                      <option value="VEHICLE" className="bg-white dark:bg-[#16181E] text-slate-900 dark:text-white">Vehicle & Transport</option>
                      <option value="EDUCATION" className="bg-white dark:bg-[#16181E] text-slate-900 dark:text-white">Education & Fees</option>
                      <option value="TRAVEL" className="bg-white dark:bg-[#16181E] text-slate-900 dark:text-white">Family Trip / Travel</option>
                    </select>
                  </div>
                </div>

                {/* Auto-Tighten Checkbox */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="tightenCheckbox"
                    checked={newAutoTighten}
                    onChange={(e) => setNewAutoTighten(e.target.checked)}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <label htmlFor="tightenCheckbox" className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="block text-emerald-600 dark:text-emerald-400 font-bold">
                      Enable AI Pacing Shield (Auto-Throttle)
                    </strong>
                    Automatically carves out required daily savings from your safe daily spending limit to guarantee this milestone completes on time.
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === "create"}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25"
                  >
                    {actionLoading === "create" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Activate Target</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Save / Add Funds Directly to Goal */}
        {showDepositModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl fintech-card p-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Save Money into Goal
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {showDepositModal.title}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowDepositModal(null)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Quick Increment Chips */}
              <div className="flex flex-wrap gap-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(String(amt))}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  >
                    +{formatCurrency(amt, currency)}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Custom Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  min="10"
                  step="50"
                  placeholder="e.g. 1500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-bold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-black/10 dark:border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDepositFunds}
                  disabled={actionLoading === "deposit"}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                >
                  {actionLoading === "deposit" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Confirm Savings</span>
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