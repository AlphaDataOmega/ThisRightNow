import { useEffect, useState } from "react";
import { readContract } from "viem/wagmi";
import factoryAbi from "@/abi/ProposalFactory.json";

const PROPOSAL_FACTORY_ADDRESS = "0xPROPOSAL_FACTORY";

export interface Proposal {
  id: number;
  description: string;
  yesVotes: bigint;
  noVotes: bigint;
  target: string;
  calldata: string;
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

            items.push({
              id: i,
              description: data[0],
              target: data[1] ?? "0x",
              calldata: data[2] ?? "0x",
              yesVotes: data[3] ?? data[1],
              noVotes: data[4] ?? data[2],
              executed: data[5] ?? false,
              vetoed: data[6] ?? false,
            } as any);
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
