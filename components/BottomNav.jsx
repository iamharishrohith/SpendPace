"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, PieChart, Target, Plus, Receipt } from "lucide-react";

export default function BottomNav({ onOpenAddModal }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Pace", href: "/dashboard", icon: Compass },
    { name: "Budgets", href: "/budgets", icon: PieChart },
    { name: "Add", isAction: true, icon: Plus },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Scan", href: "/scanner", icon: Receipt },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-safe">
      <div className="mx-4 mb-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/85 dark:bg-[#121316]/85 backdrop-blur-2xl shadow-2xl px-2 py-2 flex items-center justify-around">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          if (item.isAction) {
            return (
              <button
                key={idx}
                onClick={onOpenAddModal}
                className="w-12 h-12 -mt-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
              >
                <Plus className="w-6 h-6" />
              </button>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-emerald-500 font-bold scale-105"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
