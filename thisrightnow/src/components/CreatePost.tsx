import { useState } from "react";
import { submitPost } from "@/utils/submitPost";

export default function CreatePost({ onPostCreated }: { onPostCreated: (post: any) => void }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("general");

  const handleSubmit = async () => {
    const hash = await submitPost(text, category);
    onPostCreated({ text, category, hash });
    setText("");
  };

  return (
    <div className="border p-4 rounded mb-4">
      <textarea
        className="w-full p-2 border rounded"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's happening?"
      />
      <div className="flex gap-2 mt-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="general">General</option>
          <option value="politics">Politics</option>
          <option value="news">News</option>
          <option value="nsfw">NSFW</option>
        </select>
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-1 rounded">
          Post
        </button>
      </div>
    </div>
  );
}
