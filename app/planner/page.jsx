"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { formatCurrency } from "@/lib/utils";
import { 
  Plane, 
  Stethoscope, 
  Sparkles, 
  GraduationCap, 
  Fuel, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight,
  TrendingDown,
  Layers,
  FileText,
  Clock,
  X,
  Loader2
} from "lucide-react";

const TEMPLATES = [
  {
    title: "Family Pilgrimage / Trip",
    category: "TRAVEL",
    icon: Plane,
    targetAmount: 25000,
    color: "from-blue-500/20 to-indigo-500/10",
    border: "border-blue-500/30",
    badge: "text-blue-500 bg-blue-500/10",
    defaultItems: [
      { title: "Train / Flight Tickets", amount: 10000 },
      { title: "Hotel & Stay", amount: 8000 },
      { title: "Dining & Food", amount: 4500 },
      { title: "Local Sightseeing & Commute", amount: 2500 },
    ],
  },
  {
    title: "Medical Checkup & Dental Care",
    category: "MEDICAL",
    icon: Stethoscope,
    targetAmount: 15000,
    color: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-500/30",
    badge: "text-rose-500 bg-rose-500/10",
    defaultItems: [
      { title: "Consultation & Diagnostics", amount: 3500 },
      { title: "Pharmacy & Medications", amount: 4500 },
      { title: "Treatment Procedure", amount: 7000 },
    ],
  },
  {
    title: "Diwali / Festive Shopping",
    category: "CELEBRATION",
    icon: Sparkles,
    targetAmount: 20000,
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/30",
    badge: "text-amber-500 bg-amber-500/10",
    defaultItems: [
      { title: "Family Clothes & Attire", amount: 10000 },
      { title: "Sweets & Festive Feast", amount: 5000 },
      { title: "Gifts for Relatives", amount: 5000 },
    ],
  },
  {
    title: "Annual School Fees & Uniform",
    category: "EDUCATION",
    icon: GraduationCap,
    targetAmount: 35000,
    color: "from-purple-500/20 to-violet-500/10",
    border: "border-purple-500/30",
    badge: "text-purple-500 bg-purple-500/10",
    defaultItems: [
      { title: "Term Tuition Fees", amount: 25000 },
      { title: "Books & Stationery", amount: 4500 },
      { title: "School Uniform & Shoes", amount: 5500 },
    ],
  },
  {
    title: "Monthly Petrol & Routine Bills",
    category: "ROUTINE_CYCLE",
    icon: Fuel,
    targetAmount: 12000,
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/30",
    badge: "text-emerald-500 bg-emerald-500/10",
    defaultItems: [
      { title: "Bike / Car Petrol (4 Fills)", amount: 5000 },
      { title: "LPG Cooking Gas Cylinder", amount: 803 },
      { title: "Broadband & Mobile Recharges", amount: 2200 },
      { title: "Electricity & Water Bill", amount: 3997 },
    ],
  },
];

