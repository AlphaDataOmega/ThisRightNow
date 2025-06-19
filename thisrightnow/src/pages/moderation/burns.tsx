import { useEffect, useState } from "react";
import burnData from "@/data/burnEvents.json";

// Type representing a single burn log entry
export type BurnEntry = {
  postHash: string;
  country: string;
  category: string;
  reason: "AIFlag" | "GeoBan" | "UserBurn" | "DAOOverride";
  timestamp: number;
};

// Aggregated stats structure
export type BurnStats = Record<string, {
  total: number;
  reasons: Record<string, number>;
  categories: Record<string, number>;
}>;

export default function BurnViewer() {
  const [stats, setStats] = useState<BurnStats>({});

  useEffect(() => {
    const computed: BurnStats = {};

    (burnData as BurnEntry[]).forEach(({ country, reason, category }) => {
      if (!computed[country]) {
        computed[country] = {
          total: 0,
          reasons: {},
          categories: {}
        };
      }

      computed[country].total += 1;
      computed[country].reasons[reason] = (computed[country].reasons[reason] || 0) + 1;
      computed[country].categories[category] = (computed[country].categories[category] || 0) + 1;
    });

    setStats(computed);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔥 Burn Reasons by Country</h1>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">Country</th>
            <th className="p-2">Total Burns</th>
            <th className="p-2">Top Categories</th>
            <th className="p-2">Reason Breakdown</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stats).map(([country, data]) => (
            <tr key={country} className="border-b hover:bg-gray-50">
              <td className="p-2 font-bold">{country}</td>
              <td className="p-2">{data.total}</td>
              <td className="p-2">
                {Object.entries(data.categories)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([cat, count]) => `${cat} (${count})`)
                  .join(", ")}
              </td>
              <td className="p-2">
                {Object.entries(data.reasons)
                  .map(([r, count]) => `${r}: ${count}`)
                  .join(" | ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
