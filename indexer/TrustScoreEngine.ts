import fs from "fs";
import path from "path";

export type ContributorStats = {
  blessings: number;
  burns: number;
  retrns: number;
  posts: number;
  geoBlocks: number;
  aiFlags: number;
  deletedPosts: number;
  createdAt: number; // timestamp
};

export type TrustScore = {
  address: string;
  score: number;
  details: {
    blessRate: number;
    burnRate: number;
    retrnRate: number;
    geoPenalty: number;
    aiPenalty: number;
    ageBonus: number;
  };
};

// Dummy mock data – replace with real event/indexer data
const mockContributorData: Record<string, ContributorStats> = {
  "0xUserA": {
    blessings: 80,
    burns: 20,
    retrns: 25,
    posts: 50,
    geoBlocks: 1,
    aiFlags: 2,
    deletedPosts: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 365 * 2, // 2 years ago
  },
  "0xUserB": {
    blessings: 20,
    burns: 60,
    retrns: 2,
    posts: 30,
    geoBlocks: 5,
    aiFlags: 10,
    deletedPosts: 4,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60, // 2 months ago
  },
};

export function computeTrustScore(addr: string, stats: ContributorStats): TrustScore {
  const blessRate = stats.blessings / Math.max(stats.posts, 1);
  const burnRate = stats.burns / Math.max(stats.posts, 1);
  const retrnRate = stats.retrns / Math.max(stats.posts, 1);

  const geoPenalty = stats.geoBlocks * 0.05;
  const aiPenalty = stats.aiFlags * 0.1;
  const deletionPenalty = stats.deletedPosts * 0.05;

  const accountAgeYears = (Date.now() - stats.createdAt) / (1000 * 60 * 60 * 24 * 365);
  const ageBonus = Math.min(accountAgeYears * 0.1, 0.5);

  // Weighted composite trust score (out of 1.0)
  let score =
    0.4 * blessRate +
    0.2 * retrnRate -
    0.2 * burnRate -
    geoPenalty -
    aiPenalty -
    deletionPenalty +
    ageBonus;

  score = Math.max(0, Math.min(1, score)); // clamp between 0 and 1

  return {
    address: addr,
    score,
    details: {
      blessRate,
      burnRate,
      retrnRate,
      geoPenalty,
      aiPenalty,
      ageBonus,
    },
  };
}

function buildTrustIndex() {
  const index: Record<string, TrustScore> = {};

  for (const [addr, stats] of Object.entries(mockContributorData)) {
    index[addr] = computeTrustScore(addr, stats);
  }

  const outputPath = path.join(__dirname, "output", "trustIndex.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
  console.log(`✅ Trust index written to ${outputPath}`);
}

if (require.main === module) {
  buildTrustIndex();
}
