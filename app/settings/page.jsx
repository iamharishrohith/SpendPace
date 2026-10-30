"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { formatCurrency } from "@/lib/utils";
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  Save, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  RotateCcw, 
  Plus, 
  Trash2, 
  HelpCircle,
  Building,
  Truck,
  Hammer,
  Handshake,
  Laptop,
  Heart,
  Loader2,
  MessageSquare,
  UserCheck,
  CalendarCheck,
  Clock,
  ExternalLink
} from "lucide-react";

const OCCUPATION_OPTIONS = [
  { id: "SALARIED", label: "Salaried Professional", desc: "Predictable monthly salary, PF, medical cover", icon: Briefcase },
  { id: "BUSINESS", label: "Business & Retail Shop", desc: "Variable cash flow, vendor dues, seasonal peaks", icon: Building },
  { id: "GIG_WORKER", label: "Gig / Delivery Partner", desc: "Daily/weekly payouts, fuel & maintenance expenses", icon: Truck },
  { id: "DAILY_WAGE", label: "Daily Wage & Skilled Trades", desc: "Day-to-day liquidity, cash-heavy wage cycles", icon: Hammer },
  { id: "BROKER_AGENT", label: "Agent / Broker / Commission", desc: "Lump-sum deal commissions, irregular dry spells", icon: Handshake },
  { id: "FREELANCER", label: "Freelancer / Consultant", desc: "Contract invoices, milestone deliverables", icon: Laptop },
];

