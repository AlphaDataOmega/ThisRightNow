import { scorePost } from "./scorePost";

const post = {
  postHash: "0xabc123",
  content: "kill yourself lol",
  flags: [
    { address: "0xHighTrustUser", reason: "HateSpeech", timestamp: Date.now() },
    { address: "0xLowTrustBot", reason: "Spam", timestamp: Date.now() },
  ],
  blessings: 1,
  burns: 5,
  retrns: 0,
  author: "0xUserB",
};

const modScore = scorePost(post);
if (modScore >= 1.5) {
  console.log("🔥 Escalate for auto-burn");
}

console.log("Score", modScore);
