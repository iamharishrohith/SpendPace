"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Users, 
  HeartHandshake, 
  Baby, 
  Building2, 
  Store, 
  Briefcase, 
  Hammer, 
  Stethoscope, 
  Landmark, 
  CreditCard, 
  Banknote, 
  Check, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  ChevronRight,
  AlertCircle
} from "lucide-react";

// 5 Consolidated Umbrella Career Taxonomies
const CAREER_CATEGORIES = [
  {
    id: "SALARIED",
    title: "Salaried Employee",
    subtitle: "Fixed monthly compensation",
    icon: Building2,
    color: "from-blue-500/20 to-indigo-500/10",
    borderColor: "border-blue-500/30",
    subRoles: [
      "Corporate / MNC Staff",
      "Government / PSU Official",
      "IT & Software Specialist",
      "Banking & Financial Services",
      "Healthcare / Teaching Staff",
    ],
  },
  {
    id: "BUSINESS_COMMERCE",
    title: "Business & Trade Commerce",
    subtitle: "Trading, retail & distribution",
    icon: Store,
    color: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-500/30",
    subRoles: [
      "Retail Merchant / Shop Owner",
      "Wholesale Dealer / Distributor",
      "Supply Chain & Logistics",
      "Franchise / Business Partner",
    ],
  },
  {
    id: "AGENCY_COMMISSION",
    title: "Agency & Sales Commission",
    subtitle: "Performance & deal incentives",
    icon: Briefcase,
    color: "from-amber-500/20 to-orange-500/10",
    borderColor: "border-amber-500/30",
    subRoles: [
      "Insurance Advisor / Agent",
      "Real Estate Agent / Broker",
      "Channel Sales Partner",
      "Financial Products Consultant",
    ],
  },
  {
    id: "WAGES_GIG",
    title: "Wages & Gig Economy",
    subtitle: "Daily or flexible payouts",
    icon: Hammer,
    color: "from-purple-500/20 to-violet-500/10",
    borderColor: "border-purple-500/30",
    subRoles: [
      "Daily / Weekly Wage Earner",
      "Contract Craftsman (Electrician / Plumber)",
      "Ride-Hailing / Cab Partner",
      "Logistics & Delivery Fleet",
    ],
  },
  {
    id: "INDEPENDENT_PRO",
    title: "Independent Practice",
    subtitle: "Professional retainer & fee",
    icon: Stethoscope,
    color: "from-rose-500/20 to-pink-500/10",
    borderColor: "border-rose-500/30",
    subRoles: [
      "Medical Practitioner / Clinic",
      "Chartered Accountant / Tax Lawyer",
      "Legal Consultant / Advocate",
      "Creative / Tech Consultant",
    ],
  },
];

