"use client";

import React, { useState } from "react";
import { Mail, Loader2, CheckCircle2, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";

export default function EmailReportBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(null); // 'weekly' | 'monthly' | null
  const [resultMsg, setResultMsg] = useState(null);

  const handleSend = async (type) => {
    setSending(type);
    setResultMsg(null);
    try {
      const res = await fetch("/api/notifications/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data && data.success) {
        setResultMsg({
          type: "success",
          text: data.smtpSent ? `${type === "weekly" ? "Weekly" : "Monthly"} email sent via SMTP!` : `${type === "weekly" ? "Weekly" : "Monthly"} digest ready (Preview mode).`,
        });
      } else {
        setResultMsg({ type: "error", text: data.error || "Failed to dispatch email." });
      }
    } catch (err) {
      setResultMsg({ type: "error", text: err.message });
    } finally {
      setSending(null);
      setTimeout(() => setResultMsg(null), 5000);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-slate-700 dark:text-slate-200"
        title="Email Financial Digests via SMTP"
      >
        <Mail className="w-4 h-4 text-teal-500" />
        <span className="hidden sm:inline">Email Reports</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#16181E] border border-black/10 dark:border-white/10 shadow-xl p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 mb-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              SMTP Automated Digests
            </span>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              handleSend("weekly");
            }}
            disabled={sending !== null}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Send Weekly Digest (7-Day)</span>
            </div>
            {sending === "weekly" && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />}
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              handleSend("monthly");
            }}
            disabled={sending !== null}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between text-slate-800 dark:text-slate-200 mt-0.5"
          >
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>Send Monthly Statement</span>
            </div>
            {sending === "monthly" && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
          </button>

          <div className="border-t border-black/5 dark:border-white/5 mt-1 pt-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-3 py-1.5 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Configure SMTP Credentials →
            </Link>
          </div>
        </div>
      )}

      {resultMsg && (
        <div
          className={`absolute right-0 top-11 z-50 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg border whitespace-nowrap animate-in fade-in-0 ${
            resultMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
          }`}
        >
          {resultMsg.text}
        </div>
      )}
    </div>
  );
}
