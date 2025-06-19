import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { readContract, writeContract } from "viem/wagmi";

import factoryAbi from "@/abi/ProposalFactory.json";
import councilAbi from "@/abi/CouncilNFT.json";

const CONTRACTS = {
  proposalFactory: "0xPROPOSAL_FACTORY",
  councilNFT: "0xCOUNCIL_NFT",
};

export default function CreateProposalPage() {
  const { address } = useAccount();
  const [canCreate, setCanCreate] = useState(false);
  const [desc, setDesc] = useState("");
  const [calldata, setCalldata] = useState("0x");

  useEffect(() => {
    if (!address) return;

    const checkEligibility = async () => {
      const balance = await readContract({
        address: CONTRACTS.councilNFT,
        abi: councilAbi,
        functionName: "balanceOf",
        args: [address],
      });

      setCanCreate(balance > 0n);
    };

    checkEligibility();
  }, [address]);

  async function handleSubmit() {
    if (!desc) return alert("Please enter a description");

    try {
      const hash = await writeContract({
        address: CONTRACTS.proposalFactory,
        abi: factoryAbi,
        functionName: "createProposal",
        args: [desc, calldata],
      });

      alert("Proposal created!");
      console.log("tx:", hash);
    } catch (err) {
      console.warn("Creation failed", err);
      alert("Failed to create proposal.");
    }
  }

  if (!canCreate) return <div className="p-4">You must hold a CouncilNFT to propose changes.</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Create Proposal</h1>

      <label className="block mb-2">Description</label>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={4}
        placeholder="What's this proposal about?"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <label className="block mb-2">Encoded Calldata (optional)</label>
      <input
        className="w-full p-2 border rounded mb-4"
        value={calldata}
        onChange={(e) => setCalldata(e.target.value)}
      />

      <button
        className="bg-indigo-700 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Submit Proposal
      </button>
    </div>
  );
}
