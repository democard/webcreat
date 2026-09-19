import React from "react";
import { ArrowUpRight, Star, GitFork, Globe } from "lucide-react";
import { Project } from "../../types/blog";

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <article className="group relative flex h-full min-w-0 flex-col rounded-2xl border border-slate-800 bg-slate-950/35 p-6 transition-colors hover:border-cyan-400/40 hover:bg-slate-900/40 focus-within:border-cyan-400/50">
    <div className="mb-4 flex items-start justify-between gap-3">
      <h3 className="min-w-0 break-words font-mono text-base font-semibold leading-7 text-slate-100 group-hover:text-cyan-200">
        {project.githubUrl ? <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 after:z-10 after:rounded-2xl" aria-label={`在 GitHub 查看 ${project.title}`}>{project.title}</a> : project.title}
      </h3>
      <ArrowUpRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-slate-500 group-hover:text-cyan-300" />
    </div>
    <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-400">{project.description}</p>
    <div className="mb-5 flex flex-wrap gap-2">{project.tags.map((tag) => <span key={tag} className="rounded-md bg-slate-800/50 px-2 py-1 text-xs text-slate-400">{tag}</span>)}</div>
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1" aria-label={`${project.stars || 0} 个星标`}><Star className="h-3.5 w-3.5 text-amber-300/80" />{project.stars || 0}</span>
        {project.forks !== undefined && <span className="inline-flex items-center gap-1" aria-label={`${project.forks} 次 Fork`}><GitFork className="h-3.5 w-3.5" />{project.forks}</span>}
        {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="relative z-20 inline-flex items-center gap-1 text-cyan-300 hover:underline"><Globe className="h-3.5 w-3.5" />演示</a>}
      </div>
      {project.updatedAt && <time dateTime={project.updatedAt}>{project.updatedAt}</time>}
    </div>
  </article>
);
