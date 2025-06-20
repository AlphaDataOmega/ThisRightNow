import { ethers } from "ethers";
import { loadContract } from "./contract";
import RulesetABI from "@/abi/CountryRulesetManager.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_RULESET_MANAGER;

// In production, replace this with IP-derived country codes
export async function getBannedCategories(countryCode: string): Promise<string[]> {
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const contract = loadContract(CONTRACT_ADDRESS, RulesetABI as any, provider);
  const categories = ["general", "politics", "news", "nsfw"];

  const results = await Promise.all(
    categories.map((cat) =>
      contract.isCategoryBanned(countryCode, cat).then((banned: boolean) => (banned ? cat : null))
    )
  );

  return results.filter((c): c is string => c !== null);
}