// Curated Liability Presets
const LIABILITY_PRESETS = [
  { name: "Home Loan EMI", category: "HOME_LOAN", defaultPayment: 22000, isInformal: false },
  { name: "Vehicle / Auto Loan EMI", category: "VEHICLE_LOAN", defaultPayment: 9500, isInformal: false },
  { name: "Personal Loan EMI", category: "PERSONAL_LOAN", defaultPayment: 7500, isInformal: false },
  { name: "Credit Card Minimum Due", category: "CREDIT_CARD", defaultPayment: 4000, isInformal: false },
  { name: "Chit Fund Contribution", category: "CHIT_FUND", defaultPayment: 5000, isInformal: true },
  { name: "Hand Loan (Friends/Relatives)", category: "HAND_LOAN", defaultPayment: 3000, isInformal: true },
  { name: "Local Moneylender / Private Loan", category: "LOCAL_MONEYLENDER", defaultPayment: 4500, isInformal: true },
  { name: "Gold Loan Interest", category: "GOLD_LOAN", defaultPayment: 2500, isInformal: true },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Persona & Family Structure
  const [maritalStatus, setMaritalStatus] = useState("SINGLE");
  const [gender, setGender] = useState("MALE");
  const [childrenCount, setChildrenCount] = useState(0);
  const [elderlyCount, setElderlyCount] = useState(0);

  // Step 2: Career & Occupation
  const [occupationCategory, setOccupationCategory] = useState("SALARIED");
  const [occupationSubRole, setOccupationSubRole] = useState("Corporate / MNC Staff");
  const [payCycleDay, setPayCycleDay] = useState(1);

  // Step 3: Cashflow & Household Income
  const [monthlyIncome, setMonthlyIncome] = useState("75000");
  const [spouseEmployed, setSpouseEmployed] = useState(false);
  const [spouseIncome, setSpouseIncome] = useState("0");
  const [otherIncome, setOtherIncome] = useState("0");

  // Step 4: Liabilities & Debt Structure (Formal + Informal)
  const [liabilities, setLiabilities] = useState([
    {
      id: "preset-1",
      name: "Personal Loan EMI",
      category: "PERSONAL_LOAN",
      monthlyPayment: "6500",
      totalOutstanding: "120000",
      isInformal: false,
    },
  ]);

  // Total Calculations
  const numPrimary = parseFloat(monthlyIncome) || 0;
  const numSpouse = (maritalStatus === "MARRIED" || maritalStatus === "FAMILY_HEAD") && spouseEmployed 
    ? (parseFloat(spouseIncome) || 0) 
    : 0;
  const numOther = parseFloat(otherIncome) || 0;
  const totalHouseholdInflow = numPrimary + numSpouse + numOther;

  const totalMonthlyDebt = liabilities.reduce((sum, item) => sum + (parseFloat(item.monthlyPayment) || 0), 0);

  // Dynamic Family Baseline Estimator
  const totalDependents = childrenCount + elderlyCount;
  const baseLivingCost = maritalStatus === "SINGLE" 
    ? 22000 
    : 32000 + (totalDependents * 7500);

  const netDiscretionary = Math.max(0, totalHouseholdInflow - totalMonthlyDebt - baseLivingCost);
  const dailySafeVelocity = Math.max(0, Math.round(netDiscretionary / 30));

  // Adjust default subrole when category changes
  const handleCategoryChange = (catId) => {
    setOccupationCategory(catId);
    const catObj = CAREER_CATEGORIES.find((c) => c.id === catId);
    if (catObj && catObj.subRoles.length > 0) {
      setOccupationSubRole(catObj.subRoles[0]);
    }
  };

  const handleAddLiability = (preset) => {
    const newItem = {
      id: "liab-" + Date.now() + Math.random().toString(36).substring(2, 6),
      name: preset.name,
      category: preset.category,
      monthlyPayment: String(preset.defaultPayment),
      totalOutstanding: String(preset.defaultPayment * 12),
      isInformal: preset.isInformal,
    };
    setLiabilities([...liabilities, newItem]);
  };

  const handleRemoveLiability = (id) => {
    setLiabilities(liabilities.filter((item) => item.id !== id));
  };

  const handleUpdateLiability = (id, field, value) => {
    setLiabilities(liabilities.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 3 && numPrimary <= 0) {
      setErrorMsg("Please enter your primary monthly net income to calibrate your pace.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setErrorMsg("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        maritalStatus,
        gender,
        dependentsCount: totalDependents,
        occupationCategory,
        occupationSubRole,
        monthlyIncome: numPrimary,
        spouseIncome: numSpouse,
        otherIncome: numOther,
        payCycleDay,
        liabilities,
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to save profile.");
      }

      // Update local storage session
      const stored = localStorage.getItem("spendpace_user");
      if (stored) {
        try {
          const userObj = JSON.parse(stored);
          userObj.isOnboarded = true;
          userObj.monthlyIncome = numPrimary;
          localStorage.setItem("spendpace_user", JSON.stringify(userObj));
        } catch (e) {}
      }

      router.push("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "Failed to finalize profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0D0E12] text-slate-900 dark:text-slate-100 transition-colors py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-amber-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">SpendPace</span>
          </Link>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Step {step} of 5
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Persona & Family Structure */}
        {step === 1 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
                Dynamic Structure
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Household & Family Foundation
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Your budget dynamics and emergency buffers adapt directly to your household structure.
              </p>
            </div>

            {/* Marital & Family Status Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Marital & Family Status
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "SINGLE", title: "Single / Independent", desc: "Individual cashflow & personal velocity", icon: User },
                  { id: "MARRIED", title: "Married Couple", desc: "Dual income & shared household lifestyle", icon: HeartHandshake },
                  { id: "FAMILY_HEAD", title: "Head of Family (Dependents)", desc: "Children and elderly care commitments", icon: Users },
                  { id: "SINGLE_PARENT", title: "Single Parent / Guardian", desc: "Solo income with child care priorities", icon: Baby },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = maritalStatus === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMaritalStatus(item.id)}
                      className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-500/15 ring-2 ring-emerald-500/20"
                          : "bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] hover:border-black/20 dark:hover:border-white/20"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-emerald-500 text-white" : "bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {item.title}
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "MALE", label: "Male" },
                  { id: "FEMALE", label: "Female" },
                  { id: "OTHER", label: "Other" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGender(g.id)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      gender === g.id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow"
                        : "border-black/[0.08] dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Dependents Counter (Appears if Married, Family Head, or Single Parent) */}
            {(maritalStatus === "MARRIED" || maritalStatus === "FAMILY_HEAD" || maritalStatus === "SINGLE_PARENT") && (
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-emerald-500" />
                  Dependents & Family Allowances
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      Children (School / College)
                    </label>
                    <div className="flex items-center gap-2">
                      {[0, 1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setChildrenCount(num)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all ${
                            childrenCount === num
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                        >
                          {num === 3 ? "3+" : num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      Elderly Parents / Dependents
                    </label>
                    <div className="flex items-center gap-2">
                      {[0, 1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setElderlyCount(num)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all ${
                            elderlyCount === num
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                        >
                          {num === 3 ? "3+" : num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Career & Occupation (5 Umbrella Categories) */}
        {step === 2 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-2">
                Consolidated Roles
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Career & Role Classification
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Choose the primary category that defines your income source and cycle.
              </p>
            </div>

            {/* 5 Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CAREER_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = occupationCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? `bg-gradient-to-tr ${cat.color} ${cat.borderColor} ring-2 ring-emerald-500/20`
                        : "bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] hover:border-black/20 dark:hover:border-white/20"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {cat.title}
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {cat.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sub-Role Selector within Category */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Specific Occupation / Role
              </label>
              <div className="flex flex-wrap gap-2">
                {CAREER_CATEGORIES.find((c) => c.id === occupationCategory)?.subRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setOccupationSubRole(role)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      occupationSubRole === role
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                        : "border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Pay Cycle Day */}
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Monthly Inflow / Pay Day: Day {payCycleDay}</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {payCycleDay === 1 ? "1st of every month" : `${payCycleDay}th of each month`}
                </span>
              </label>
              <input 
                type="range"
                min="1"
                max="31"
                value={payCycleDay}
                onChange={(e) => setPayCycleDay(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Day 1</span>
                <span>Day 15</span>
                <span>Day 31</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Cashflow & Household Income */}
        {step === 3 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
                Cashflow Realism
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Income Streams & Household Inflow
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Real net realization after deductions, taxes, and monthly drawings.
              </p>
            </div>

            <div className="space-y-4">
              {/* Primary Net Monthly Pay */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Primary Monthly Net Inflow (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="75000"
                    className="w-full pl-9 pr-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Take-home salary, business drawing, or average monthly wage.</p>
              </div>

              {/* Dynamic Spouse Income Section (If Married or Family Head) */}
              {(maritalStatus === "MARRIED" || maritalStatus === "FAMILY_HEAD") && (
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Spouse Income Stream</div>
                      <div className="text-[11px] text-slate-500">Does your partner generate monthly earnings?</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSpouseEmployed(!spouseEmployed)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        spouseEmployed
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {spouseEmployed ? "Contributing" : "Not Contributing"}
                    </button>
                  </div>

                  {spouseEmployed && (
                    <div className="pt-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                        Spouse Monthly Net Income (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={spouseIncome}
                          onChange={(e) => setSpouseIncome(e.target.value)}
                          placeholder="45000"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] font-bold text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Secondary Inflows */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Additional Passive / Secondary Inflow (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(e.target.value)}
                    placeholder="0"
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] font-bold text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Rental property, mutual fund dividends, agriculture, or side gigs.</p>
              </div>

              {/* Real-time Household Summary Pill */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Total Monthly Household Inflow
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    ₹{totalHouseholdInflow.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow">
                  Calibrated
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Debt & Liability Architecture (Formal + Informal) */}
        {step === 4 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
                Liabilities & Outflows
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Committed Debt & Local Borrowings
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Track both formal banking EMIs and local informal commitments (hand loans, chit funds, gold loans).
              </p>
            </div>

            {/* Quick Add Presets Bar */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick-Add Obligation
              </label>
              <div className="flex flex-wrap gap-2">
                {LIABILITY_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddLiability(preset)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:border-emerald-500/40 hover:text-emerald-500 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{preset.name}</span>
                    {preset.isInformal && (
                      <span className="text-[9px] px-1 rounded bg-amber-500/10 text-amber-600 font-bold">Local</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Configured Liabilities List */}
            <div className="space-y-3">
              {liabilities.length === 0 ? (
                <div className="text-center py-8 rounded-2xl border border-dashed border-black/10 dark:border-white/10 p-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Zero Debt Obligations</div>
                  <div className="text-xs text-slate-500">You are running 100% debt-free! Discretionary pace maximized.</div>
                </div>
              ) : (
                liabilities.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center">
                          {item.isInformal ? <Banknote className="w-3.5 h-3.5 text-amber-500" /> : <Landmark className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateLiability(item.id, "name", e.target.value)}
                          className="font-bold text-sm bg-transparent border-b border-transparent hover:border-black/20 focus:border-emerald-500 focus:outline-none"
                        />
                        {item.isInformal && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-bold">
                            Informal / Local
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLiability(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-500">Monthly Commitment (₹)</label>
                        <input
                          type="number"
                          value={item.monthlyPayment}
                          onChange={(e) => handleUpdateLiability(item.id, "monthlyPayment", e.target.value)}
                          placeholder="5000"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-500">Total Balance (₹)</label>
                        <input
                          type="number"
                          value={item.totalOutstanding || ""}
                          onChange={(e) => handleUpdateLiability(item.id, "totalOutstanding", e.target.value)}
                          placeholder="Optional"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] font-bold text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Debt Footprint */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Total Monthly Debt Servicing
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  ₹{totalMonthlyDebt.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="text-right text-xs font-semibold text-slate-500">
                {totalHouseholdInflow > 0 ? `${Math.round((totalMonthlyDebt / totalHouseholdInflow) * 100)}% of income` : "0%"}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Safe-to-Spend Calibration & Forecast Preview */}
        {step === 5 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
                Velocity Calibration
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Live Safe-to-Spend Velocity
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Your daily financial velocity has been computed from authentic household metrics.
              </p>
            </div>

            {/* Hero Velocity Radar Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white dark:from-white/[0.06] dark:to-white/[0.02] border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Daily Safe Pace Limit
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Adaptive
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black tracking-tight">
                  ₹{dailySafeVelocity.toLocaleString("en-IN")}
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-medium">/ day safe velocity</span>
              </div>

              <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
                You can safely spend up to ₹{dailySafeVelocity.toLocaleString("en-IN")} daily without compromising your ₹{totalMonthlyDebt.toLocaleString("en-IN")} debt commitments or living obligations.
              </p>

              {/* Cashflow Breakdown Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Household Inflow</div>
                  <div className="text-xs sm:text-sm font-bold text-white">₹{totalHouseholdInflow.toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Committed Debt</div>
                  <div className="text-xs sm:text-sm font-bold text-amber-400">₹{totalMonthlyDebt.toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Living Reserve</div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-400">₹{baseLivingCost.toLocaleString("en-IN")}</div>
                </div>
              </div>
            </div>

            {/* Profile Confirmation Pills */}
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Profile Snapshot</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                <div>• Status: <span className="font-semibold text-slate-900 dark:text-white">{maritalStatus}</span></div>
                <div>• Dependents: <span className="font-semibold text-slate-900 dark:text-white">{totalDependents}</span></div>
                <div>• Category: <span className="font-semibold text-slate-900 dark:text-white">{occupationCategory}</span></div>
                <div>• Pay Cycle: <span className="font-semibold text-slate-900 dark:text-white">Day {payCycleDay}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-102"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-102"
            >
              {submitting ? (
                <span>Calibrating Engine...</span>
              ) : (
                <>
                  <span>Activate SpendPace Command Center</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
