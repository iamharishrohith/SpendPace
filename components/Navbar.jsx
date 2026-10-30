"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Plus, 
  Compass, 
  PieChart, 
  Target, 
  Receipt,
  Menu, 
  X, 
  Command, 
  LogOut, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Settings, 
  Calendar, 
  CalendarCheck,
  ChevronDown,
  User as UserIcon,
  Code2
} from "lucide-react";

export default function Navbar({ onOpenAddModal, onOpenCommandBar }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const userMenuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const hasDarkClass = document.documentElement.classList.contains("dark");
    setIsDark(hasDarkClass);

    try {
      const stored = localStorage.getItem("spendpace_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {}

    // Click outside listener for user dropdown
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    localStorage.removeItem("spendpace_user");
    setCurrentUser(null);
    window.location.href = "/login";
  };

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("spendpace_theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("spendpace_theme", "dark");
      setIsDark(true);
    }
  };

  const isLanding = pathname === "/";

  const appNavLinks = [
    { name: "Dashboard", href: "/dashboard", icon: Compass },
    { name: "Patterns", href: "/patterns", icon: CalendarCheck },
    { name: "Budgets", href: "/budgets", icon: PieChart },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Planner", href: "/planner", icon: Calendar },
    { name: "Scanner", href: "/scanner", icon: Receipt },
    { name: "API Docs", href: "/docs", icon: Code2 },
  ];

  const landingNavLinks = [
    { name: "Pace Simulator", href: "#simulator", icon: TrendingUp },
    { name: "Features", href: "#features", icon: Zap },
    { name: "Security", href: "#security", icon: ShieldCheck },
  ];

  const navLinks = isLanding ? landingNavLinks : appNavLinks;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] bg-[#F8FAFC]/85 dark:bg-[#0D0E12]/85 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        
        {/* 1. Clean Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
            SpendPace
          </span>
        </Link>

        {/* 2. Sleek Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-0.5 p-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06]">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white dark:bg-white/[0.12] text-slate-950 dark:text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-500" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Streamlined Right Action Cluster */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Command Bar Trigger (app only) */}
          {!isLanding && (
            <button
              onClick={onOpenCommandBar}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"
              title="Search or Quick Command (⌘K)"
            >
              <Command className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">Search</span>
              <kbd className="px-1.5 py-0.5 text-[9px] bg-black/5 dark:bg-white/10 rounded border border-black/10 dark:border-white/10 font-mono">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Primary Action Button: Log Spend (app only) */}
          {!isLanding && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Spend</span>
            </button>
          )}

          {/* Authenticated User Menu Dropdown */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left"
                aria-expanded={userMenuOpen}
                aria-label="User profile menu"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {(currentUser.fullName || currentUser.email || "U").charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                  {currentUser.fullName?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Sleek User Profile Popover */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#16181E] border border-black/10 dark:border-white/10 shadow-2xl py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-black/5 dark:border-white/5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.fullName || "User"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {currentUser.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Profile & Settings</span>
                    </Link>
                    <Link
                      href="/scanner"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5 text-slate-400" />
                      <span>Receipt Scanner</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-black/5 dark:border-white/5">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark/Light Theme"
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open mobile navigation menu"
            className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-black/10 dark:border-white/10 bg-[#F8FAFC]/95 dark:bg-[#0D0E12]/95 backdrop-blur-2xl px-4 py-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}

          {currentUser && (
            <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Profile & Settings</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({currentUser.fullName?.split(" ")[0] || "User"})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
