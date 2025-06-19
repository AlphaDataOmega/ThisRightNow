import { useState } from "react";
import scoreData from "@/data/modScorecard.json";

export default function ModScorecard() {
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [lowFairness, setLowFairness] = useState(false);

  const filtered = (scoreData as any[]).filter((s) => {
    if (verifiedOnly && !s.verified) return false;
    if (lowFairness && s.fairness >= 50) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">🧑‍⚖️ Mod Council Scorecard</h1>

      <div className="space-x-4">
        <label>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="mr-1"
          />
          Verified mods only
        </label>
        <label>
          <input
            type="checkbox"
            checked={lowFairness}
            onChange={(e) => setLowFairness(e.target.checked)}
            className="mr-1"
          />
          Low fairness (&lt; 50)
        </label>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">Moderator</th>
            <th className="p-2">Approves</th>
            <th className="p-2">Denies</th>
            <th className="p-2">Escalates</th>
            <th className="p-2">Avg Time</th>
            <th className="p-2">Fairness</th>
            <th className="p-2">NFT?</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((m) => (
            <tr key={m.moderator} className="border-b hover:bg-gray-50">
              <td className="p-2 font-mono">{m.moderator}</td>
              <td className="p-2">{m.approves}</td>
              <td className="p-2">{m.denies}</td>
              <td className="p-2">{m.escalates}</td>
              <td className="p-2">{Math.round(m.avgResolutionTime)}s</td>
              <td className="p-2">{m.fairness}</td>
              <td className="p-2">{m.verified ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
