import { NextResponse } from "next/server";

function parseSessionCookie(cookieVal) {
  if (!cookieVal) return null;
  try {
    const parts = cookieVal.split(".");
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const jsonStr = atob(payloadBase64);
      return JSON.parse(jsonStr);
    }
    return JSON.parse(cookieVal);
  } catch (e) {
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("spendpace_session")?.value;
  const session = parseSessionCookie(sessionCookie);

  const protectedRoutes = ["/dashboard", "/budgets", "/goals", "/scanner", "/planner", "/patterns", "/settings", "/onboarding"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // 1. If user is already authenticated with active session, avoid looping back to /login
  if (pathname === "/login" && session) {
    const target = session.isOnboarded ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. If visiting a protected page without an active session
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If session exists, verify onboarding status
  if (session) {
    // If user has not onboarded and tries to access dashboard or other core features, guide to onboarding
    if (!session.isOnboarded && (pathname.startsWith("/dashboard") || pathname.startsWith("/budgets") || pathname.startsWith("/goals"))) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    // If user is already onboarded and tries to access onboarding again, guide to dashboard
    if (session.isOnboarded && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/budgets/:path*",
    "/goals/:path*",
    "/scanner/:path*",
    "/planner/:path*",
    "/patterns/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/login",
  ],
};
