import { useAccount } from "wagmi";
import { readContract, writeContract } from "viem/wagmi";
import { useEffect, useState } from "react";

import factoryAbi from "@/abi/ProposalFactory.json";
import councilAbi from "@/abi/CouncilNFT.json";
import masterAbi from "@/abi/MasterNFT.json";

const CONTRACTS = {
  proposalFactory: "0xPROPOSAL_FACTORY",
  councilNFT: "0xCOUNCIL_NFT",
  masterNFT: "0xMASTER_NFT",
};

type Proposal = {
  id: number;
  description: string;
  yesVotes: bigint;
  noVotes: bigint;
  status: string;
};

export default function ProposalPage() {
  const { address } = useAccount();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [council, setCouncil] = useState(false);
  const [master, setMaster] = useState(false);

  useEffect(() => {
    if (!address) return;

    async function loadData() {
      const count = await readContract({
        address: CONTRACTS.proposalFactory,
        abi: factoryAbi as any,
        functionName: "nextId",
      });

      const results: Proposal[] = [];

      for (let i = 0; i < Number(count); i++) {
        const p: any = await readContract({
          address: CONTRACTS.proposalFactory,
          abi: factoryAbi as any,
          functionName: "proposals",
          args: [i],
        });

        const status: any = await readContract({
          address: CONTRACTS.proposalFactory,
          abi: factoryAbi as any,
          functionName: "getProposalStatus",
          args: [i],
        });

        results.push({
          id: i,
          description: p[0],
          yesVotes: p[1],
          noVotes: p[2],
          status,
        });
      }

      setProposals(results);

      const councilBal: bigint = await readContract({
        address: CONTRACTS.councilNFT,
        abi: councilAbi as any,
        functionName: "balanceOf",
        args: [address],
      });

      const masterBal: bigint = await readContract({
        address: CONTRACTS.masterNFT,
        abi: masterAbi as any,
        functionName: "balanceOf",
        args: [address],
      });

      setCouncil(councilBal > 0n);
      setMaster(masterBal > 0n);
    }

    loadData();
  }, [address]);

  async function vote(id: number, support: boolean) {
    try {
      await writeContract({
        address: CONTRACTS.proposalFactory,
        abi: factoryAbi as any,
        functionName: "vote",
        args: [id, support],
      });
      alert("Vote submitted");
    } catch (err) {
      console.warn("Vote failed", err);
    }
  }

  async function finalize(id: number, approve: boolean) {
    try {
      await writeContract({
        address: CONTRACTS.proposalFactory,
        abi: factoryAbi as any,
        functionName: "finalizeProposal",
        args: [id, approve],
      });
      alert("Proposal finalized");
    } catch (err) {
      console.warn("Finalize failed", err);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">DAO Proposals</h1>
      {proposals.map((p) => (
        <div key={p.id} className="border rounded p-3 mb-4">
          <div className="text-md font-semibold">{p.description}</div>
          <div className="text-sm mt-2">
            ✅ Yes: {p.yesVotes.toString()} | ❌ No: {p.noVotes.toString()}<br />
            Status: <b>{p.status}</b>
          </div>
          {council && p.status === "Pending" && (
            <div className="mt-2 space-x-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => vote(p.id, true)}>Vote Yes</button>
              <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => vote(p.id, false)}>Vote No</button>
            </div>
          )}
          {master && p.status === "PendingMasterApproval" && (
            <div className="mt-2 space-x-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => finalize(p.id, true)}>Approve</button>
              <button className="bg-gray-800 text-white px-3 py-1 rounded" onClick={() => finalize(p.id, false)}>Veto</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

