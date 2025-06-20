import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { loadContract } from "@/utils/contract";
import BurnRegistryABI from "@/abi/BurnRegistry.json";
import RetrnIndexABI from "@/abi/RetrnIndex.json";
import BoostingABI from "@/abi/BoostingModule.json";

const BURN_REGISTRY = import.meta.env.VITE_BURN_REGISTRY;
const RETRN_INDEX = import.meta.env.VITE_RETRN_INDEX;
const BOOST_MODULE = import.meta.env.VITE_BOOST_MODULE;

export default function PostCard({ post }: { post: any }) {
  const { address } = useAccount();

  async function bless() {
    alert(`🙏 Blessed ${post.hash}`);
  }

  async function burn() {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const burner = await loadContract(BURN_REGISTRY, BurnRegistryABI as any, signer);
    await burner.burnPost(post.hash, "User burn");
    alert("Burn transaction sent");
  }

  async function retrn() {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const retrn = await loadContract(RETRN_INDEX, RetrnIndexABI as any, signer);
    await retrn.logRetrn(address, post.hash);
    alert("Retrn submitted");
  }

  async function boost() {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const boost = await loadContract(BOOST_MODULE, BoostingABI as any, signer);
    await boost.startBoost(post.hash, 100);
    alert("Boost started");
  }

  return (
    <div className="border p-4 rounded mb-4">
      <p>{post.text}</p>
      <div className="text-sm text-gray-500">{post.category}</div>
      <div className="text-sm text-gray-500">{post.creator || post.address}</div>
      <div className="flex gap-2 mt-2">
        <button onClick={bless} className="px-2 py-1 bg-green-600 text-white rounded">Bless</button>
        <button onClick={burn} className="px-2 py-1 bg-red-600 text-white rounded">Burn</button>
        <button onClick={retrn} className="px-2 py-1 bg-yellow-600 text-white rounded">Retrn</button>
        <button onClick={boost} className="px-2 py-1 bg-blue-600 text-white rounded">Boost</button>
      </div>
    </div>
  );
}
