import { ethers } from "ethers";
import { uploadToIPFS } from "./ipfs";
import { loadContract } from "./contract";
import ViewIndexABI from "@/abi/ViewIndex.json";

const VIEW_INDEX = import.meta.env.VITE_VIEW_INDEX;

export async function submitPost(content: string, category: string) {
  const ipfsHash = await uploadToIPFS({ content, category, timestamp: Date.now() });

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const contract = loadContract(VIEW_INDEX, ViewIndexABI as any, signer);
  await contract.registerPost(ipfsHash, category);

  return ipfsHash;
}
