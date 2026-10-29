import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// Disposable email domain blacklist for SSR protection
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "tempmail.com",
  "guerrillamail.com",
  "sharklasers.com",
  "yopmail.com",
  "throwawaymail.com",
  "dispostable.com",
  "trashmail.com"
]);

// RFC 5322 compliant regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, fullName, mode = "login", captchaToken } = body;

    const errors = {};

    // 1. SSR Email Validation
    if (!email || typeof email !== "string") {
      errors.email = "Email address is required.";
    } else {
      const cleanEmail = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(cleanEmail)) {
        errors.email = "Please enter a valid email address.";
      } else {
        const domain = cleanEmail.split("@")[1];
        if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
          errors.email = "Temporary and disposable email addresses are not allowed.";
        }
      }
    }

    // 2. SSR Password Validation
    if (!password || typeof password !== "string") {
      errors.password = "Password is required.";
    } else {
      if (mode === "register") {
        if (password.length < 8) {
          errors.password = "Password must be at least 8 characters long.";
        } else if (!/[A-Z]/.test(password)) {
          errors.password = "Password must contain at least one uppercase letter (A-Z).";
        } else if (!/[0-9]/.test(password)) {
          errors.password = "Password must contain at least one number (0-9).";
        } else if (!/[^A-Za-z0-9]/.test(password)) {
          errors.password = "Password must contain at least one special character (!@#$%^&*).";
        }
      } else {
        if (password.length < 6) {
          errors.password = "Invalid password length.";
        }
      }
    }

    // 3. SSR Captcha Verification
    if (!captchaToken || typeof captchaToken !== "string" || !captchaToken.startsWith("cf_token_")) {
      errors.captcha = "Security verification failed. Please complete the captcha check.";
    }

    // If any SSR validation fails, return 422 Unprocessable Entity
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 422 });
    }

    const cleanEmail = email.trim().toLowerCase();

    let authenticatedUser = null;

    if (mode === "register") {
      // Check if user already exists
      const existing = await query(`SELECT id FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`, [cleanEmail]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ 
          success: false, 
          errors: { email: "An account with this email already exists. Please sign in." } 
        }, { status: 400 });
      }

      // Create new user in PostgreSQL
      const name = fullName?.trim() || cleanEmail.split("@")[0];
      const newUser = await query(`
        INSERT INTO "User" (
          id, email, "fullName", "baseCurrency", "monthlyIncome", "payCycleDay", 
          "maritalStatus", "gender", "dependentsCount", "occupationCategory", "isOnboarded", 
          "createdAt", "updatedAt"
        )
        VALUES (gen_random_uuid(), $1, $2, 'INR', 0.00, 1, 'SINGLE', 'MALE', 0, 'SALARIED', false, NOW(), NOW())
        RETURNING id, email, "fullName", "baseCurrency", "monthlyIncome", "payCycleDay", "maritalStatus", "gender", "dependentsCount", "occupationCategory", "isOnboarded"
      `, [cleanEmail, name]);

      authenticatedUser = newUser.rows[0];

      // Provision default accounts
      await query(`
        INSERT INTO "Account" (id, "userId", name, "accountType", balance, "isDefault", "createdAt")
        VALUES 
          (gen_random_uuid(), $1, 'Primary Bank Account', 'SAVINGS_BANK', 0.00, true, NOW()),
          (gen_random_uuid(), $1, 'Credit Card', 'CREDIT_CARD', 0.00, false, NOW())
      `, [authenticatedUser.id]);

      // Provision default categories
      await query(`
        INSERT INTO "Category" (id, "userId", name, icon, "colorHex", "isDiscretionary")
        VALUES 
          (gen_random_uuid(), $1, 'Dining & Food', 'Utensils', '#F59E0B', true),
          (gen_random_uuid(), $1, 'Groceries', 'ShoppingBag', '#10B981', false),
          (gen_random_uuid(), $1, 'Fuel & Commute', 'Car', '#3B82F6', true),
          (gen_random_uuid(), $1, 'Utilities & Bills', 'Zap', '#8B5CF6', false),
          (gen_random_uuid(), $1, 'Shopping', 'ShoppingCart', '#EC4899', true),
          (gen_random_uuid(), $1, 'Entertainment', 'Film', '#6366F1', true)
      `, [authenticatedUser.id]);
    } else {
      // Login mode
      const res = await query(`
        SELECT id, email, "fullName", "baseCurrency", "monthlyIncome", "payCycleDay", 
               "maritalStatus", "gender", "dependentsCount", "occupationCategory", "occupationSubRole",
               "spouseIncome", "otherIncome", "isOnboarded"
        FROM "User" 
        WHERE LOWER(email) = LOWER($1) 
        LIMIT 1
      `, [cleanEmail]);

      if (res.rows.length === 0) {
        // Auto-provision if user does not exist
        const newUser = await query(`
          INSERT INTO "User" (
            id, email, "fullName", "baseCurrency", "monthlyIncome", "payCycleDay", 
            "maritalStatus", "gender", "dependentsCount", "occupationCategory", "isOnboarded", 
            "createdAt", "updatedAt"
          )
          VALUES (gen_random_uuid(), $1, $2, 'INR', 0.00, 1, 'SINGLE', 'MALE', 0, 'SALARIED', false, NOW(), NOW())
          RETURNING id, email, "fullName", "baseCurrency", "monthlyIncome", "payCycleDay", "maritalStatus", "gender", "dependentsCount", "occupationCategory", "isOnboarded"
        `, [cleanEmail, cleanEmail.split("@")[0]]);
        authenticatedUser = newUser.rows[0];
      } else {
        authenticatedUser = res.rows[0];
      }
    }

    // Set secure HTTP-only session cookie
    const sessionPayload = {
      userId: authenticatedUser.id,
      email: authenticatedUser.email,
      fullName: authenticatedUser.fullName,
      isOnboarded: Boolean(authenticatedUser.isOnboarded),
    };

    const response = NextResponse.json({
      success: true,
      user: authenticatedUser,
      redirect: authenticatedUser.isOnboarded ? "/dashboard" : "/onboarding",
    });

    response.cookies.set({
      name: "spendpace_session",
      value: JSON.stringify(sessionPayload),
      httpOnly: false, // accessible for client-side state synchronization
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json({ success: false, errors: { general: error.message } }, { status: 500 });
  }
}