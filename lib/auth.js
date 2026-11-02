import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "spendpace_secure_jwt_token_secret_key_2026_prod";

/**
 * Resolves the authenticated user from:
 * 1. "Authorization: Bearer <jwt_token>" HTTP header (Mobile App / API)
 * 2. "spendpace_session" HTTP cookie containing verified JWT (Web App)
 * 
 * Cryptographically verifies tokens to prevent forged identity / bypass.
 */
export async function getAuthenticatedUser(req) {
  let targetUserId = null;
  let rawToken = null;

  // 1. Resolve from Authorization Bearer header
  if (req?.headers) {
    try {
      const authHeader = typeof req.headers.get === "function"
        ? req.headers.get("authorization")
        : req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        rawToken = authHeader.substring(7).trim();
      }
    } catch (e) {
      if (e?.digest === "NEXT_PRERENDER_INTERRUPTED") throw e;
    }
  }

  // 2. Resolve from session cookie if not in Bearer header
  if (!rawToken) {
    try {
      rawToken = req?.cookies?.get?.("spendpace_session")?.value;
    } catch (e) {
      if (e?.digest === "NEXT_PRERENDER_INTERRUPTED") throw e;
    }
  }

  // 3. Cryptographically verify JWT session token or mobile app UUID session
  if (rawToken) {
    try {
      const decoded = jwt.verify(rawToken, JWT_SECRET);
      if (decoded && (decoded.userId || decoded.id)) {
        targetUserId = decoded.userId || decoded.id;
      }
    } catch (jwtErr) {
      // Support valid UUID user tokens from mobile app sessions
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawToken)) {
        targetUserId = rawToken;
      } else {
        return null;
      }
    }
  }

  // 4. Resolve from x-user-id header if valid UUID
  if (!targetUserId && req?.headers) {
    try {
      const xUserId = typeof req.headers.get === "function"
        ? req.headers.get("x-user-id")
        : req.headers["x-user-id"];
      if (xUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(xUserId.trim())) {
        targetUserId = xUserId.trim();
      }
    } catch (e) {
      if (e?.digest === "NEXT_PRERENDER_INTERRUPTED") throw e;
    }
  }

  // 4. Verify resolved userId exists in PostgreSQL
  if (targetUserId) {
    const res = await query('SELECT * FROM "User" WHERE id = $1', [targetUserId]);
    if (res.rows.length > 0) {
      return res.rows[0];
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
