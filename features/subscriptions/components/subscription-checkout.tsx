"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * ⚠️ DEMO STUB — Lemon Squeezy billing is not configured in this portfolio
 * build (all premium features are already unlocked via use-paywall.ts).
 * The real checkout flow is preserved in git history.
 */
export const SubscriptionCheckout = () => {
  const onClick = () => {
    toast.info("Billing is disabled in this demo — every feature is already unlocked.");
  };

  return (
    <Button onClick={onClick} variant="ghost" size="sm">
      Upgrade
    </Button>
  );
};
