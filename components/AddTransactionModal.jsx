"use client";

import React, { useState } from "react";
import { X, Loader2, Utensils, Car, ShoppingBag, Zap, HeartPulse, Film, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AddTransactionModal({ isOpen, onClose, onSuccess, currency = "INR" }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("Dining & Food");
  const [accountName, setAccountName] = useState("HDFC Salary Account");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const categories = [
    { name: "Dining & Food", icon: Utensils, color: "text-amber-500" },
    { name: "Groceries", icon: ShoppingBag, color: "text-emerald-500" },
    { name: "Fuel & Commute", icon: Car, color: "text-blue-500" },
    { name: "Shopping", icon: ShoppingCart, color: "text-pink-500" },
    { name: "Utilities & Bills", icon: Zap, color: "text-purple-500" },
    { name: "Medical & Health", icon: HeartPulse, color: "text-rose-500" },
    { name: "Entertainment", icon: Film, color: "text-indigo-500" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setErrorMsg("Please enter a valid expense amount.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description.trim() || `${categoryName} Expense`,
          categoryName,
          accountName,
          type: "EXPENSE",
          source: "MANUAL",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log transaction");

      setAmount("");
      setDescription("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl fintech-card p-6 sm:p-8 border border-black/10 dark:border-white/15 animate-in fade-in-0 zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Log Real Expense
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Persisted directly to your Prisma Postgres database & recalibrates Pace Radar
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-500">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Expense Amount ({currency})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-bold text-slate-400">
                {currency === "INR" ? "₹" : "$"}
              </span>
              <input
                type="number"
                step="0.01"
                autoFocus
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white text-2xl sm:text-3xl font-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Merchant / Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Merchant / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Starbucks, Shell Fuel, Blinkit..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Category Selector Pills */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = categoryName === cat.name;
                return (
                  <button
                    type="button"
                    key={cat.name}
                    onClick={() => setCategoryName(cat.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Payment Account
            </label>
            <select
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="HDFC Salary Account" className="dark:bg-[#181A20]">HDFC Salary Account</option>
              <option value="Regalia Credit Card" className="dark:bg-[#181A20]">Regalia Credit Card</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/25 transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording to Database...</span>
                </>
              ) : (
                <span>Confirm & Recalibrate Pace</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}