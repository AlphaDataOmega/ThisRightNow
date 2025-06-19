import { useEffect, useState } from "react";
import { readContract } from "viem/wagmi";
import factoryAbi from "@/abi/ProposalFactory.json";

const PROPOSAL_FACTORY_ADDRESS = "0xPROPOSAL_FACTORY";

export interface Proposal {
  id: number;
  description: string;
  yesVotes: bigint;
  noVotes: bigint;
  status: string;
}

export function useProposalData() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const count: bigint = await readContract({
          address: PROPOSAL_FACTORY_ADDRESS,
          abi: factoryAbi as any,
          functionName: "nextId",
        });

        const items: Proposal[] = [];
        for (let i = 0; i < Number(count); i++) {
          try {
            const p: any = await readContract({
              address: PROPOSAL_FACTORY_ADDRESS,
              abi: factoryAbi as any,
              functionName: "proposals",
              args: [i],
            });

            const status: string = await readContract({
              address: PROPOSAL_FACTORY_ADDRESS,
              abi: factoryAbi as any,
              functionName: "getProposalStatus",
              args: [i],
            });

            items.push({
              id: i,
              description: p[0],
              yesVotes: p[1],
              noVotes: p[2],
              status,
            });
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
