import React from "react";
import { Post } from "../../types/blog";

interface PostItemProps {
  post: Post;
  onSelect: (post: Post) => void;
}

export const PostItem: React.FC<PostItemProps> = ({ post, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(post)}
      className="relative p-5 rounded-xl border border-slate-800/60 hover:border-cyan-500/40 bg-slate-950/15 hover:bg-slate-900/30 backdrop-blur-xl transition-all duration-300 flex items-baseline justify-between gap-4 cursor-pointer group hover:translate-x-1.5 hover:shadow-lg hover:shadow-cyan-500/5"
    >
      <div className="space-y-1 relative z-10">
        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-1 transition-colors">
          {post.summary}
        </p>
      </div>
      <span className="text-xs text-slate-500 font-mono shrink-0 group-hover:text-cyan-400 transition-colors relative z-10">
        {post.date}
      </span>
    </div>
  );
};