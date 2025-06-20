import { useState } from "react";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";

export default function PostFeed() {
  const [posts, setPosts] = useState<any[]>([]);

  const handleNewPost = (post: any) => {
    setPosts([post, ...posts]);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <CreatePost onPostCreated={handleNewPost} />
      {posts.map((p, i) => (
        <PostCard key={i} post={p} />
      ))}
    </div>
  );
}
