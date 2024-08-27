import type { Context, Next } from "hono";

/**
 * ⚠️ LOCAL-DEV AUTH STUB — replaces `@hono/clerk-auth` in the API routes so the
 * app runs without a Clerk account. Every request is treated as the same local
 * user. This ID intentionally matches `SEED_USER_ID` in `scripts/seed.ts`, so
 * any data you seed shows up for the local user.
 *
 * To restore real authentication: change the API route imports back to
 * `@hono/clerk-auth` (and re-enable Clerk in middleware.ts / layout.tsx).
 */
export const LOCAL_USER_ID = "user_2g1JOKQh3QUlqivKbp70wEJobvd";

// No-op stand-in for @hono/clerk-auth's clerkMiddleware().
export const clerkMiddleware = () => async (_c: Context, next: Next) => {
  await next();
};

// Stand-in for getAuth(c): always returns the local dev user.
export const getAuth = (_c: Context) => ({ userId: LOCAL_USER_ID });
