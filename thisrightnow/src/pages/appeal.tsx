import { useState } from "react";
import { useAccount } from "wagmi";
import { loadContract } from "@/utils/contract";
import { ethers } from "ethers";
import ModerationLogABI from "@/abi/ModerationLog.json";

export default function AppealForm() {
  const { address, isConnected } = useAccount();

  const MODERATION_LOG = import.meta.env.VITE_MODERATION_LOG;

  const [postHash, setPostHash] = useState("");
  const [reason, setReason] = useState("GeoBlock");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const moderationLogContract = await loadContract(
      MODERATION_LOG,
      ModerationLogABI as any,
      signer
    );

    await moderationLogContract.submitAppeal(
      ethers.keccak256(ethers.toUtf8Bytes(postHash)),
      0
    );

    const appeal = {
      address,
      postHash,
      reason,
      message,
      timestamp: Date.now(),
    };

    console.log("\uD83D\uDCE8 Appeal submitted:", appeal);

    // Save to local mock for now
    localStorage.setItem(`appeal-${postHash}`, JSON.stringify(appeal));
    setSubmitted(true);
  };

  if (!isConnected) {
    return <div className="p-4 text-red-600">Please connect your wallet to file an appeal.</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">\uD83D\uDEE1 Appeal a Moderation Decision</h1>

      <label className="block">
        <span className="text-gray-700">Post Hash</span>
        <input
          type="text"
          value={postHash}
          onChange={(e) => setPostHash(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          placeholder="0xabc123..."
        />
      </label>

      <label className="block">
        <span className="text-gray-700">Appeal Type</span>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        >
          <option value="GeoBlock">Geo Block</option>
          <option value="PostBurned">Burned Post</option>
          <option value="MisTag">Incorrect Category</option>
          <option value="AIFlag">Bad AI Flag</option>
        </select>
      </label>

      <label className="block">
        <span className="text-gray-700">Appeal Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full mt-1 p-2 border rounded"
          placeholder="Explain why this post was wrongly flagged or blocked..."
        />
      </label>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
        disabled={submitted}
      >
        {submitted ? "\u2705 Submitted" : "\uD83D\uDCE8 Submit Appeal"}
      </button>
    </div>
  );
}
