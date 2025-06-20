import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { readContract, writeContract } from "viem/wagmi";
import { formatEther } from "viem";
import contributorAbi from "@/abi/MockContributorVault.json";
import investorAbi from "@/abi/MockInvestorVault.json";
import countryAbi from "@/abi/MockCountryVault.json";

const CONTRACTS = {
  contributor: "0xCONTRIBUTOR_VAULT",
  investor: "0xINVESTOR_VAULT",
  country: "0xCOUNTRY_VAULT",
};

export default function VaultsPage() {
  const { address } = useAccount();
  const [contributorBalance, setContributorBalance] = useState("0");
  const [investorBalance, setInvestorBalance] = useState("0");
  const [countryBalance, setCountryBalance] = useState("0");

  useEffect(() => {
    if (!address) return;

    async function fetchBalances() {
      const contribBal = await readContract({
        address: CONTRACTS.contributor,
        abi: contributorAbi as any,
        functionName: "balanceOf",
        args: [address],
      });

      const investorBal = await readContract({
        address: CONTRACTS.investor,
        abi: investorAbi as any,
        functionName: "balanceOf",
        args: [address],
      });

      const countryBal = await readContract({
        address: CONTRACTS.country,
        abi: countryAbi as any,
        functionName: "balanceOf",
        args: [address],
      });

      setContributorBalance(formatEther(contribBal));
      setInvestorBalance(formatEther(investorBal));
      setCountryBalance(formatEther(countryBal));
    }

    fetchBalances();
  }, [address]);

  async function handleClaim(vault: "contributor" | "investor" | "country") {
    const abiMap = {
      contributor: contributorAbi,
      investor: investorAbi,
      country: countryAbi,
    } as const;

    await writeContract({
      address: CONTRACTS[vault],
      abi: abiMap[vault] as any,
      functionName: "claim",
    });

    alert(`Claimed from ${vault} vault`);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Vault Payouts</h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th>Vault</th>
            <th>Claimable TRN</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Contributor Vault</td>
            <td>{contributorBalance}</td>
            <td>
              <button onClick={() => handleClaim("contributor")}>Claim</button>
            </td>
          </tr>
          <tr>
            <td>Investor Vault</td>
            <td>{investorBalance}</td>
            <td>
              <button onClick={() => handleClaim("investor")}>Claim</button>
            </td>
          </tr>
          <tr>
            <td>Country Vault</td>
            <td>{countryBalance}</td>
            <td>
              <button onClick={() => handleClaim("country")}>Claim</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

