"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  X 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CommandBar({ isOpen, onClose, onSuccess, currency = "INR" }) {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!input.trim()) {
      setParsed(null);
      return;
    }

    const amountMatch = input.match(/\d+(\.\d{1,2})?/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : null;

    let category = "Discretionary";
    const lower = input.toLowerCase();
    if (lower.includes("swiggy") || lower.includes("zomato") || lower.includes("dinner") || lower.includes("lunch") || lower.includes("coffee") || lower.includes("food") || lower.includes("tea")) {
      category = "Dining & Food";
    } else if (lower.includes("petrol") || lower.includes("fuel") || lower.includes("uber") || lower.includes("ola") || lower.includes("auto")) {
      category = "Fuel & Commute";
    } else if (lower.includes("blinkit") || lower.includes("zepto") || lower.includes("grocery") || lower.includes("market") || lower.includes("milk")) {
      category = "Groceries";
    } else if (lower.includes("amazon") || lower.includes("myntra") || lower.includes("shopping") || lower.includes("clothes")) {
      category = "Shopping";
    } else if (lower.includes("bescom") || lower.includes("wifi") || lower.includes("electricity") || lower.includes("bill")) {
      category = "Utilities & Bills";
    }

    if (amount) {
      setParsed({
        amount,
        category,
        description: input.replace(/\d+(\.\d{1,2})?/, "").trim() || `${category} Expense`,
      });
    } else {
      setParsed(null);
    }
  }, [input]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parsed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsed.amount,
          description: parsed.description,
          categoryName: parsed.category,
          accountName: "HDFC Salary Account",
          type: "EXPENSE",
          source: "MANUAL",
        }),
      });

      if (!res.ok) throw new Error("Failed to record expense");
      setFeedback("Expense recorded in database!");
      setTimeout(() => {
        setFeedback("");
        setInput("");
        if (onSuccess) onSuccess();
        onClose();
      }, 600);
    } catch (err) {
      setFeedback("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl fintech-card p-6 shadow-2xl border border-black/10 dark:border-white/15 animate-in fade-in-0 zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300">
            Natural Language Ingestion
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="e.g. 450 swiggy dinner or 1200 shell petrol..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base sm:text-lg"
            />
          </div>

          {parsed && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 animate-in fade-in-50">
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                Parsed Real Record
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white capitalize">
                    {parsed.description}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{parsed.category}</span>
                  </div>
                </div>
                <div className="text-xl font-black text-rose-500">
                  -{formatCurrency(parsed.amount, currency)}
                </div>
              </div>
            </div>
          )}

          {feedback && (
            <div className="mt-3 text-center text-xs font-bold text-emerald-500 animate-pulse">
              ✓ {feedback}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded">Enter</kbd> to persist</span>
            <button
              type="submit"
              disabled={!parsed || isSubmitting}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-white transition-all ${
                parsed && !isSubmitting
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                  : "bg-slate-400/30 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Save to Database</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}