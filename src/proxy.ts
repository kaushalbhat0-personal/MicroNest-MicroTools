import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/infrastructure/database/supabase-middleware";

const PROTECTED_PREFIXES = ["/app", "/onboarding"];

/**
 * Next.js 16 proxy — Phase 1: session refresh + minimal auth gate.
 * Firm-level gates live in app/(app)/layout.tsx and onboarding/page.tsx (server).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isStatic = pathname.startsWith("/_next") || pathname === "/favicon.ico";

  if (isStatic) {
    return NextResponse.next();
  }

  const { user, supabaseResponse } = await updateSession(request);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
