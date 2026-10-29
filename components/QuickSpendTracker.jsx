"use client";

import React, { useState } from "react";
import { 
  Coffee, 
  UtensilsCrossed, 
  Pill, 
  Bus, 
  Fuel, 
  Smartphone, 
  ShoppingBasket, 
  Plus, 
  Check, 
  Zap,
  RotateCcw,
  Sparkles,
  X
} from "lucide-react";

const INITIAL_TAGS = [
  { id: "tea", name: "Tea / Chai Time", category: "Dining & Food", icon: Coffee, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
  { id: "food", name: "Outside Food", category: "Dining & Food", icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30" },
  { id: "meds", name: "Medicines", category: "Medical & Health", icon: Pill, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30" },
  { id: "commute", name: "Auto / Bus / Metro", category: "Fuel & Commute", icon: Bus, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30" },
  { id: "petrol", name: "Petrol / Fuel", category: "Fuel & Commute", icon: Fuel, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { id: "recharge", name: "Mobile Recharge", category: "Utilities & Bills", icon: Smartphone, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/30" },
  { id: "grocery", name: "Milk / Daily Ration", category: "Groceries", icon: ShoppingBasket, color: "text-teal-500", bg: "bg-teal-500/10 border-teal-500/30" },
];

export default function QuickSpendTracker({ onExpenseLogged }) {
  const [tags, setTags] = useState(INITIAL_TAGS);
  const [selectedTag, setSelectedTag] = useState(INITIAL_TAGS[0]);
  const [currentAmount, setCurrentAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [recentSuccess, setRecentSuccess] = useState(null);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagCategory, setNewTagCategory] = useState("Dining & Food");

  // Incremental Quick Add (+10, +5, +2, +1, +20, +50)
  const handleAddIncrement = (val) => {
    setCurrentAmount((prev) => prev + val);
  };

  const handleReset = () => {
    setCurrentAmount(10);
  };

  const handleLogMicroSpend = async () => {
    if (currentAmount <= 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/quick-spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: currentAmount,
          tagName: selectedTag.name,
          categoryName: selectedTag.category,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRecentSuccess(`✓ ₹${currentAmount} logged for ${selectedTag.name}! Safe daily pace updated.`);
        setTimeout(() => setRecentSuccess(null), 3500);
        setCurrentAmount(10);
        if (onExpenseLogged) onExpenseLogged();
      }
    } catch (err) {
      console.error("Micro-spend logging error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomTag = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const newTag = {
      id: "custom-" + Date.now(),
      name: newTagName.trim(),
      category: newTagCategory,
      icon: Sparkles,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/30",
    };

    setTags([...tags, newTag]);
    setSelectedTag(newTag);
    setNewTagName("");
    setShowAddCustomModal(false);
  };

  const SelectedIcon = selectedTag.icon;

  return (
    <div className="rounded-3xl fintech-card p-6 sm:p-7 border border-black/[0.08] dark:border-white/[0.08] shadow-lg relative overflow-hidden space-y-5">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Zero Typing • Tap & Go
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">• Live Micro-Spend</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Instant Impulse & Chai Logger
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            For tea lovers, daily snacks, quick commute, petrol & micro-spends. Tap to log without opening forms.
          </p>
        </div>

        <button
          onClick={() => setShowAddCustomModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 self-start sm:self-auto transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Tag</span>
        </button>
      </div>

      {/* Tag Selector Grid */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tags.map((tag) => {
          const Icon = tag.icon;
          const isSelected = selectedTag.id === tag.id;
          return (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all ${
                isSelected
                  ? `${tag.bg} ${tag.color} ring-2 ring-emerald-500/20 shadow-sm scale-102`
                  : "bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-black/20 dark:hover:border-white/20"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tag.name}</span>
            </button>
          );
        })}
      </div>

      {/* Incremental Tap Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Active Tag & Current Amount Display */}
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${selectedTag.bg}`}>
            <SelectedIcon className={`w-6 h-6 ${selectedTag.color}`} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {selectedTag.name}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
              <span>₹{currentAmount}</span>
              <button
                onClick={handleReset}
                title="Reset amount"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Rapid Tap +10, +5, +2, +1, +20, +50 Incremental Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { label: "+₹1", val: 1 },
            { label: "+₹2", val: 2 },
            { label: "+₹5", val: 5 },
            { label: "+₹10", val: 10 },
            { label: "+₹20", val: 20 },
            { label: "+₹50", val: 50 },
            { label: "+₹100", val: 100 },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => handleAddIncrement(btn.val)}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold border border-black/10 dark:border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30 transition-all active:scale-95 text-slate-800 dark:text-slate-200"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Primary Log Action */}
        <button
          onClick={handleLogMicroSpend}
          disabled={loading || currentAmount <= 0}
          className="w-full md:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          {loading ? (
            <span>Updating Pace...</span>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              <span>Log ₹{currentAmount} Now</span>
            </>
          )}
        </button>
      </div>

      {/* Success Notification Banner */}
      {recentSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{recentSuccess}</span>
          </div>
          <button onClick={() => setRecentSuccess(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Custom Tag Creator Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#F8FAFC] dark:bg-[#121316] border border-black/10 dark:border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Add Custom Micro-Spend Tag
              </h4>
              <button 
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomTag} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Tag Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cigarettes / Paan, Gym Shake, Fruit Juice"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Budget Category
                </label>
                <select
                  value={newTagCategory}
                  onChange={(e) => setNewTagCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="Dining & Food">Dining & Food</option>
                  <option value="Fuel & Commute">Fuel & Commute</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Medical & Health">Medical & Health</option>
                  <option value="Utilities & Bills">Utilities & Bills</option>
                  <option value="Shopping">Shopping & Discretionary</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                >
                  Save Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