export default function PlannerPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("TRAVEL");
  const [newTargetAmount, setNewTargetAmount] = useState("");
  const [newAllocatedAmount, setNewAllocatedAmount] = useState("");
  const [newTargetDate, setNewTargetDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newItems, setNewItems] = useState([
    { title: "Primary Expense", amount: "" }
  ]);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/planner");
      const json = await res.json();
      setEvents(json.events || []);
    } catch (e) {
      console.error("Failed to load planner events:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleApplyTemplate = (tmpl) => {
    setNewTitle(tmpl.title);
    setNewCategory(tmpl.category);
    setNewTargetAmount(String(tmpl.targetAmount));
    setNewAllocatedAmount(String(Math.round(tmpl.targetAmount * 0.4)));
    setNewItems(tmpl.defaultItems.map((item) => ({ title: item.title, amount: String(item.amount) })));
    setShowCreateModal(true);
  };

  const handleToggleItemPaid = async (itemId, currentStatus) => {
    try {
      // Optimistic update
      setEvents((prev) =>
        prev.map((ev) => ({
          ...ev,
          items: ev.items.map((it) =>
            it.id === itemId ? { ...it, isPaid: !currentStatus } : it
          ),
        }))
      );

      await fetch("/api/planner", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, isPaid: !currentStatus }),
      });
    } catch (e) {
      console.error("Item toggle error:", e);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const payload = {
        title: newTitle.trim(),
        category: newCategory,
        targetAmount: parseFloat(newTargetAmount) || 0,
        allocatedAmount: parseFloat(newAllocatedAmount) || 0,
        targetDate: newTargetDate || null,
        notes: newNotes,
        items: newItems
          .filter((i) => i.title.trim())
          .map((i) => ({ title: i.title.trim(), amount: parseFloat(i.amount) || 0 })),
      };

      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewTitle("");
        setNewTargetAmount("");
        setNewAllocatedAmount("");
        setNewNotes("");
        setNewItems([{ title: "Primary Expense", amount: "" }]);
        fetchEvents();
      }
    } catch (err) {
      console.error("Event creation error:", err);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC] dark:bg-[#0D0E12] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Envelope & Cycle Management
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">• Horizon Forecasting</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Special Event & Cycle Planner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
              Ring-fence funds for family trips, medical procedures, school fees, and recurring petrol/utility cycles without breaking your daily Safe-to-Spend velocity.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all active:scale-98 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        </div>

        {/* Quick Plan Templates Carousel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              One-Tap Plan Templates
            </span>
            <span className="text-[11px] text-slate-400">Click to customize</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TEMPLATES.map((tmpl) => {
              const Icon = tmpl.icon;
              return (
                <button
                  key={tmpl.title}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 bg-gradient-to-tr ${tmpl.color} ${tmpl.border} hover:scale-102 shadow-sm`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tmpl.badge}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                      {tmpl.title}
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      ₹{tmpl.targetAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Plans List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Active Plans & Envelopes ({events.length})
            </h2>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
              <span className="text-xs text-slate-400">Loading planned envelopes...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 rounded-3xl fintech-card p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400 mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No active event plans yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Pick a template above or click <strong>Create New Plan</strong> to plan for upcoming travel, medical treatment, or monthly routine petrol envelopes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {events.map((ev) => {
                const percent = ev.targetAmount > 0 
                  ? Math.min(100, Math.round((ev.allocatedAmount / ev.targetAmount) * 100)) 
                  : 0;

                return (
                  <div
                    key={ev.id}
                    className="rounded-3xl fintech-card p-6 border border-black/[0.08] dark:border-white/[0.08] shadow-md flex flex-col justify-between space-y-5"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {ev.category}
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1.5">
                            {ev.title}
                          </h3>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-slate-900 dark:text-white">
                            ₹{ev.targetAmount.toLocaleString("en-IN")}
                          </div>
                          <span className="text-[10px] text-slate-400">Target Envelope</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 my-3">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Funded / Allocated:</span>
                          <span className="text-emerald-500 font-bold">
                            ₹{ev.allocatedAmount.toLocaleString("en-IN")} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Sub-Items Checklist */}
                      {ev.items && ev.items.length > 0 && (
                        <div className="space-y-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Itemized Checklist
                          </div>
                          <div className="space-y-1.5">
                            {ev.items.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleToggleItemPaid(item.id, item.isPaid)}
                                className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                  item.isPaid
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-slate-400 line-through"
                                    : "bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-700 dark:text-slate-300 hover:border-black/20"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {item.isPaid ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                                  )}
                                  <span className="font-medium">{item.title}</span>
                                </div>
                                <span className="font-bold">
                                  ₹{item.amount.toLocaleString("en-IN")}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes Section */}
                      {ev.notes && (
                        <div className="mt-4 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{ev.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Safe-to-Spend Pace Impact Pill */}
                    <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Pace Shield Active</span>
                      </div>
                      <span>Ring-fenced from daily burn</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#F8FAFC] dark:bg-[#121316] border border-black/10 dark:border-white/10 p-6 sm:p-7 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Create Event / Cycle Envelope
                </h3>
                <p className="text-xs text-slate-500">Plan a one-off trip, surgery, or routine petrol envelope.</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Plan Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Family Trip to Ooty, Dental Implant, Diwali Shopping"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#1A1D24] border border-black/10 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="TRAVEL" className="bg-white dark:bg-[#16181E] text-slate-900 dark:text-white">Family Travel / Vacation</option>
                    <option value="MEDICAL" className="bg-white dark:bg-[#16181E] text-slate-900 dark:text-white">Medical & Healthcare</option>
                    <option value="CELEBRATION" className="bg-white dark:bg-[#16181E] text-slate-900 dark:text-white">Wedding & Festivals</option>
                    <option value="EDUCATION" className="bg-white dark:bg-[#16181E] text-slate-900 dark:text-white">School / College Fees</option>
                    <option value="ROUTINE_CYCLE" className="bg-white dark:bg-[#16181E] text-slate-900 dark:text-white">Monthly Routine Envelope</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={newTargetAmount}
                    onChange={(e) => setNewTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Initial Fund Allocated (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={newAllocatedAmount}
                    onChange={(e) => setNewAllocatedAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Sub-items checklist builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Itemized Breakdown</span>
                  <button
                    type="button"
                    onClick={() => setNewItems([...newItems, { title: "", amount: "" }])}
                    className="text-emerald-500 hover:text-emerald-600 text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {newItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item name (e.g. Flight, Hotel)"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...newItems];
                          updated[idx].title = e.target.value;
                          setNewItems(updated);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="₹ Amount"
                        value={item.amount}
                        onChange={(e) => {
                          const updated = [...newItems];
                          updated[idx].amount = e.target.value;
                          setNewItems(updated);
                        }}
                        className="w-24 px-3 py-1.5 rounded-lg bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes & Reminders
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Check hotel discounts on Tuesday, book train 60 days before."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25"
                >
                  Activate Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
