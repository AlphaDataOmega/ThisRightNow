import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { readContract, writeContract } from "viem/wagmi";
import oracleAbi from "@/abi/TRNUsageOracle.json";
import merkleAbi from "@/abi/MerkleDropDistributor.json";
import investorAbi from "@/abi/MockInvestorVault.json";
import contributorAbi from "@/abi/MockContributorVault.json";
import merkleData from "@/data/merkle-2025-06-18.json";
import weighted from "@/data/trustWeightedRetrns.json";

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
  const reachEntries = Object.entries(weighted as Record<string, number>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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

  async function handleClaimAll() {
    const walletClient = await import("viem/wagmi").then((m) => m.getWalletClient());
    const publicClient = await import("viem/wagmi").then((m) => m.getPublicClient());

    if (!address || !walletClient) return;

    const actions: { type: string; tx: any }[] = [];

    // 1. Merkle
    const entry = Object.entries((merkleData as any).claims).find(
      ([key]) => key.toLowerCase() === address.toLowerCase()
    );
    if (entry) {
      const [addr, claim]: any = entry;
      actions.push({
        type: "merkle",
        tx: {
          address: DASHBOARD_CONTRACTS.merkle,
          abi: merkleAbi,
          functionName: "claim",
          args: [addr, claim.index, claim.amount, claim.proof],
        },
      });
    }

    // 2. Investor
    const investorNFTIds: number[] = [];
    for (let i = 0; i < 100; i++) {
      try {
        const amt = await readContract({
          address: DASHBOARD_CONTRACTS.investor,
          abi: investorAbi,
          functionName: "pendingClaim",
          args: [i],
        });
        if (amt > 0n) {
          investorNFTIds.push(i);
        }
      } catch {}
    }

    for (const tokenId of investorNFTIds) {
      actions.push({
        type: "investor",
        tx: {
          address: DASHBOARD_CONTRACTS.investor,
          abi: investorAbi,
          functionName: "claim",
          args: [tokenId],
        },
      });
    }

    // 3. Contributor
    const contributorNFTIds: number[] = [];
    for (let i = 0; i < 100; i++) {
      try {
        const amt = await readContract({
          address: DASHBOARD_CONTRACTS.contributor,
          abi: contributorAbi,
          functionName: "pendingClaim",
          args: [i],
        });
        if (amt > 0n) {
          contributorNFTIds.push(i);
        }
      } catch {}
    }

    for (const tokenId of contributorNFTIds) {
      actions.push({
        type: "contributor",
        tx: {
          address: DASHBOARD_CONTRACTS.contributor,
          abi: contributorAbi,
          functionName: "claim",
          args: [tokenId],
        },
      });
    }

    // Execute all
    for (const { type, tx } of actions) {
      try {
        const hash = await writeContract(tx as any);
        console.log(`✅ Claimed from ${type}:`, hash);
        // await publicClient.waitForTransactionReceipt({ hash });
      } catch (err) {
        console.warn(`❌ Failed ${type}:`, err);
      }
    }

    alert("Claim All completed. Check your wallet!");
  }

  return (
    <div className="p-6 space-y-4">
      <nav className="mb-4 space-x-4">
        <a href="/dashboard" className="text-blue-600 underline">
          Dashboard
        </a>
        <a href="/earnings" className="text-blue-600 underline">
          Earnings
        </a>
      </nav>
      <h1 className="text-2xl font-bold">TRN Earnings Dashboard</h1>
      <div className="text-sm">
        <strong>Top Retrned Posts (trust-weighted):</strong>
        <ul className="list-disc list-inside">
          {reachEntries.map(([hash, w]) => (
            <li key={hash} className="font-mono">
              {hash}: {w}
            </li>
          ))}
        </ul>
      </div>

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

          <button
            className="px-4 py-2 bg-green-700 text-white rounded mt-4"
            onClick={handleClaimAll}
          >
            Claim All
          </button>
        </>
      )}
    </div>
  );
}
