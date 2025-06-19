import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CATEGORY_LIST = [
  "NSFW",
  "HateSpeech",
  "Spam",
  "Crypto",
  "Politics",
  "MedicalMisinformation",
  "None"
];

const postInput = JSON.parse(
  fs.readFileSync(path.join(__dirname, "postContent.json"), "utf-8")
) as { [postHash: string]: string };

async function classifyPost(postHash: string, content: string): Promise<string[]> {
  const systemPrompt = `
You are a content moderation AI. Classify the content into the following categories if applicable:
${CATEGORY_LIST.join(", ")}

You may also be provided context on the author's reputation. For example:
"User 0xabc has a trust score of 82. Their last 3 flagged posts were appealed successfully. Avoid reflexively flagging this account unless confidence is high."

You must return a JSON array of category names. Only include categories that clearly apply. If none apply, return ["None"].
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: content }
    ],
    temperature: 0.0,
  });

  try {
    const tags = JSON.parse(response.choices[0].message.content ?? "[]");
    return Array.isArray(tags) ? tags : ["None"];
  } catch {
    return ["None"];
  }
}

async function run() {
  const result: Record<string, string[]> = {};

  for (const [postHash, content] of Object.entries(postInput)) {
    const tags = await classifyPost(postHash, content);
    result[postHash] = tags;
    console.log(`${postHash}: ${tags.join(", ")}`);
  }

  fs.writeFileSync(
    path.join(__dirname, "output", "postTags.json"),
    JSON.stringify(result, null, 2)
  );

  console.log("✅ Tagged all posts.");
}

run();
