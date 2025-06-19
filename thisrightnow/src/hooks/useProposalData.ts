import { useEffect, useState } from "react";
import { readContract } from "viem/wagmi";
import factoryAbi from "@/abi/ProposalFactory.json";

const PROPOSAL_FACTORY_ADDRESS = "0xPROPOSAL_FACTORY";

export interface Proposal {
  id: number;
  description: string;
  yesVotes: bigint;
  noVotes: bigint;
  executed: boolean;
  vetoed: boolean;
}

export function useProposalData() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const count = await readContract({
          address: PROPOSAL_FACTORY_ADDRESS,
          abi: factoryAbi as any,
          functionName: "proposalCount",
        });

        const items: Proposal[] = [];
        for (let i = 0; i < Number(count); i++) {
          try {
            const data: any = await readContract({
              address: PROPOSAL_FACTORY_ADDRESS,
              abi: factoryAbi as any,
              functionName: "getProposal",
              args: [BigInt(i)],
            });
            items.push({ id: i, ...(data as any) });
          } catch (err) {
            console.warn("Failed to fetch proposal", i, err);
          }
        }
        setProposals(items);
      } catch (err) {
        console.warn("Failed loading proposals", err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  return { proposals, isLoading };
}
