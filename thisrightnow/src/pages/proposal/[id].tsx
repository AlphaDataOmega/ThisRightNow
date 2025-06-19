import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { readContract, writeContract } from "viem/wagmi";

import factoryAbi from "@/abi/ProposalFactory.json";
import councilAbi from "@/abi/CouncilNFT.json";
import masterAbi from "@/abi/MasterNFT.json";
import oracleAbi from "@/abi/TRNUsageOracle.json";
import { decodeFunctionData } from "viem";

const CONTRACTS = {
  proposalFactory: "0xPROPOSAL_FACTORY",
  councilNFT: "0xCOUNCIL_NFT",
  masterNFT: "0xMASTER_NFT",
};

const ABI_REGISTRY: Record<string, any> = {
  "0xTRN_USAGE_ORACLE".toLowerCase(): oracleAbi,
  // Add others as needed
};

export default function ProposalDetail() {
  const { address } = useAccount();
  const router = useRouter();
  const { id } = router.query;

  const [proposal, setProposal] = useState<any>(null);
  const [council, setCouncil] = useState(false);
  const [master, setMaster] = useState(false);

  useEffect(() => {
    if (!address || !id) return;

    async function load() {
      const p = await readContract({
        address: CONTRACTS.proposalFactory,
        abi: factoryAbi,
        functionName: "proposals",
        args: [Number(id)],
      });

      const status = await readContract({
        address: CONTRACTS.proposalFactory,
        abi: factoryAbi,
        functionName: "getProposalStatus",
        args: [Number(id)],
      });

      const councilBal = await readContract({
        address: CONTRACTS.councilNFT,
        abi: councilAbi,
        functionName: "balanceOf",
        args: [address],
      });

      const masterBal = await readContract({
        address: CONTRACTS.masterNFT,
        abi: masterAbi,
        functionName: "balanceOf",
        args: [address],
      });

      setProposal({
        id,
        description: p[0],
        yesVotes: p[1],
        noVotes: p[2],
        target: p[3],
        calldata: p[4],
        status,
      });

      setCouncil(councilBal > 0n);
      setMaster(masterBal > 0n);
    }

    load();
  }, [address, id]);

  const decoded = proposal?.target
    ? decodeProposal(proposal.target, proposal.calldata as `0x${string}`)
    : null;

  function decodeProposal(target: string, data: `0x${string}`) {
    const abi = ABI_REGISTRY[target.toLowerCase()];
    if (!abi) return { error: "ABI not found" };

    try {
      const result = decodeFunctionData({
        abi,
        data,
      });
      return result;
    } catch {
      return { error: "Failed to decode" };
    }
  }

  async function vote(support: boolean) {
    await writeContract({
      address: CONTRACTS.proposalFactory,
      abi: factoryAbi,
      functionName: "vote",
      args: [Number(id), support],
    });
    alert("Vote sent");
  }

  async function finalize(approve: boolean) {
    await writeContract({
      address: CONTRACTS.proposalFactory,
      abi: factoryAbi,
      functionName: "finalizeProposal",
      args: [Number(id), approve],
    });
    alert("Finalized");
  }

  async function execute() {
    await writeContract({
      address: CONTRACTS.proposalFactory,
      abi: factoryAbi,
      functionName: "executeProposal",
      args: [Number(id)],
    });
    alert("Executed");
  }

  if (!proposal) return <div className="p-4">Loading proposal #{id}...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Proposal #{id}</h1>
      <p className="text-gray-700 mt-2">{proposal.description}</p>

      <div className="mt-4 text-sm">
        ✅ Yes: {proposal.yesVotes.toString()}<br />
        ❌ No: {proposal.noVotes.toString()}<br />
        📌 Status: <b>{proposal.status}</b>
      </div>

      <div className="mt-4">
        <h2 className="text-md font-semibold mb-1">Calldata Preview</h2>
        {!decoded?.error ? (
          <>
            <p><b>Function:</b> {decoded.functionName}</p>
            <p><b>Args:</b> {JSON.stringify(decoded.args)}</p>
          </>
        ) : (
          <p className="text-red-600">{decoded?.error}</p>
        )}
      </div>

      {council && proposal.status === "Pending" && (
        <div className="mt-4 flex gap-3">
          <button onClick={() => vote(true)} className="bg-green-700 text-white px-4 py-1 rounded">Vote Yes</button>
          <button onClick={() => vote(false)} className="bg-red-700 text-white px-4 py-1 rounded">Vote No</button>
        </div>
      )}

      {master && proposal.status === "PendingMasterApproval" && (
        <div className="mt-4 flex gap-3">
          <button onClick={() => finalize(true)} className="bg-blue-700 text-white px-4 py-1 rounded">Approve</button>
          <button onClick={() => finalize(false)} className="bg-gray-700 text-white px-4 py-1 rounded">Veto</button>
        </div>
      )}

      {master && proposal.status === "ReadyForExecution" && (
        <div className="mt-4">
          <button onClick={execute} className="bg-purple-800 text-white px-4 py-1 rounded">Execute Proposal</button>
        </div>
      )}
    </div>
  );
}
