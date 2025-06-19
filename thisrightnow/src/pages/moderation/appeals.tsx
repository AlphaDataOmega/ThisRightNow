import { useEffect, useState } from "react";
import { format } from "date-fns";

type Appeal = {
  address: string;
  postHash: string;
  reason: string;
  message: string;
  timestamp: number;
};

export default function AppealsQueue() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    // Replace this with a backend or indexer query later
    const localAppeals = Object.entries(localStorage)
      .filter(([key]) => key.startsWith("appeal-"))
      .map(([_, value]) => JSON.parse(value) as Appeal);

    setAppeals(localAppeals);
  }, []);

  const filtered = filter === "All" ? appeals : appeals.filter((a) => a.reason === filter);

  const handleAction = (postHash: string, action: string) => {
    alert(`🚨 ${action} for ${postHash} (placeholder)`);
    // Add mutation logic later (write to log, unflag, etc.)
  };

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">🧾 Appeals Queue</h1>

      <div className="flex space-x-2">
        {["All", "GeoBlock", "PostBurned", "MisTag", "AIFlag"].map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-3 py-1 rounded ${filter === r ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {r}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {filtered.length === 0 && <p className="text-gray-600">No appeals found.</p>}

        {filtered.map((a, i) => (
          <li key={i} className="border p-4 rounded shadow">
            <div className="text-sm text-gray-500">
              Submitted {format(a.timestamp, "PPpp")} by <span className="font-mono">{a.address}</span>
            </div>
            <div className="text-lg font-semibold mt-1">
              {a.reason} Appeal for <code>{a.postHash}</code>
            </div>
            <p className="mt-2">{a.message}</p>

            <div className="mt-4 space-x-2">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => handleAction(a.postHash, "Approve")}
              >
                ✅ Approve
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => handleAction(a.postHash, "Reject")}
              >
                ❌ Reject
              </button>
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded"
                onClick={() => handleAction(a.postHash, "Escalate")}
              >
                ⚠️ Escalate
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
