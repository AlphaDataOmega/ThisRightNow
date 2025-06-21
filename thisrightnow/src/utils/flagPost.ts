import { ethers } from "ethers";
import { loadContract } from "./contract";
import EscalatorABI from "@/abi/FlagEscalator.json";

const FLAG_ESCALATOR = import.meta.env.VITE_FLAG_ESCALATOR;

export async function flagPost(postHash: string) {
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const contract = loadContract(FLAG_ESCALATOR, EscalatorABI as any, signer);
  await contract.flagPost(postHash);
  alert("Post flagged. Thanks for reporting.");
}
