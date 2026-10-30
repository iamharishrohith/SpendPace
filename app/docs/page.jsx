"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { 
  FileCode, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  Server, 
  Lock, 
  Code2, 
  Zap,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedEndpoints, setExpandedEndpoints] = useState({});

  useEffect(() => {
    fetch("/api/docs")
      .then((res) => res.json())
      .then((data) => {
        setSpec(data);
        // Expand first 3 by default
        const initial = {};
        Object.keys(data.paths || {}).slice(0, 3).forEach((p) => {
          initial[p] = true;
        });
        setExpandedEndpoints(initial);
      })
      .catch((err) => console.error("Docs load error:", err));
  }, []);

  const toggleEndpoint = (pathKey) => {
    setExpandedEndpoints((prev) => ({
      ...prev,
      [pathKey]: !prev[pathKey],
    }));
  };

  const handleCopySpec = () => {
    if (!spec) return;
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const methodColors = {
    get: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    post: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    put: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    delete: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC] dark:bg-[#0D0E12] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                Developer API Architecture
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                OpenAPI 3.0.3 Specification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              SpendPace REST API Documentation
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 text-slate-700 dark:text-slate-200 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Raw JSON Spec</span>
            </a>

            <button
              onClick={handleCopySpec}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Spec"}</span>
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl fintech-card space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sub-15ms Latency</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cached by Upstash Redis edge layers with instant database cache invalidation.
            </p>
          </div>

          <div className="p-5 rounded-3xl fintech-card space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Session & JWT Security</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Strict RFC 5322 regex checks, disposable email blacklist, and HTTP-only session cookies.
            </p>
          </div>

          <div className="p-5 rounded-3xl fintech-card space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold">
              <Server className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">PostgreSQL Connection Pooling</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Prisma ORM schema with optimized b-tree indexes on user and transaction dates.
            </p>
          </div>
        </div>

        {/* Endpoints List */}
        <div className="space-y-3">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Available Endpoints
          </h2>

          {spec ? (
            Object.entries(spec.paths || {}).map(([routePath, methods]) => (
              <div key={routePath} className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-[#FFFFFF] dark:bg-[#12141A] overflow-hidden">
                <button
                  onClick={() => toggleEndpoint(routePath)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedEndpoints[routePath] ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {routePath}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {Object.keys(methods).map((m) => (
                      <span
                        key={m}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                          methodColors[m.toLowerCase()] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </button>

                {expandedEndpoints[routePath] && (
                  <div className="p-4 pt-0 border-t border-black/[0.05] dark:border-white/[0.05] space-y-4 bg-black/[0.01] dark:bg-white/[0.01]">
                    {Object.entries(methods).map(([method, details]) => (
                      <div key={method} className="space-y-2 pt-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                            methodColors[method.toLowerCase()] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}>
                            {method}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {details.summary}
                          </span>
                        </div>

                        {details.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 pl-2">
                            {details.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">Loading OpenAPI Specification...</div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
