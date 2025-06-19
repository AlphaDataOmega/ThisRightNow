import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { useEffect, useState } from "react";
import burnData from "@/data/burnEvents.json";
import appealData from "@/data/appeals.json";

export default function ModAnalytics() {
  const [burnTrends, setBurnTrends] = useState<any[]>([]);
  const [burnByCountry, setBurnByCountry] = useState<any[]>([]);
  const [appealStats, setAppealStats] = useState<{ approved: number; denied: number }>({ approved: 0, denied: 0 });

  useEffect(() => {
    const daily: Record<string, number> = {};
    const byCountry: Record<string, number> = {};

    (burnData as any[]).forEach((b) => {
      const day = new Date(b.timestamp * 1000).toISOString().slice(0, 10);
      daily[day] = (daily[day] || 0) + 1;
      byCountry[b.country] = (byCountry[b.country] || 0) + 1;
    });

    const sorted = Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([d, count]) => ({ date: d, burns: count }));

    setBurnTrends(sorted);

    setBurnByCountry(
      Object.entries(byCountry)
        .sort((a, b) => b[1] - a[1])
        .map(([c, count]) => ({ name: c, value: count }))
    );

    const appeals = appealData as any[];
    const approved = appeals.filter((a) => a.resolution === "Approved").length;
    const denied = appeals.filter((a) => a.resolution === "Denied").length;

    setAppealStats({ approved, denied });
  }, []);

  return (
    <div className="p-6 space-y-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">📊 Moderation Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">🔥 Burn Volume by Day</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={burnTrends}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="burns" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">🌍 Top Burned Countries</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={burnByCountry} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {burnByCountry.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 35}, 70%, 60%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">🧑‍⚖️ Appeal Outcomes</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                { name: "Approved", value: appealStats.approved },
                { name: "Denied", value: appealStats.denied }
              ]}
              dataKey="value"
              outerRadius={100}
              label
            >
              <Cell fill="#34d399" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
