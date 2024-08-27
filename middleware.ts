import { NextResponse } from "next/server";

/**
 * ⚠️ LOCAL-DEV ONLY — Clerk authentication is disabled so the app runs without
 * a Clerk account. Every route is public. To restore real auth, revert this
 * file to the clerkMiddleware() version (see git history).
 */
export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
