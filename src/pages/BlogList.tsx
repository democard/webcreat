import React, { useState, useMemo } from "react";
import { Search, Tag, Calendar, Clock, ArrowRight } from "lucide-react";
import { Post } from "../types/blog";

interface BlogListProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

export const BlogList: React.FC<BlogListProps> = ({ posts, onSelectPost }) => {
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchTag = selectedTag === "all" || p.tags.includes(selectedTag);
      const matchQuery =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTag && matchQuery;
    });
  }, [posts, selectedTag, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
          文章归档 (Writings)
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          记录关于前端工程化、架构设计、开源实践与技术思考。共 {posts.length} 篇文章。
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="按标题或关键字搜索文章..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-cyan-500/50 transition-colors shadow-sm"
          />
        </div>

        {/* Tag chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedTag("all")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              selectedTag === "all"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            全部 ({posts.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                selectedTag === tag
                  ? "bg-cyan-600 text-white dark:bg-cyan-500 dark:text-black font-semibold"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            暂无匹配的文章，换个关键词试试？
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="group p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm hover:shadow-md space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {post.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {post.title}
              </h2>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                {post.summary}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
};