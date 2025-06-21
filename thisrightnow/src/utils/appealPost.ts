import { ethers } from "ethers";
import { loadContract } from "./contract";
import ModerationLogABI from "@/abi/ModerationLog.json";

const MODERATION_LOG = import.meta.env.VITE_MODERATION_LOG;

export async function appealPost(postHash: string, reason: string) {
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const contract = loadContract(MODERATION_LOG, ModerationLogABI as any, signer);
  await contract.recordAppeal(postHash, reason);
  alert("Appeal submitted.");
}
