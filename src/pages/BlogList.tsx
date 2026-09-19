import React, { useEffect, useMemo, useState } from "react";
import { Search, Calendar, Clock, ArrowUpRight, X, Rss } from "lucide-react";
import { Post } from "../types/blog";
import { InternalLink } from "../components/common/InternalLink";
import { assetUrl } from "../config/site";
import { rankPosts } from "../lib/search";

interface BlogListProps { posts: Post[] }

export const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  const [selectedTag, setSelectedTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const tags = useMemo(() => [...new Set(posts.flatMap((post) => post.tags))], [posts]);
  useEffect(() => {
    const sync = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedTag(tags.includes(params.get("tag") || "") ? params.get("tag")! : "all");
      setSearchQuery(params.get("q") || "");
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [tags]);

  const update = (tag: string, query: string) => {
    setSelectedTag(tag);
    setSearchQuery(query);
    const url = new URL(window.location.href);
    if (tag === "all") url.searchParams.delete("tag"); else url.searchParams.set("tag", tag);
    if (!query.trim()) url.searchParams.delete("q"); else url.searchParams.set("q", query.trim());
    window.history.replaceState(null, "", url);
  };
  const filtered = rankPosts(posts.filter((post) => selectedTag === "all" || post.tags.includes(selectedTag)), searchQuery);
  const hasFilter = selectedTag !== "all" || !!searchQuery.trim();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-slate-800 pb-6">
        <div className="space-y-3"><p className="font-mono text-xs tracking-[.2em] text-cyan-400">WRITINGS / 技术手记</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">在实践中思考，<br className="sm:hidden" />在记录中沉淀。</h1>
          <p className="text-base text-slate-400">算法、系统与工程实战。共 {posts.length} 篇文章。</p>
        </div>
        <a href={assetUrl("feed.xml")} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300"><Rss className="h-4 w-4" />RSS 订阅</a>
      </header>
      <div className="requires-js space-y-4">
        <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type="search" aria-label="搜索技术笔记" maxLength={120} value={searchQuery} onChange={(event) => update(selectedTag, event.target.value)}
            placeholder="搜索标题、摘要或标签…" className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-11 pr-4 text-base text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/60" />
        </div>
        <div className="flex flex-wrap gap-2" aria-label="按标签筛选">
          {["all", ...tags].map((tag) => <button key={tag} aria-pressed={selectedTag === tag} onClick={() => update(tag, searchQuery)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${selectedTag === tag ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200" : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"}`}>
            {tag === "all" ? "全部文章" : tag}
          </button>)}
        </div>
        <div className="flex min-h-6 items-center justify-between gap-3">
          <p role="status" className="text-sm text-slate-500">{hasFilter ? `找到 ${filtered.length} 篇文章` : "按发布时间排列"}</p>
          {hasFilter && <button onClick={() => update("all", "")} className="flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-300"><X className="h-3.5 w-3.5" />清除筛选</button>}
        </div>
      </div>
      <div className="space-y-4">
        {!filtered.length && <div className="rounded-2xl border border-dashed border-slate-700 px-6 py-14 text-center">
          <h2 className="text-lg font-semibold text-slate-200">没有找到匹配的文章</h2>
          <p className="mt-2 text-sm text-slate-400">换一个关键词，或清除筛选查看全部内容。</p>
          <button onClick={() => update("all", "")} className="mt-5 rounded-lg bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">查看全部文章</button>
        </div>}
        {filtered.map((post, index) => <InternalLink key={post.id} to={{ tab: "post-detail", postSlug: post.slug }}
          className="group block rounded-2xl border border-slate-800 bg-slate-950/30 p-5 transition-colors hover:border-cyan-400/40 hover:bg-slate-900/40 sm:p-7">
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="font-mono text-slate-500">{String(index + 1).padStart(2, "0")}</span>
            <time dateTime={post.date} className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{post.date}</time>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{post.readTime}</span>
          </div>
          <h2 className="flex items-start justify-between gap-4 text-lg font-semibold leading-relaxed text-slate-100 group-hover:text-cyan-200 sm:text-xl">
            {post.title}<ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-slate-500 group-hover:text-cyan-300" />
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">{post.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag} className="rounded-md bg-slate-800/50 px-2 py-1 text-xs text-slate-400">{tag}</span>)}</div>
        </InternalLink>)}
      </div>
    </div>
  );
};
