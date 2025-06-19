import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { readContract, writeContract } from "viem/wagmi";
import factoryAbi from "@/abi/ProposalFactory.json";
import { Proposal } from "@/hooks/useProposalData";

const PROPOSAL_FACTORY_ADDRESS = "0xPROPOSAL_FACTORY";
const COUNCIL_NFT_ADDRESS = "0xCOUNCIL_NFT";
const MASTER_NFT_ADDRESS = "0xMASTER_NFT";

const erc721Abi = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const { address } = useAccount();
  const [isCouncil, setIsCouncil] = useState(false);
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    if (!address) return;
    async function checkRoles() {
      try {
        const councilBalance: bigint = await readContract({
          address: COUNCIL_NFT_ADDRESS,
          abi: erc721Abi as any,
          functionName: "balanceOf",
          args: [address],
        });
        setIsCouncil(councilBalance > 0n);
      } catch {}
      try {
        const masterBalance: bigint = await readContract({
          address: MASTER_NFT_ADDRESS,
          abi: erc721Abi as any,
          functionName: "balanceOf",
          args: [address],
        });
        setIsMaster(masterBalance > 0n);
      } catch {}
    }
    checkRoles();
  }, [address]);

  async function handleVote(support: boolean) {
    try {
      await writeContract({
        address: PROPOSAL_FACTORY_ADDRESS,
        abi: factoryAbi as any,
        functionName: "voteOnProposal",
        args: [BigInt(proposal.id), support],
      });
      alert("Vote submitted");
    } catch (err) {
      console.warn("Vote failed", err);
    }
  }

  async function handleVeto() {
    try {
      await writeContract({
        address: PROPOSAL_FACTORY_ADDRESS,
        abi: factoryAbi as any,
        functionName: "vetoProposal",
        args: [BigInt(proposal.id)],
      });
      alert("Proposal vetoed");
    } catch (err) {
      console.warn("Veto failed", err);
    }
  }

  async function handleExecute() {
    try {
      await writeContract({
        address: PROPOSAL_FACTORY_ADDRESS,
        abi: factoryAbi as any,
        functionName: "executeProposal",
        args: [BigInt(proposal.id)],
      });
      alert("Proposal executed");
    } catch (err) {
      console.warn("Execute failed", err);
    }
  }

  const status = proposal.vetoed
    ? "Vetoed"
    : proposal.executed
    ? "Executed"
    : proposal.yesVotes + proposal.noVotes === 0n
    ? "Pending"
    : proposal.yesVotes > proposal.noVotes
    ? "Voting Open"
    : "Pending";

  return (
    <div className="border p-4 rounded space-y-2">
      <h3 className="font-semibold">Proposal #{proposal.id}</h3>
      <p>{proposal.description}</p>
      <div>
        Yes: {String(proposal.yesVotes)} | No: {String(proposal.noVotes)}
      </div>
      <div>Status: {status}</div>

      {isCouncil && !proposal.executed && !proposal.vetoed && (
        <div className="space-x-2">
          <button
            className="px-2 py-1 bg-green-600 text-white rounded"
            onClick={() => handleVote(true)}
          >
            Vote Yes
          </button>
          <button
            className="px-2 py-1 bg-red-600 text-white rounded"
            onClick={() => handleVote(false)}
          >
            Vote No
          </button>
        </div>
      )}

      {isMaster && !proposal.executed && !proposal.vetoed && (
        <div className="space-x-2 mt-2">
          <button
            className="px-2 py-1 bg-yellow-600 text-white rounded"
            onClick={handleVeto}
          >
            Veto
          </button>
          <button
            className="px-2 py-1 bg-blue-600 text-white rounded"
            onClick={handleExecute}
          >
            Execute
          </button>
        </div>
      )}
    </div>
  );
}
