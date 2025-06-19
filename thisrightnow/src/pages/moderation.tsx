import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { loadContract } from "@/utils/contract";
import { ethers } from "ethers";

import ModerationLogABI from "@/abi/ModerationLog.json";
import FlagEscalatorABI from "@/abi/FlagEscalator.json";
import BurnRegistryABI from "@/abi/BurnRegistry.json";
import GeoOracleABI from "@/abi/GeoOracle.json";

const flaggedPostHashes = [
  // These would normally come from an indexer
  "0xposthash1",
  "0xposthash2"
];

export default function ModerationDashboard() {
  const { address, isConnected } = useAccount();
  const [logs, setLogs] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const MODERATION_LOG = import.meta.env.VITE_MODERATION_LOG;
  const FLAG_ESCALATOR = import.meta.env.VITE_FLAG_ESCALATOR;
  const BURN_REGISTRY = import.meta.env.VITE_BURN_REGISTRY;
  const GEO_ORACLE = import.meta.env.VITE_GEO_ORACLE;

  const loadModerationData = async () => {
    setLoading(true);

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const logContract = await loadContract(MODERATION_LOG, ModerationLogABI, provider);
    const escalator = await loadContract(FLAG_ESCALATOR, FlagEscalatorABI, provider);
    const burner = await loadContract(BURN_REGISTRY, BurnRegistryABI, provider);
    const geo = await loadContract(GEO_ORACLE, GeoOracleABI, provider);

    const results: any = {};

    for (let postHash of flaggedPostHashes) {
      const flags = await escalator.getBurnCount(postHash);
      const burned = await burner.isContentBurned(postHash);
      const cnBlocked = await geo.isVisible(postHash, "CN");

      results[postHash] = {
        flags: flags.toString(),
        burned,
        cnBlocked: !cnBlocked,
      };
    }

    setLogs(results);
    setLoading(false);
  };

  const burnPost = async (postHash: string) => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const burner = await loadContract(BURN_REGISTRY, BurnRegistryABI, signer);
    await burner.burnPost(postHash, "Manual burn from dashboard");
    await loadModerationData();
  };

  const unblockPostCN = async (postHash: string) => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const geo = await loadContract(GEO_ORACLE, GeoOracleABI, signer);
    await geo.overrideUnblock(postHash, "CN");
    await loadModerationData();
  };

  useEffect(() => {
    if (isConnected) loadModerationData();
  }, [isConnected]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Moderation Dashboard</h1>
      <a href="/moderation/appeals" className="text-blue-600 underline">
        View Appeals Queue
      </a>
      {loading ? <p>Loading...</p> : (
        flaggedPostHashes.map(postHash => (
          <div key={postHash} className="border rounded p-4">
            <p><strong>Post:</strong> {postHash}</p>
            <p><strong>Flags:</strong> {logs[postHash]?.flags}</p>
            <p><strong>Burned:</strong> {logs[postHash]?.burned ? "✅" : "❌"}</p>
            <p><strong>Blocked in CN:</strong> {logs[postHash]?.cnBlocked ? "🌐 Blocked" : "🌍 Visible"}</p>

            <div className="flex space-x-2 mt-2">
              {!logs[postHash]?.burned && (
                <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => burnPost(postHash)}>🔥 Burn</button>
              )}
              {logs[postHash]?.cnBlocked && (
                <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => unblockPostCN(postHash)}>🌐 Unblock CN</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
