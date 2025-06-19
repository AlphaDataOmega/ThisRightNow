import trustIndex from "../indexer/output/trustIndex.json";

type Flag = {
  address: string;
  reason: string;
  timestamp: number;
};

type Post = {
  postHash: string;
  content: string;
  flags: Flag[];
  blessings: number;
  burns: number;
  retrns: number;
  author: string;
};

export function scorePost(post: Post): number {
  let score = 0;

  for (const flag of post.flags) {
    const trust = trustIndex[flag.address]?.score ?? 0;
    const weight = trust >= 0.5 ? 1 + trust : trust * 0.2; // high-trust flags count more
    score += weight;
  }

  const authorTrust = trustIndex[post.author]?.score ?? 0.5;
  const authorPenalty = authorTrust < 0.3 ? 0.5 : authorTrust >= 0.7 ? -0.5 : 0;
  score += authorPenalty;

  const engagementPenalty = (post.burns / Math.max(post.blessings + post.retrns + 1, 1)) * 0.5;
  score += engagementPenalty;

  return score; // higher = more likely to be burned
}
