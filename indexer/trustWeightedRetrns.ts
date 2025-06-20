import fs from "fs";
import path from "path";
import retrns from "./output/retrnEvents.json";
import trust from "./output/trustScores.json";

function getMultiplier(score: number) {
  if (score > 100) return 2;
  if (score > 80) return 1.5;
  if (score > 50) return 1;
  if (score > 20) return 0.75;
  return 0.25;
}

type Retrn = { postHash: string; retrnr: string; timestamp: number };

export function buildTrustWeightedRetrns() {
  const weighted = (retrns as Retrn[]).map((r) => ({
    postHash: r.postHash,
    retrnr: r.retrnr,
    weight: getMultiplier((trust as Record<string, number>)[r.retrnr.toLowerCase()] || 0),
  }));

  const postReach = weighted.reduce((acc, { postHash, weight }) => {
    acc[postHash] = (acc[postHash] || 0) + weight;
    return acc;
  }, {} as Record<string, number>);

  fs.writeFileSync(
    path.join(__dirname, "output", "trustWeightedRetrns.json"),
    JSON.stringify(postReach, null, 2)
  );

  console.log("✅ Trust-weighted retrn reach saved.");
}

if (require.main === module) {
  buildTrustWeightedRetrns();
}
