import React, { useState, useMemo } from "react";
import { ExternalLink, Github, Star, GitFork, Clock, Cpu, Globe, ArrowRight } from "lucide-react";
import { Project } from "../types/blog";

interface ProjectsProps {
  projects: Project[];
}

export const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProjects = useMemo(() => {
    if (activeCategory === "all") return projects;
    if (activeCategory === "native") {
      return projects.filter(
        (p) =>
          p.tags.some((t) => ["Kotlin", "Android", "Python", "PySide6", "Qt"].includes(t)) ||
          p.title.includes("xmu")
      );
    }
    if (activeCategory === "web") {
      return projects.filter(
        (p) =>
          p.tags.some((t) => ["TypeScript", "React", "TailwindCSS", "Canvas"].includes(t)) ||
          p.title.includes("web")
      );
    }
    return projects;
  }, [projects, activeCategory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* 标题 */}
      <div className="space-y-2 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            工程与开源仓库 (Repositories)
          </h1>
        </div>
        <p className="text-xs font-mono text-slate-400">
          实时同步自 GitHub (@democard) · 自动提取 README 架构解析 · 点击直接跳转远端
        </p>
      </div>

      {/* 分类切换器 */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1 rounded-lg border transition-all ${
            activeCategory === "all"
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold"
              : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800/80"
          }`}
        >
          全部工程 ({projects.length})
        </button>
        <button
          onClick={() => setActiveCategory("native")}
          className={`px-3 py-1 rounded-lg border transition-all ${
            activeCategory === "native"
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold"
              : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800/80"
          }`}
        >
          原生与多端系统
        </button>
        <button
          onClick={() => setActiveCategory("web")}
          className={`px-3 py-1 rounded-lg border transition-all ${
            activeCategory === "web"
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold"
              : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800/80"
          }`}
        >
          现代 Web 与交互
        </button>
      </div>

      {/* 项目网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => {
              if (proj.githubUrl) window.open(proj.githubUrl, "_blank");
            }}
            className="group relative p-6 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 bg-slate-950/20 hover:bg-slate-900/40 backdrop-blur-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/0 group-hover:bg-cyan-500/10 rounded-full blur-2xl transition-all duration-300 pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors font-mono flex items-center gap-2">
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">❯</span>
                  {proj.title}
                </span>
                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-cyan-300 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed transition-colors">
                {proj.description}
              </p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800/60 relative z-10 text-[11px] font-mono text-slate-500">
              <div className="flex flex-wrap gap-1.5">
                {proj.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 group-hover:bg-cyan-950/40 text-slate-400 group-hover:text-cyan-300 border border-white/5 group-hover:border-cyan-500/30 transition-colors"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-3">
                  {proj.stars !== undefined && proj.stars > 0 ? (
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400" /> {proj.stars}
                    </span>
                  ) : (
                    <span>公开仓库</span>
                  )}
                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
                    >
                      <Globe className="w-3 h-3" /> 在线演示
                    </a>
                  )}
                </div>

                {proj.updatedAt && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" /> {proj.updatedAt}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部 GitHub 跳转 */}
      <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-950/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-slate-200 font-semibold">查看更多开源项目与历史 Commit</div>
          <div className="text-slate-500 text-[11px]">所有算法实现、原型实验与工程项目均在 GitHub 持续维护。</div>
        </div>
        <a
          href="https://github.com/democard?tab=repositories"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-slate-700/60 hover:border-cyan-500/40 transition-all shrink-0"
        >
          <Github className="w-4 h-4" />
          <span>访问完整仓库列表</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};