const MARITAL_OPTIONS = [
  { id: "SINGLE", label: "Single / Independent" },
  { id: "MARRIED_DUAL", label: "Married (Dual Income)" },
  { id: "MARRIED_SINGLE", label: "Married (Sole Earner)" },
  { id: "FAMILY_CAREGIVER", label: "Family Caregiver / Supporting Parents" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Original fetched data for delta comparison
  const [originalData, setOriginalData] = useState(null);

  // Form State
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'liabilities' | 'lending'
  const [fullName, setFullName] = useState("");
  const [occupationCategory, setOccupationCategory] = useState("SALARIED");
  const [occupationSubRole, setOccupationSubRole] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [partTimeIncome, setPartTimeIncome] = useState(0);
  const [spouseIncome, setSpouseIncome] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [payCycleDay, setPayCycleDay] = useState(1);
  const [maritalStatus, setMaritalStatus] = useState("SINGLE");
  const [gender, setGender] = useState("MALE");
  const [dependentsCount, setDependentsCount] = useState(0);
  const [leaveDaysSchedule, setLeaveDaysSchedule] = useState("WEEKENDS");
  const [liabilities, setLiabilities] = useState([]);

  // Money Lent to friends & family state
  const [moneyLent, setMoneyLent] = useState([]);
  const [newLentName, setNewLentName] = useState("");
  const [newLentPhone, setNewLentPhone] = useState("");
  const [newLentAmount, setNewLentAmount] = useState("");
  const [newLentNotes, setNewLentNotes] = useState("");
  const [lendingSubmitting, setLendingSubmitting] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState(null);

  // New liability input row state
  const [newLiabName, setNewLiabName] = useState("");
  const [newLiabMonthly, setNewLiabMonthly] = useState("");
  const [newLiabCategory, setNewLiabCategory] = useState("Bank EMI");
  const [newLiabInformal, setNewLiabInformal] = useState(false);

  // Fetch verified user profile & liabilities from DB
  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      
      const u = data.user || {};
      setOriginalData({ user: u, liabilities: data.liabilities || [], moneyLent: data.moneyLent || [] });

      setFullName(u.fullName || "");
      setOccupationCategory(u.occupationCategory || "SALARIED");
      setOccupationSubRole(u.occupationSubRole || "");
      setMonthlyIncome(u.monthlyIncome || 0);
      setPartTimeIncome(u.partTimeIncome || 0);
      setSpouseIncome(u.spouseIncome || 0);
      setOtherIncome(u.otherIncome || 0);
      setPayCycleDay(u.payCycleDay || 1);
      setMaritalStatus(u.maritalStatus || "SINGLE");
      setGender(u.gender || "MALE");
      setDependentsCount(u.dependentsCount || 0);
      setLeaveDaysSchedule(u.leaveDaysSchedule || "WEEKENDS");
      setLiabilities(data.liabilities || []);
      setMoneyLent(data.moneyLent || []);
    } catch (err) {
      console.error("Settings load error:", err);
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Quick Simulation Accelerators
  const applyIncomeSimulation = (percentage) => {
    const base = originalData?.user?.monthlyIncome || monthlyIncome;
    const simulated = Math.round(base * (1 + percentage / 100));
    setMonthlyIncome(Math.max(0, simulated));
  };

  const handleResetIncome = () => {
    if (originalData?.user?.monthlyIncome !== undefined) {
      setMonthlyIncome(originalData.user.monthlyIncome);
    }
  };

  // Add / Remove Liabilities
  const handleAddLiability = () => {
    if (!newLiabName.trim() || !newLiabMonthly) return;
    const amount = parseFloat(newLiabMonthly);
    if (isNaN(amount) || amount <= 0) return;

    setLiabilities([
      ...liabilities,
      {
        id: "temp-" + Date.now(),
        name: newLiabName.trim(),
        monthlyPayment: amount,
        category: newLiabCategory,
        isInformal: newLiabInformal,
      },
    ]);

    setNewLiabName("");
    setNewLiabMonthly("");
    setNewLiabInformal(false);
  };

  const handleRemoveLiability = (index) => {
    setLiabilities(liabilities.filter((_, idx) => idx !== index));
  };

  // Predictive Pace Calculations
  const totalMonthlyIncome = (parseFloat(monthlyIncome) || 0) + (parseFloat(partTimeIncome) || 0) + (parseFloat(spouseIncome) || 0) + (parseFloat(otherIncome) || 0);
  const totalMonthlyDebt = liabilities.reduce((acc, curr) => acc + (parseFloat(curr.monthlyPayment) || 0), 0);
  const estimatedBaselineLiving = 12000 + (parseInt(dependentsCount, 10) || 0) * 3500;
  const committedOutflow = totalMonthlyDebt + estimatedBaselineLiving;
  const discretionaryPool = Math.max(0, totalMonthlyIncome - committedOutflow);
  const simulatedDailyPace = Math.round(discretionaryPool / 30);

  // Original Pace for comparison
  const origTotalIncome = ((originalData?.user?.monthlyIncome || 0) + (originalData?.user?.partTimeIncome || 0) + (originalData?.user?.spouseIncome || 0) + (originalData?.user?.otherIncome || 0));
  const origDebt = (originalData?.liabilities || []).reduce((acc, c) => acc + (parseFloat(c.monthlyPayment) || 0), 0);
  const origCommitted = origDebt + 12000 + ((originalData?.user?.dependentsCount || 0) * 3500);
  const origDailyPace = Math.round(Math.max(0, origTotalIncome - origCommitted) / 30);
  const paceDelta = simulatedDailyPace - origDailyPace;

  // Lending Action Handlers
  const handleAddLent = async () => {
    if (!newLentName.trim() || !newLentAmount || parseFloat(newLentAmount) <= 0) return;
    setLendingSubmitting(true);
    try {
      const res = await fetch("/api/lending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowerName: newLentName.trim(),
          phone: newLentPhone.trim() || null,
          amount: parseFloat(newLentAmount),
          notes: newLentNotes.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to log lent money");

      setMoneyLent([json.loan, ...moneyLent]);
      setNewLentName("");
      setNewLentPhone("");
      setNewLentAmount("");
      setNewLentNotes("");
      setStatusMessage({ type: "success", text: `Logged ₹${json.loan.amount} lent to ${json.loan.borrowerName}.` });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setLendingSubmitting(false);
    }
  };

  const handleToggleRecovered = async (loanId, currentRecovered) => {
    try {
      const res = await fetch("/api/lending", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: loanId,
          isRecovered: !currentRecovered,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update loan");

      setMoneyLent(moneyLent.map((l) => (l.id === loanId ? { ...l, isRecovered: !currentRecovered, recoveredAt: !currentRecovered ? new Date().toISOString() : null } : l)));
      setStatusMessage({ type: "success", text: !currentRecovered ? "Marked as recovered! Capital unlocked." : "Marked back as active receivable." });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  const handleDeleteLent = async (loanId) => {
    try {
      const res = await fetch(`/api/lending?id=${loanId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete loan entry");
      setMoneyLent(moneyLent.filter((l) => l.id !== loanId));
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  // Save changes to database
  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          monthlyIncome,
          partTimeIncome,
          spouseIncome,
          otherIncome,
          payCycleDay,
          maritalStatus,
          gender,
          dependentsCount,
          occupationCategory,
          occupationSubRole,
          leaveDaysSchedule,
          liabilities,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update profile settings");

      // Update local stored user
      try {
        const stored = localStorage.getItem("spendpace_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.fullName = fullName;
          parsed.monthlyIncome = monthlyIncome;
          localStorage.setItem("spendpace_user", JSON.stringify(parsed));
        }
      } catch (e) {}

      setOriginalData({ user: json.user, liabilities: json.liabilities, moneyLent });
      setStatusMessage({ type: "success", text: "Profile and predictive pace recalibrated successfully!" });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error("Save error:", err);
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC] dark:bg-[#0D0E12] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                Future-Proof Financial Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Predictive Pacing
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              Adaptive Profile & Career Settings
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Life isn&apos;t static. Whether you experience a promotion, pay cut, career switch, or family expansion, 
              SpendPace immediately adapts your safe daily pace to keep you solvent.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Saving Changes..." : "Save & Recalibrate"}</span>
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
            statusMessage.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}>
            {statusMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-xs font-semibold">{statusMessage.text}</span>
          </div>
        )}

        {/* Live Predictive Pace Simulator Floating Banner */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Live Predictive Pace Projection
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Simulated Daily Safe-to-Spend: {formatCurrency(simulatedDailyPace, "INR")} / day
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Based on {formatCurrency(totalMonthlyIncome, "INR")} monthly inflow, {formatCurrency(totalMonthlyDebt, "INR")} debt EMI, and estimated living cost for {dependentsCount} dependents.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-white/[0.04] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Saved Safe Pace</div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {formatCurrency(origDailyPace, "INR")} / day
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Pace Impact</div>
                <div className={`text-sm font-black flex items-center gap-1 ${
                  paceDelta > 0 ? "text-emerald-500" : paceDelta < 0 ? "text-rose-500" : "text-slate-500"
                }`}>
                  {paceDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : paceDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                  <span>{paceDelta > 0 ? `+${formatCurrency(paceDelta, "INR")}` : formatCurrency(paceDelta, "INR")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-View Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "profile"
                ? "bg-white dark:bg-white/[0.12] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
            <span>Profile & Income</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("liabilities")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "liabilities"
                ? "bg-white dark:bg-white/[0.12] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-rose-500" />
            <span>Liabilities & EMIs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/5 dark:bg-white/10 font-bold">
              {liabilities.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "lending"
                ? "bg-white dark:bg-white/[0.12] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Handshake className="w-3.5 h-3.5 text-teal-500" />
            <span>Friends & Money Lent</span>
            {moneyLent.filter(l => !l.isRecovered).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-500/10 text-teal-600 border border-teal-500/20 font-bold">
                {moneyLent.filter(l => !l.isRecovered).length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "profile" && (
          <>
            {/* Section 1: Career & Income Evolution */}
            <div className="rounded-3xl fintech-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Career Trajectory & Income Realism
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch between common socio-economic roles and simulate income adjustments.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Simulation Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Career Scenario Stress Test & Growth Simulator
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => applyIncomeSimulation(15)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all flex items-center gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                <span>+15% Promotion</span>
              </button>
              <button
                type="button"
                onClick={() => applyIncomeSimulation(30)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all flex items-center gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                <span>+30% Career Switch</span>
              </button>
              <button
                type="button"
                onClick={() => applyIncomeSimulation(-20)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all flex items-center gap-1"
              >
                <TrendingDown className="w-3 h-3" />
                <span>-20% Pay Cut / Downturn</span>
              </button>
              <button
                type="button"
                onClick={() => applyIncomeSimulation(-40)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>-40% Crisis Mode</span>
              </button>
              <button
                type="button"
                onClick={handleResetIncome}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Saved</span>
              </button>
            </div>
          </div>

          {/* Occupation Role Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Primary Role Classification
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {OCCUPATION_OPTIONS.map((occ) => {
                const Icon = occ.icon;
                const isSelected = occupationCategory === occ.id;
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setOccupationCategory(occ.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/30"
                        : "bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-500" : "text-slate-500"}`} />
                      <span className={`text-xs font-bold ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                        {occ.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {occ.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Designation & Salary Cycle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Specific Designation / Sub-Role
              </label>
              <input
                type="text"
                value={occupationSubRole}
                onChange={(e) => setOccupationSubRole(e.target.value)}
                placeholder="e.g. Senior Dev, Store Mgr, Delivery Partner"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Primary Salary Day / Inflow Cycle
              </label>
              <select
                value={payCycleDay}
                onChange={(e) => setPayCycleDay(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}st of every month
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Household Inflow Streams (Primary, Delivery/Gig, Other) */}
          <div className="pt-2 border-t border-black/5 dark:border-white/5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Monthly Inflow Streams (Pacing Baseline)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Primary Monthly Income */}
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Primary Take-Home (₹)
                  </label>
                  <span className="text-[10px] font-bold text-blue-500 px-1.5 py-0.5 rounded bg-blue-500/10">Salary</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl text-sm font-black bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Fixed monthly pay</span>
              </div>

              {/* Part-Time Delivery / Gig Shifts */}
              <div className="p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 dark:border-emerald-500/25 relative overflow-hidden">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <label className="text-xs font-bold text-slate-900 dark:text-white">
                      Part-Time Delivery / Gig (₹)
                    </label>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={partTimeIncome}
                  onChange={(e) => setPartTimeIncome(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl text-sm font-black bg-white dark:bg-white/[0.05] border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-emerald-500/10">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Swiggy / Zomato / Zepto</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPartTimeIncome(10000)}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                      title="₹2,500/week"
                    >
                      ₹10k/mo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartTimeIncome(16000)}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                      title="₹4,000/week"
                    >
                      ₹16k/mo
                    </button>
                  </div>
                </div>
              </div>

              {/* Side Hustle / Rental / Other */}
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Side Hustle / Rental (₹)
                  </label>
                  <span className="text-[10px] font-bold text-amber-500 px-1.5 py-0.5 rounded bg-amber-500/10">Other</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl text-sm font-bold bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Rental, dividends, consulting</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Family & Dependent Recalibration */}
        <div className="rounded-3xl fintech-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Household Structure & Family Commitments
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Marriage, new children, or caring for elderly parents rebalances living baselines.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Marital Status & Household Earner Model
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {MARITAL_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Spouse Monthly Take-Home (₹)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                disabled={maritalStatus === "SINGLE"}
                value={spouseIncome}
                onChange={(e) => setSpouseIncome(parseFloat(e.target.value) || 0)}
                placeholder={maritalStatus === "SINGLE" ? "Not applicable" : "₹ 0"}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Dependents Count (Children & Parents)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDependentsCount(Math.max(0, dependentsCount - 1))}
                  className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  -
                </button>
                <span className="flex-1 text-center font-black text-sm text-slate-900 dark:text-white">
                  {dependentsCount} {dependentsCount === 1 ? "Dependent" : "Dependents"}
                </span>
                <button
                  type="button"
                  onClick={() => setDependentsCount(dependentsCount + 1)}
                  className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Weekly Leave Days & Off Schedule
              </label>
              <select
                value={leaveDaysSchedule}
                onChange={(e) => setLeaveDaysSchedule(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="WEEKENDS">Standard Weekend (Saturday & Sunday Off)</option>
                <option value="SUNDAYS">Sundays Only (6-Day Working Week)</option>
                <option value="SIX_DAYS">Retail / Single Day Off (Sunday)</option>
                <option value="ROTATIONAL">Rotational Shift / Midweek Off (Sun & Wed)</option>
              </select>
            </div>
          </div>
        </div>
      </>
    )}

    {activeTab === "liabilities" && (
      <>
        {/* Section 3: Liabilities & Debt Restructuring */}
        <div className="rounded-3xl fintech-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Debt, EMIs & Informal Borrowings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track bank loans, vehicle EMIs, chit funds (BC), and local hand loans (vaddi).
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Monthly Debt Outflow</div>
              <div className="text-sm font-black text-rose-500">
                {formatCurrency(totalMonthlyDebt, "INR")} / mo
              </div>
            </div>
          </div>

          {/* Current Liabilities List */}
          <div className="space-y-2">
            {liabilities.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center italic">
                No active liabilities or loans recorded. You are 100% debt-free!
              </p>
            ) : (
              liabilities.map((liab, idx) => (
                <div 
                  key={liab.id || idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center font-bold text-rose-500 text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{liab.name}</span>
                        {liab.isInformal && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Informal / Hand Loan
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {liab.category || "EMI"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-rose-500">
                      -{formatCurrency(liab.monthlyPayment, "INR")}/mo
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLiability(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Remove Liability"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add New Liability Form */}
          <div className="pt-4 border-t border-black/5 dark:border-white/5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Add New EMI or Loan Obligation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Loan Name (e.g. Bike EMI, BC Chit)"
                value={newLiabName}
                onChange={(e) => setNewLiabName(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                placeholder="Monthly Payment (₹)"
                value={newLiabMonthly}
                onChange={(e) => setNewLiabMonthly(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={newLiabCategory}
                onChange={(e) => setNewLiabCategory(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Home Loan">Home Loan</option>
                <option value="Vehicle EMI">Vehicle EMI</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Credit Card EMI">Credit Card EMI</option>
                <option value="Chit Fund (BC)">Chit Fund / BC</option>
                <option value="Informal Hand Loan">Informal Hand Loan</option>
                <option value="Education Loan">Education Loan</option>
              </select>

              <button
                type="button"
                onClick={handleAddLiability}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Obligation</span>
              </button>
            </div>
          </div>
        </div>
      </>
    )}

    {activeTab === "lending" && (
      <>
        {/* Section 4: Friends & Informal Money Lent Manager */}
        <div className="rounded-3xl fintech-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500">
                <Handshake className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Friends & Family Money Lent (Receivables)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track money lent without strict deadlines. Generates polite WhatsApp reminder nudges and recovers frozen capital.
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Total Frozen Capital:{" "}
              <strong className="text-teal-600 dark:text-teal-400 text-sm">
                ₹{moneyLent.filter(l => !l.isRecovered).reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* List of Lent Records */}
          <div className="space-y-3">
            {moneyLent.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-black/10 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-400">
                No active loans lent to friends or relatives logged yet.
              </div>
            ) : (
              moneyLent.map((loan) => {
                const amount = parseFloat(loan.amount) || 0;
                const lentDate = new Date(loan.lentDate || loan.createdAt);
                const now = new Date();
                const daysAgo = Math.max(0, Math.floor((now.getTime() - lentDate.getTime()) / (1000 * 60 * 60 * 24)));
                
                // WhatsApp nudge link
                let whatsappUrl = null;
                if (loan.phone) {
                  const clean = loan.phone.replace(/[^0-9]/g, "");
                  const formattedPhone = clean.length === 10 ? `91${clean}` : clean;
                  const text = encodeURIComponent(
                    `Hi ${loan.borrowerName}, hope you are doing well! Just a gentle follow-up regarding the ₹${amount.toLocaleString("en-IN")} lent on ${lentDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}. Let me know whenever convenient for you. Thank you!`
                  );
                  whatsappUrl = `https://wa.me/${formattedPhone}?text=${text}`;
                }

                return (
                  <div
                    key={loan.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3 ${
                      loan.isRecovered
                        ? "bg-black/[0.01] dark:bg-white/[0.01] border-black/[0.05] dark:border-white/[0.05] opacity-60"
                        : "bg-white dark:bg-[#16181E] border-black/[0.08] dark:border-white/[0.08] shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${loan.isRecovered ? "line-through text-slate-500" : "text-slate-900 dark:text-white"}`}>
                          {loan.borrowerName}
                        </span>
                        {loan.isRecovered ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Recovered
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Lent {daysAgo === 0 ? "today" : `${daysAgo} days ago`}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Lent on {lentDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        {loan.phone && <span>• 📞 {loan.phone}</span>}
                        {loan.notes && <span>• "{loan.notes}"</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-base font-black font-mono text-teal-600 dark:text-teal-400">
                        ₹{amount.toLocaleString("en-IN")}
                      </span>

                      {!loan.isRecovered && whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all"
                          title="Send polite WhatsApp reminder"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Nudge</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleRecovered(loan.id, loan.isRecovered)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          loan.isRecovered
                            ? "border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-black/5"
                            : "bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{loan.isRecovered ? "Undo" : "Mark Recovered"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLent(loan.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add New Lent Money Form */}
          <div className="pt-4 border-t border-black/5 dark:border-white/5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Log Money Lent to a Friend / Person
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Person Name (e.g. Ramesh, Priya)"
                value={newLentName}
                onChange={(e) => setNewLentName(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Phone (optional, for WhatsApp nudge)"
                value={newLentPhone}
                onChange={(e) => setNewLentPhone(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={newLentAmount}
                onChange={(e) => setNewLentAmount(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                disabled={lendingSubmitting}
                onClick={handleAddLent}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-all disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Lent Money</span>
              </button>
            </div>
          </div>
        </div>
      </>
    )}
  </main>

      <BottomNav />
    </div>
  );
}

