import React from "react";
import { ExternalLink } from "lucide-react";
import { Project } from "../../types/blog";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div
      onClick={() => {
        if (project.githubUrl) window.open(project.githubUrl, "_blank");
      }}
      className="group relative p-6 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 bg-slate-950/20 hover:bg-slate-900/40 backdrop-blur-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/0 group-hover:bg-cyan-500/10 rounded-full blur-2xl transition-all duration-300 pointer-events-none" />

      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors font-mono flex items-center gap-2">
            <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">❯</span>
            {project.title}
          </span>
          <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-cyan-300 transition-colors" />
        </div>
        <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed transition-colors line-clamp-2">
          {project.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 relative z-10 text-[11px] font-mono text-slate-500">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded bg-white/5 group-hover:bg-cyan-950/40 text-slate-400 group-hover:text-cyan-300 border border-white/5 group-hover:border-cyan-500/30 transition-colors"
            >
              #{t}
            </span>
          ))}
        </div>

        {project.updatedAt && (
          <span className="text-[10px] text-slate-500 shrink-0">
            {project.updatedAt}
          </span>
        )}
      </div>
    </div>
  );
};