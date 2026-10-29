"use client";

import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import BottomNav from "../../components/BottomNav";
import ReceiptDropzone from "../../components/ReceiptDropzone";
import { Receipt, CheckCircle, ShieldCheck } from "lucide-react";

export default function ScannerPage() {
  const [scannedItems, setScannedItems] = useState([]);

  const handleScanSuccess = (tx) => {
    setScannedItems((prev) => [tx, ...prev]);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC] dark:bg-[#121316] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Multimodal Ingestion Engine
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Vision AI Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Receipt & Screenshot Scanner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Drop payment confirmation screenshots (UPI, GPay, PhonePe, Paytm, or paper grocery slips).
          </p>
        </div>

        {/* The Multimodal Dropzone Component */}
        <ReceiptDropzone onScanSuccess={handleScanSuccess} />

        {/* History of Scanned Receipts */}
        {scannedItems.length > 0 && (
          <div className="rounded-3xl glossy-card p-6 sm:p-8 space-y-4 animate-in fade-in-50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recently Processed in this Session
            </h3>
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {scannedItems.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.category} • {item.date}</div>
                  </div>
                  <div className="text-base font-extrabold text-rose-500">
                    -₹{item.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
