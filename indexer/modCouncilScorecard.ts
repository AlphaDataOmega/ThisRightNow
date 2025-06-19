import fs from "fs";
import path from "path";
import appeals from "./output/moderationLogResolved.json";
import councilNFTs from "./output/councilHolders.json"; // snapshot at block height

export type Score = {
  moderator: string;
  count: number;
  approves: number;
  denies: number;
  escalates: number;
  avgResolutionTime: number;
  fairness: number; // out of 100
  verified: boolean;
};

export function buildScorecard() {
  const mods: Record<string, Score> = {};

  for (const appeal of appeals as any[]) {
    const { moderator, resolution, timestamp, submittedAt, overruled } = appeal;
    const addr = (moderator as string).toLowerCase();
    if (!mods[addr]) {
      mods[addr] = {
        moderator: addr,
        count: 0,
        approves: 0,
        denies: 0,
        escalates: 0,
        avgResolutionTime: 0,
        fairness: 0,
        verified: (councilNFTs as string[]).map((a) => a.toLowerCase()).includes(addr),
      };
    }

    const mod = mods[addr];
    mod.count += 1;

    if (resolution === "Approved") mod.approves += 1;
    else if (resolution === "Denied") mod.denies += 1;
    else if (resolution === "Escalated") mod.escalates += 1;

    const timeTaken = (timestamp as number) - (submittedAt as number);
    mod.avgResolutionTime =
      (mod.avgResolutionTime * (mod.count - 1) + timeTaken) / mod.count;

    if (overruled) mod.fairness -= 10;
    else mod.fairness += 2;
  }

  fs.writeFileSync(
    path.join(__dirname, "output", "modScorecard.json"),
    JSON.stringify(Object.values(mods), null, 2)
  );

  console.log("✅ Mod scorecard generated.");
}

if (require.main === module) {
  buildScorecard();
}
