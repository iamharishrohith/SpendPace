import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("spendpace_session")?.value;

  const protectedRoutes = ["/dashboard", "/budgets", "/goals", "/scanner", "/planner", "/patterns", "/settings", "/onboarding"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // 1. If user is already authenticated with active session, avoid looping back to /login
  if (pathname === "/login" && sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie);
      const target = session.isOnboarded ? "/dashboard" : "/onboarding";
      return NextResponse.redirect(new URL(target, request.url));
    } catch (e) {
      // invalid cookie, allow to continue on login page
    }
  }

  // 2. If visiting a protected page without an active session
  if (isProtected && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If session exists, verify onboarding status
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie);
      // If user has not onboarded and tries to access dashboard or other core features, guide to onboarding
      if (!session.isOnboarded && (pathname.startsWith("/dashboard") || pathname.startsWith("/budgets") || pathname.startsWith("/goals"))) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      // If user is already onboarded and tries to access onboarding again, guide to dashboard
      if (session.isOnboarded && pathname === "/onboarding") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (e) {
      // Corrupt cookie, clear and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("spendpace_session");
      return response;
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
