import React from "react";
import { ExternalLink, Github, Star, GitFork, Clock, Cpu } from "lucide-react";
import { Project } from "../types/blog";

interface ProjectsProps {
  projects: Project[];
}

export const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
      <div className="space-y-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            工程与开源仓库 (Repositories)
          </h1>
        </div>
        <p className="text-xs font-mono text-slate-400">
          实时同步自 GitHub (@democard) · 点击任意卡片直接在新标签页打开仓库
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => {
              if (proj.githubUrl) window.open(proj.githubUrl, "_blank");
            }}
            className="group relative p-6 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 bg-slate-950/20 hover:bg-slate-900/40 backdrop-blur-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors font-mono flex items-center gap-2">
                  <span className="text-cyan-400">❯</span>
                  {proj.title}
                </span>
                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-cyan-300 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed transition-colors">
                {proj.description}
              </p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800/60 text-[11px] font-mono text-slate-500">
              <div className="flex flex-wrap gap-1.5">
                {proj.tags.map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                {proj.stars !== undefined && proj.stars > 0 ? (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" /> {proj.stars}
                  </span>
                ) : (
                  <span>公开仓库</span>
                )}
                {proj.updatedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {proj.updatedAt}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};