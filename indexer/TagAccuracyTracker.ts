import fs from "fs";
import path from "path";

// Mock metadata from the post system
const postMeta = JSON.parse(
  fs.readFileSync(path.join(__dirname, "output", "postMetadata.json"), "utf-8")
) as Record<string, { author: string; tags: string[] }>;

// AI-labeled truth set
const aiTags = JSON.parse(
  fs.readFileSync(path.join(__dirname, "output", "postTags.json"), "utf-8")
) as Record<string, string[]>;

type TagAccuracyMap = Record<string, { correct: number; total: number; accuracy: number }>;

function calcTagAccuracy() {
  const accMap: TagAccuracyMap = {};

  for (const [postHash, { author, tags }] of Object.entries(postMeta)) {
    const ai = new Set(aiTags[postHash] || []);
    const user = new Set(tags || []);

    const truePositives = [...user].filter((tag) => ai.has(tag) && tag !== "None").length;
    const totalRelevant = ai.size - (ai.has("None") ? 1 : 0);

    if (!accMap[author]) accMap[author] = { correct: 0, total: 0, accuracy: 0 };

    accMap[author].correct += truePositives;
    accMap[author].total += totalRelevant;
  }

  for (const addr in accMap) {
    const { correct, total } = accMap[addr];
    accMap[addr].accuracy = total === 0 ? 1 : correct / total;
  }

  fs.writeFileSync(
    path.join(__dirname, "output", "tagAccuracy.json"),
    JSON.stringify(accMap, null, 2)
  );

  console.log("✅ Tag accuracy scored and saved.");
}

if (require.main === module) {
  calcTagAccuracy();
}
