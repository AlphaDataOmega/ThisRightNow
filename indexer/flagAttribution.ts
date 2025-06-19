import fs from "fs";
import path from "path";
import burnEvents from "./output/burnRegistryEvents.json";
import trustScores from "./output/trustScores.json"; // From TrustScoreEngine

type Attribution = {
  postHash: string;
  flagger: string;
  timestamp: number;
  origin: "Human" | "Bot" | "AI" | "DAO";
};

function buildAttribution() {
  const results: Attribution[] = [];

  for (const evt of burnEvents as any[]) {
    const { flagger, postHash, timestamp } = evt;
    const addr = (flagger as string).toLowerCase();

    const trust = (trustScores as Record<string, number>)[addr] ?? 0;

    const origin =
      addr === "0x000000000000000000000000000000000000da0"
        ? "DAO"
        : trust < 20
        ? "Bot"
        : trust > 80
        ? "Human"
        : "AI";

    results.push({ postHash, flagger: addr, timestamp, origin });
  }

  fs.writeFileSync(
    path.join(__dirname, "output", "flagAttribution.json"),
    JSON.stringify(results, null, 2)
  );

  console.log("✅ Flag origins attributed.");
}

if (require.main === module) {
  buildAttribution();
}

export { buildAttribution, Attribution };
