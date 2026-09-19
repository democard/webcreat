import React, { useMemo, useState } from "react";
import { ArrowUpRight, Github, RefreshCw, Search } from "lucide-react";
import { Project } from "../types/blog";
import { ProjectSource } from "../lib/github";
import { ProjectCard } from "../components/home/ProjectCard";

interface ProjectsProps { projects: Project[]; loading?: boolean; source?: ProjectSource; onRefresh?: () => void }

export const Projects: React.FC<ProjectsProps> = ({ projects, loading = false, source = "live", onRefresh }) => {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("updated");
  const filtered = useMemo(() => projects.filter((project) => {
    const tags = project.tags.map((tag) => tag.toLowerCase());
    const matchesCategory = category === "all" || (category === "native"
      ? tags.some((tag) => ["kotlin", "android", "python", "pyside6", "qt"].includes(tag))
      : tags.some((tag) => ["typescript", "javascript", "react", "tailwindcss", "html", "css", "canvas"].includes(tag)));
    const text = [project.title, project.description, ...project.tags].join(" ").toLowerCase();
    return matchesCategory && query.trim().toLowerCase().split(/\s+/).every((term) => text.includes(term));
  }).sort((a, b) => sort === "stars" ? (b.stars || 0) - (a.stars || 0) || a.title.localeCompare(b.title) : (b.updatedAt || "").localeCompare(a.updatedAt || "")), [projects, category, query, sort]);

  return <div className="space-y-8">
    <header className="flex flex-wrap items-end justify-between gap-5 border-b border-slate-800 pb-6">
      <div className="space-y-3"><p className="font-mono text-xs tracking-[.2em] text-cyan-400">OPEN SOURCE / 开源项目</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">把想法做成可用的工具。</h1>
        <p className="text-base text-slate-400">从校园助手到 Web 实验，持续打磨的工程实践。</p>
      </div>
      <a href="https://github.com/democard?tab=repositories" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300"><Github className="h-4 w-4" />完整仓库<ArrowUpRight className="h-4 w-4" /></a>
    </header>
    <div className="requires-js space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type="search" aria-label="搜索开源项目" maxLength={120} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="按项目名称、技术栈或描述搜索…"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-11 pr-4 text-base text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/60" />
        </div>
        <select aria-label="项目排序" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
          <option value="updated">最近更新</option><option value="stars">最多星标</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2">{[["all", "全部项目"], ["native", "原生与多端"], ["web", "Web 与交互"]].map(([id, label]) =>
        <button key={id} aria-pressed={category === id} onClick={() => setCategory(id)} className={`rounded-full border px-4 py-1.5 text-sm ${category === id ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200" : "border-slate-800 text-slate-400 hover:border-slate-600"}`}>{label}</button>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <p role="status">{filtered.length} 个项目 · {loading ? "正在同步 GitHub…" : source === "cache" ? "来自本地缓存" : source === "fallback" ? "网络暂不可用，展示预置项目" : "已同步 GitHub"} · 最近 30 个仓库中筛选原创项目</p>
        {onRefresh && <button disabled={loading} onClick={onRefresh} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-300 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />刷新</button>}
      </div>
    </div>
    <section aria-label="项目列表" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
      {!filtered.length && <div className="col-span-full rounded-2xl border border-dashed border-slate-700 py-14 text-center">
        <h2 className="text-lg font-semibold text-slate-200">暂时没有匹配的项目</h2><p className="mt-2 text-sm text-slate-400">换一个关键词，或查看全部项目。</p>
        <button onClick={() => { setQuery(""); setCategory("all"); }} className="mt-5 rounded-lg bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">清除筛选</button>
      </div>}
    </section>
  </div>;
};
