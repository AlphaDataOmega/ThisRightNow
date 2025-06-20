import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { loadContract } from "@/utils/contract";
import { ethers } from "ethers";
import OracleABI from "@/abi/TRNUsageOracle.json";

const ORACLE_ADDRESS = "0xORACLE_ADDRESS_HERE";

export default function EarningsPage() {
  const { address } = useAccount();
  const [earnings, setEarnings] = useState<any[]>([]);

  useEffect(() => {
    if (!address) return;

    const fetchEarnings = async () => {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const oracle = loadContract(ORACLE_ADDRESS, OracleABI as any, provider);
      const data = await oracle.getEarnings(address);
      setEarnings(data);
    };

    fetchEarnings();
  }, [address]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Earnings</h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th>Post ID</th>
            <th>Source</th>
            <th>Amount (TRN)</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {earnings.map((e, i) => (
            <tr key={i}>
              <td>{e.postId.toString()}</td>
              <td>{e.source}</td>
              <td>{formatEther(e.amount)}</td>
              <td>{new Date(Number(e.timestamp) * 1000).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
