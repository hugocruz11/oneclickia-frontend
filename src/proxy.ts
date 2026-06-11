import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth pages — accessible without a token AND if a logged-in user
// lands here we redirect them to the dashboard (they don't need to
// see login/register again).
const AUTH_PATHS = ["/login", "/register"];

// Public legal pages — always accessible, regardless of auth state.
// A logged-in user can read /privacy or /terms without being kicked
// to the dashboard.
const PUBLIC_LEGAL_PATHS = ["/privacy", "/terms"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("oneclickia_token")?.value;

  // Allow API routes and static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isAuthPath = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const isPublicLegal = PUBLIC_LEGAL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  // The marketing landing lives at "/" and must be visible to logged-out
  // visitors (the public pricing page / entry point).
  const isLanding = pathname === "/";
  const isPublicPath = isAuthPath || isPublicLegal || isLanding;

  // No token + protected route → redirect to login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Has token + on an auth page or the public landing → send them
  // straight to the app (they don't need login/register or the
  // marketing page). Legal pages stay accessible when authenticated.
  if (token && (isAuthPath || isLanding)) {
    return NextResponse.redirect(new URL("/ads/search", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
