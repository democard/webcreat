import React, { useState, useMemo } from "react";
import { Search, Calendar, Clock, Binary, ArrowRight } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in duration-200 w-full mx-auto">
      {/* 头部标题与描述 */}
      <div className="space-y-2 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Binary className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            技术笔记与手记 (Writings &amp; Logs)
          </h1>
        </div>
        <p className="text-xs font-mono text-slate-400">
          记录关于算法研究、系统底层、工程实战与技术复盘。共 {posts.length} 篇沉淀。
        </p>
      </div>

      {/* 搜索与分类过滤 */}
      <div className="space-y-3.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="按标题、关键字或摘要检索技术笔记..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 text-slate-100 text-xs font-mono rounded-xl border border-slate-800/80 focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600 backdrop-blur-xl"
          />
        </div>

        {/* 标签选择 */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono">
          <button
            onClick={() => setSelectedTag("all")}
            className={`px-3 py-1 text-xs rounded-lg transition-all border ${
              selectedTag === "all"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold"
                : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800/80 hover:bg-slate-900/60"
            }`}
          >
            全部 ({posts.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all border ${
                selectedTag === tag
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold"
                  : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800/80 hover:bg-slate-900/60"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 文章列表 */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500 bg-slate-950/20 rounded-2xl border border-slate-800/60">
            未检索到匹配的技术笔记，换个关键词试试？
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="group relative p-6 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 bg-slate-950/20 hover:bg-slate-900/40 backdrop-blur-2xl transition-all duration-300 cursor-pointer space-y-3 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    {post.date}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {post.readTime}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 text-[10px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors font-sans flex items-center justify-between">
                <span>{post.title}</span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </h2>

              <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed transition-colors font-sans line-clamp-2">
                {post.summary}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
};