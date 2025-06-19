import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { loadContract } from "@/utils/contract";
import { ethers } from "ethers";

import CountryRulesetManagerABI from "@/abi/CountryRulesetManager.json";

const CATEGORIES = ["NSFW", "HateSpeech", "Crypto", "Spam", "Misinformation"];
const COUNTRY = "US"; // Replace with dynamic selection in future

const CONTRACT_ADDRESS = import.meta.env.VITE_RULESET_MANAGER;

export default function CountryRuleEditor() {
  const { address, isConnected } = useAccount();
  const [banned, setBanned] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected) return;
    loadCurrentBans();
  }, [isConnected]);

  const loadCurrentBans = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const contract = await loadContract(CONTRACT_ADDRESS, CountryRulesetManagerABI as any, provider);

    const current: any = {};
    for (let category of CATEGORIES) {
      const isBanned = await contract.isCategoryBanned(COUNTRY, category);
      current[category] = isBanned;
    }
    setBanned(current);
  };

  const toggleCategory = (category: string) => {
    setBanned((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const saveChanges = async () => {
    setLoading(true);
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    const contract = await loadContract(CONTRACT_ADDRESS, CountryRulesetManagerABI as any, signer);

    for (let category of CATEGORIES) {
      const desired = banned[category];
      const onChain = await contract.isCategoryBanned(COUNTRY, category);
      if (desired !== onChain) {
        await contract.setCategoryBan(COUNTRY, category, desired);
        console.log(`Updated ${category} → ${desired}`);
      }
    }

    await loadCurrentBans();
    setLoading(false);
    alert("Policy updated successfully");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">🇺🇸 {COUNTRY} Content Policy</h1>
      <p className="text-gray-600">Configure banned categories for your region. Changes take effect immediately.</p>

      {CATEGORIES.map((cat) => (
        <div key={cat} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={banned[cat] || false}
            onChange={() => toggleCategory(cat)}
            id={cat}
          />
          <label htmlFor={cat}>{cat}</label>
        </div>
      ))}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        disabled={loading}
        onClick={saveChanges}
      >
        {loading ? "Saving..." : "💾 Save Policy"}
      </button>
    </div>
  );
}
