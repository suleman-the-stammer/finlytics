"use client";

import * as React from "react";

/**
 * ⚠️ LOCAL-DEV STUBS — replace `@clerk/nextjs` in layout/header/welcome so the
 * app runs with a fake signed-in user and no Clerk account. Mirrors just the
 * handful of Clerk exports this app uses.
 *
 * To restore real authentication: switch those imports back to `@clerk/nextjs`.
 */

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export const ClerkLoaded = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export const ClerkLoading = (_props: { children?: React.ReactNode }) => null;

export const useUser = () => ({
  isLoaded: true,
  isSignedIn: true,
  user: {
    id: "user_2g1JOKQh3QUlqivKbp70wEJobvd",
    firstName: "Local",
    fullName: "Local User",
  },
});

export const UserButton = (_props: { afterSignOutUrl?: string }) => (
  <div className="flex size-8 items-center justify-center rounded-full bg-white/20 text-sm font-medium text-white">
    L
  </div>
);
