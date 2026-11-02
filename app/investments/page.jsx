"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
  Sparkles, 
  Coins, 
  ShieldCheck, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Filter, 
  Trash2, 
  RotateCcw,
  Check,
  Landmark,
  Shield,
  Layers,
  ArrowUpRight
} from "lucide-react";

const FREQUENCIES = [
  { id: "ALL", label: "All Schedules" },
  { id: "QUARTERLY", label: "Quarterly" },
  { id: "HALF_YEARLY", label: "Half-Yearly" },
  { id: "YEARLY", label: "Yearly" },
  { id: "MONTHLY", label: "Monthly" },
];

const INVESTMENT_TYPES = [
  { id: "MUTUAL_FUND_SIP", label: "Mutual Fund SIP", color: "emerald", icon: TrendingUp },
  { id: "DIGITAL_GOLD", label: "Digital Gold / SGB", color: "amber", icon: Coins },
  { id: "LIC_POLICY", label: "LIC & Life Policy", color: "indigo", icon: ShieldCheck },
  { id: "HEALTH_INSURANCE", label: "Health Insurance", color: "blue", icon: Shield },
  { id: "PPF_NPS", label: "PPF / NPS / Govt", color: "teal", icon: Landmark },
  { id: "FD_RD", label: "Fixed / Recurring Deposit", color: "purple", icon: Layers },
];

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState({
    totalPortfolioValue: 0,
    totalMonthlyAmortizedReserve: 0,
    totalDailyReserveImpact: 0,
    totalCount: 0,
    upcomingDueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedFrequency, setSelectedFrequency] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "MUTUAL_FUND_SIP",
    frequency: "QUARTERLY",
    installmentAmount: "",
    currentValue: "",
    targetValue: "",
    nextDueDate: new Date().toISOString().split("T")[0],
    policyFolioNumber: "",
    autoPaceReserve: true,
    notes: "",
  });

  const fetchInvestments = async (freq = selectedFrequency) => {
    try {
      setLoading(true);
      const url = freq === "ALL" ? "/api/investments" : `/api/investments?frequency=${freq}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setInvestments(data.investments || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to load investments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments(selectedFrequency);
  }, [selectedFrequency]);

  const handleCreateInvestment = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          installmentAmount: parseFloat(formData.installmentAmount) || 0,
          currentValue: parseFloat(formData.currentValue) || 0,
          targetValue: parseFloat(formData.targetValue) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          name: "",
          type: "MUTUAL_FUND_SIP",
          frequency: "QUARTERLY",
          installmentAmount: "",
          currentValue: "",
          targetValue: "",
          nextDueDate: new Date().toISOString().split("T")[0],
          policyFolioNumber: "",
          autoPaceReserve: true,
          notes: "",
        });
        await fetchInvestments(selectedFrequency);
      }
    } catch (err) {
      console.error("Create investment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const res = await fetch("/api/investments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "MARK_PAID" }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchInvestments(selectedFrequency);
      }
    } catch (err) {
      console.error("Mark paid error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this investment/policy tracking?")) return;
    try {
      const res = await fetch(`/api/investments?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchInvestments(selectedFrequency);
      }
    } catch (err) {
      console.error("Delete investment error:", err);
    }
  };

  const getTypeMeta = (typeKey) => {
    return INVESTMENT_TYPES.find((t) => t.id === typeKey) || INVESTMENT_TYPES[0];
  };

  const formatINR = (val) => {
    return "₹" + Math.round(val || 0).toLocaleString("en-IN");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header cluster */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                AI Finance Manager Portfolio
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3 h-3 text-amber-500" /> Auto-Amortized Pacing Shield
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              SIP, Digi Gold & Policy Vault
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Track recurring SIPs, Digital Gold, and LIC/Insurance policies across Quarterly, Half-Yearly, Yearly, and Monthly schedules with autonomous cashflow reserves.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Policy / SIP</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#141C2B] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Portfolio Value</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatINR(summary.totalPortfolioValue)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Accumulated SIPs, Gold & Policy Corpus
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#141C2B] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Monthly Reserve Provision</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatINR(summary.totalMonthlyAmortizedReserve)}
              <span className="text-xs font-semibold text-slate-400 font-normal ml-1">/month</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Amortized from Quarterly/Yearly commitments
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#141C2B] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Safe Daily Shield Impact</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatINR(summary.totalDailyReserveImpact)}
              <span className="text-xs font-semibold text-slate-400 font-normal ml-1">/day</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Safely ring-fenced to prevent premium shocks
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#141C2B] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Commitments</span>
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.totalCount}
              {summary.upcomingDueCount > 0 && (
                <span className="text-xs font-bold text-amber-500 ml-2">
                  ({summary.upcomingDueCount} due soon)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Covering SIP, Gold, LIC & Health
            </p>
          </div>
        </div>

        {/* Schedule Filter Tabs */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06]">
            {FREQUENCIES.map((freq) => (
              <button
                key={freq.id}
                onClick={() => setSelectedFrequency(freq.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedFrequency === freq.id
                    ? "bg-white dark:bg-[#1C2638] text-slate-950 dark:text-white shadow-xs font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {freq.label}
              </button>
            ))}
          </div>
        </div>

        {/* Investment Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-semibold">Loading investment and policy portfolio...</p>
          </div>
        ) : investments.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white dark:bg-[#141C2B] border border-black/[0.06] dark:border-white/[0.08] p-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Investments Tracked</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
              Add your Mutual Fund SIPs, Digital Gold, or LIC policies to track due dates by quarterly, half-yearly, or yearly cycles.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Instrument</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {investments.map((inv) => {
              const meta = getTypeMeta(inv.type);
              const Icon = meta.icon;
              const isOverdue = inv.status === "OVERDUE";
              const isDueSoon = inv.status === "DUE_SOON";

              return (
                <div
                  key={inv.id}
                  className="rounded-2xl bg-white dark:bg-[#141C2B] border border-black/[0.06] dark:border-white/[0.08] p-5 flex flex-col justify-between shadow-xs hover:border-emerald-500/30 transition-all"
                >
                  <div>
                    {/* Top row: Type badge + Frequency pill */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/[0.03] dark:bg-white/[0.05] text-slate-700 dark:text-slate-300">
                        <Icon className="w-3 h-3 text-emerald-500" />
                        {meta.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {inv.frequency}
                      </span>
                    </div>

                    {/* Name & Folio */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {inv.name}
                    </h3>
                    {inv.policyFolioNumber && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Folio / Policy: <span className="font-mono text-slate-700 dark:text-slate-300">{inv.policyFolioNumber}</span>
                      </p>
                    )}

                    {/* Financial details */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                      <div>
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase">Installment</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {formatINR(inv.installmentAmount)}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          ≈ {formatINR(inv.monthlyAmortizedOutflow)}/mo
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase">Current Value</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {formatINR(inv.currentValue)}
                        </span>
                        {inv.targetValue > 0 && (
                          <span className="block text-[10px] text-slate-500">
                            Target: {formatINR(inv.targetValue)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Due Date & Pacing Reserve */}
                    <div className="mt-3 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Next Due Date:
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {new Date(inv.nextDueDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Schedule Status:</span>
                        <span
                          className={`font-black text-[10px] px-2 py-0.5 rounded-md ${
                            isOverdue
                              ? "bg-rose-500/10 text-rose-500"
                              : isDueSoon
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          {isOverdue ? `Overdue by ${Math.abs(inv.daysUntilDue)}d` : isDueSoon ? `Due in ${inv.daysUntilDue} days` : `Due in ${inv.daysUntilDue} days`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <button
                      onClick={() => handleMarkPaid(inv.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 active:scale-95 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Cycle Paid</span>
                    </button>

                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Remove tracking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add New Policy / Investment */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#141C2B] border border-black/10 dark:border-white/10 p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Register Investment or Policy
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Supports SIP, Digi Gold, LIC, and Health Insurance
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateInvestment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instrument / Policy Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. SBI Nifty 50 Index Fund, MMTC-PAMP Digi Gold, LIC Jeevan Labh"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Asset / Policy Category
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {INVESTMENT_TYPES.map((t) => (
                        <option key={t.id} value={t.id} className="dark:bg-[#141C2B]">
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Schedule Frequency *
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="QUARTERLY" className="dark:bg-[#141C2B]">Quarterly (Every 3 months)</option>
                      <option value="HALF_YEARLY" className="dark:bg-[#141C2B]">Half-Yearly (Every 6 months)</option>
                      <option value="YEARLY" className="dark:bg-[#141C2B]">Yearly (Annual Premium)</option>
                      <option value="MONTHLY" className="dark:bg-[#141C2B]">Monthly (Recurring)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Installment / Premium (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={formData.installmentAmount}
                      onChange={(e) => setFormData({ ...formData, installmentAmount: e.target.value })}
                      placeholder="e.g. 15000"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Next Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.nextDueDate}
                      onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Current Value / Corpus (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.currentValue}
                      onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                      placeholder="e.g. 45000"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target / Maturity Corpus (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                      placeholder="Optional, e.g. 500000"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Policy or Folio Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.policyFolioNumber}
                    onChange={(e) => setFormData({ ...formData, policyFolioNumber: e.target.value })}
                    placeholder="e.g. LIC-836-491204"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Auto Pacing Reserve Toggle */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <input
                    type="checkbox"
                    id="autoPaceReserve"
                    checked={formData.autoPaceReserve}
                    onChange={(e) => setFormData({ ...formData, autoPaceReserve: e.target.checked })}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <label htmlFor="autoPaceReserve" className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="block text-emerald-600 dark:text-emerald-400 font-bold">
                      Enable Autonomous Cashflow Pacing Reserve
                    </strong>
                    Amortizes this {formData.frequency.toLowerCase()} payment into a monthly/daily reserve so your Safe-to-Spend limit is never disrupted.
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {submitting ? "Registering..." : "Save Investment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
