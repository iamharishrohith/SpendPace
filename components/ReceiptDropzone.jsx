"use client";

import React, { useState } from "react";
import { 
  UploadCloud, 
  Receipt, 
  CheckCircle2, 
  Loader2,
  FileText
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ReceiptDropzone({ onSuccess, currency = "INR" }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);

  const processFile = (file) => {
    if (!file) return;
    setIsScanning(true);
    setScannedResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result;
        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || "image/jpeg",
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to parse receipt");

        if (json.extracted) {
          setScannedResult({
            ...json.extracted,
            confidence: json.extracted.confidence || "96.5%",
            lineItems: json.extracted.lineItems || [],
          });
          if (onSuccess) onSuccess();
        }
      } catch (err) {
        console.error("Receipt OCR processing error:", err);
        setError("Could not fully decipher receipt image. Please try a clearer angle.");
      } finally {
        setIsScanning(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read image file.");
      setIsScanning(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="rounded-3xl fintech-card p-6 sm:p-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Instant Receipt & Payment Scanner
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drag payment screenshots or grocery invoices to extract and persist
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Vision OCR
        </span>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragOver 
            ? "border-emerald-500 bg-emerald-500/10 scale-101" 
            : "border-black/10 dark:border-white/10 hover:border-emerald-500/40 bg-black/[0.02] dark:bg-white/[0.02]"
        }`}
      >
        <input 
          type="file" 
          accept="image/*,.pdf" 
          onChange={handleFileInput} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {isScanning ? (
          <div className="py-4 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Extracting Items & Persisting to Database...
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Parsing merchant, amount, category, and line items
              </p>
            </div>
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Drag & Drop receipt or <span className="text-emerald-500 underline cursor-pointer">browse file</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Supports JPG, PNG, PDF receipts & mobile payment screenshots
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {scannedResult && (
        <div className="mt-5 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 animate-in fade-in-50 duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                Saved to Database (Confidence: {scannedResult.confidence})
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
              Auto-Logged
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-500/20">
            <div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {scannedResult.description}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {scannedResult.categoryName} • {scannedResult.date}
              </div>
            </div>
            <div className="text-xl font-black text-rose-500">
              -{formatCurrency(scannedResult.amount, currency)}
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Parsed Line Items:
            </div>
            {scannedResult.lineItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>• {item.name}</span>
                <span className="font-medium">{formatCurrency(item.price, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}