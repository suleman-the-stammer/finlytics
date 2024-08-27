import { useGetSubscription } from "@/features/subscriptions/api/use-get-subscription";
import { useSubscriptionModal } from "@/features/subscriptions/hooks/use-subscription-modal";

export const usePaywall = () => {
  const subscriptionModal =  useSubscriptionModal();
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
  } = useGetSubscription();

  // ⚠️ LOCAL-DEV: Lemon Squeezy billing is disabled, so nothing is paywalled
  // (all chart types are unlocked). Restore the real check below for production:
  //   const shouldBlock = !subscription || subscription.status === "expired";
  const shouldBlock = false;

  return {
    isLoading: isLoadingSubscription,
    shouldBlock,
    triggerPaywall: () => {
      subscriptionModal.onOpen();
    },
  };
};
