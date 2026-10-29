import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = "INR") {
  const num = Number(amount) || 0;
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(num);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(num);
}

export function calculateSafePace(monthlyIncome, committedBills, currentSpent, daysRemaining) {
  const remainingDiscretionary = Math.max(0, monthlyIncome - committedBills - currentSpent);
  const safeDaily = daysRemaining > 0 ? remainingDiscretionary / daysRemaining : 0;
  return {
    remainingDiscretionary: Math.round(remainingDiscretionary),
    safeDaily: Math.round(safeDaily),
    status: safeDaily > 1500 ? "cruising" : safeDaily > 600 ? "caution" : "overheating",
  };
}
