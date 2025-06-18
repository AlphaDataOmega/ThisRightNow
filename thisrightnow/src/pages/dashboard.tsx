import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { readContract, writeContract } from "viem/wagmi";
import oracleAbi from "@/abi/TRNUsageOracle.json";
import merkleAbi from "@/abi/MerkleDropDistributor.json";
import investorAbi from "@/abi/MockInvestorVault.json";
import contributorAbi from "@/abi/MockContributorVault.json";
import merkleData from "@/data/merkle-2025-06-18.json";

const DASHBOARD_CONTRACTS = {
  oracle: "0xORACLE_ADDRESS_HERE",
  merkle: "0xMERKLE_DISTRIBUTOR_ADDRESS",
  investor: "0xINVESTOR_VAULT_ADDRESS",
  contributor: "0xCONTRIBUTOR_VAULT_ADDRESS",
};

export default function Dashboard() {
  const { address } = useAccount();
  const [earned, setEarned] = useState(0n);
  const [merkleAmount, setMerkleAmount] = useState<bigint | null>(null);
  const [investorClaims, setInvestorClaims] = useState<bigint[]>([]);
  const [contributorClaims, setContributorClaims] = useState<bigint[]>([]);

  useEffect(() => {
    if (!address) return;

    // Fetch TRN earned from oracle
    readContract({
      address: DASHBOARD_CONTRACTS.oracle,
      abi: oracleAbi,
      functionName: "earnedTRN",
      args: [address],
    }).then(setEarned);

    // Merkle drop lookup
    const entry = Object.entries((merkleData as any).claims).find(
      ([key]) => key.toLowerCase() === address.toLowerCase()
    );
    if (entry) setMerkleAmount(BigInt((entry as any)[1].amount));

    // Investor claims
    Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        readContract({
          address: DASHBOARD_CONTRACTS.investor,
          abi: investorAbi,
          functionName: "pendingClaim",
          args: [i],
        })
          .then((amt) => (amt > 0n ? [i, amt] : null))
          .catch(() => null)
      )
    ).then((results) => {
      const valid = results.filter(Boolean) as [number, bigint][];
      setInvestorClaims(valid.map(([id, amt]) => amt));
    });

    // Contributor claims
    Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        readContract({
          address: DASHBOARD_CONTRACTS.contributor,
          abi: contributorAbi,
          functionName: "pendingClaim",
          args: [i],
        })
          .then((amt) => (amt > 0n ? [i, amt] : null))
          .catch(() => null)
      )
    ).then((results) => {
      const valid = results.filter(Boolean) as [number, bigint][];
      setContributorClaims(valid.map(([id, amt]) => amt));
    });
  }, [address]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">TRN Earnings Dashboard</h1>

      {!address && <p>Please connect your wallet.</p>}

      {address && (
        <>
          <div>
            <strong>Total Earned:</strong> {Number(earned) / 1e18} TRN
          </div>

          {merkleAmount !== null && (
            <div>
              <strong>Merkle Drop:</strong> {Number(merkleAmount) / 1e18} TRN
              <button
                className="ml-2 px-2 py-1 bg-blue-600 text-white rounded"
                onClick={() => {
                  // implement claim later
                  alert("Merkle claim triggered");
                }}
              >
                Claim
              </button>
            </div>
          )}

          {investorClaims.length > 0 && (
            <div>
              <strong>Investor Vault Claims:</strong>{" "}
              {investorClaims.map((amt, idx) => (
                <div key={idx}>{Number(amt) / 1e18} TRN</div>
              ))}
            </div>
          )}

          {contributorClaims.length > 0 && (
            <div>
              <strong>Contributor Vault Claims:</strong>{" "}
              {contributorClaims.map((amt, idx) => (
                <div key={idx}>{Number(amt) / 1e18} TRN</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
