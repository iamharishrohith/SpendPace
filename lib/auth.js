import { query } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Resolves the authenticated user from:
 * 1. "spendpace_session" HTTP cookie (Web App)
 * 2. "Authorization: Bearer <userId>" HTTP header (Mobile App / API)
 * 3. "x-user-id" HTTP header (Mobile App / Internal Sync)
 * 4. Controlled Demo Fallback: ONLY in development or when ALLOW_DEMO_FALLBACK === 'true'
 */
export async function getAuthenticatedUser(req) {
  let targetUserId = null;

  // 1. Resolve from session cookie
  try {
    const cookieVal = req?.cookies?.get?.("spendpace_session")?.value;
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal);
      targetUserId = parsed.userId || parsed.id;
    }
  } catch (e) {
    // Malformed session cookie
  }

  // 2. Resolve from Authorization header
  if (!targetUserId && req?.headers) {
    try {
      const authHeader = typeof req.headers.get === "function"
        ? req.headers.get("authorization")
        : req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        targetUserId = authHeader.substring(7).trim();
      }
    } catch (e) {}
  }

  // 3. Resolve from x-user-id header
  if (!targetUserId && req?.headers) {
    try {
      targetUserId = typeof req.headers.get === "function"
        ? req.headers.get("x-user-id")
        : req.headers["x-user-id"];
    } catch (e) {}
  }

  // If a specific userId was claimed, verify against PostgreSQL
  if (targetUserId) {
    const res = await query('SELECT * FROM "User" WHERE id = $1', [targetUserId]);
    if (res.rows.length > 0) {
      return res.rows[0];
    }
  }

  // 4. Controlled Demo Fallback (Strictly disabled in production unless explicitly allowed)
  const isDemoAllowed = process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_FALLBACK === "true";
  if (isDemoAllowed) {
    const fallbackRes = await query('SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 1');
    if (fallbackRes.rows.length > 0) {
      return fallbackRes.rows[0];
    }
  }

  return null;
}

/**
 * Helper to return a standardized 401 Unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized: Authentication required") {
  return NextResponse.json({ error: message, success: false }, { status: 401 });
}

/**
 * HTML entity escaping utility to prevent HTML injection in emails and rendered outputs
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
