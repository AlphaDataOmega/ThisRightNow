import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { readContract } from "viem/wagmi";
import subManagerAbi from "@/abi/SubscriptionManager.json";

const SUBSCRIPTION_MANAGER_ADDRESS = "0xSUB_MANAGER";

export function useSubscriptionAccess() {
  const { address } = useAccount();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    const fetchAccess = async () => {
      try {
        const result = await readContract({
          address: SUBSCRIPTION_MANAGER_ADDRESS,
          abi: subManagerAbi as any,
          functionName: "hasActiveSubscription",
          args: [address],
        });

        setHasAccess(Boolean(result));
      } catch (err) {
        console.warn("Subscription check failed:", err);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccess();
  }, [address]);

  return { hasAccess, isLoading };
}
