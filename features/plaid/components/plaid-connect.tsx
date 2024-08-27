"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * ⚠️ DEMO STUB — Plaid is not configured in this portfolio build, so this no
 * longer requests a link token on mount (which 500'd without credentials).
 * The real Plaid Link flow is preserved in git history; restore it once
 * PLAID_CLIENT_TOKEN / PLAID_SECRET_TOKEN are set.
 */
export const PlaidConnect = () => {
  const onClick = () => {
    toast.info("Bank connections are disabled in this portfolio demo.");
  };

  return (
    <Button onClick={onClick} size="sm" variant="ghost">
      Connect
    </Button>
  );
};
