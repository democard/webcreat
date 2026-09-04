import React from "react";
import { ArrowRight, Cpu, Binary } from "lucide-react";
import { Post, Project } from "../types/blog";
import { HomeHero } from "../components/home/HomeHero";
import { ProjectCard } from "../components/home/ProjectCard";
import { PostItem } from "../components/home/PostItem";

interface HomeProps {
  posts: Post[];
  projects: Project[];
  onSelectPost: (post: Post) => void;
  onNavigate: (tab: string) => void;
  onOpenTerminal: () => void;
}

export const Home: React.FC<HomeProps> = ({
  posts,
  projects,
  onSelectPost,
  onNavigate,
}) => {
  return (
    <div className="space-y-20 animate-in fade-in duration-300 w-full mx-auto">
      {/* 1. Hero 区域 */}
      <HomeHero onNavigate={onNavigate} />

      {/* 2. 开源工程与仓库 */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-cyan-400 font-mono text-xs font-bold whitespace-nowrap shrink-0">[ 01 ]</span>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 truncate">
              <span>工程与仓库</span>
              <span className="hidden sm:inline text-slate-500 font-normal">(LIVE REPOSITORIES)</span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            </h2>
          </div>
          <button
            onClick={() => onNavigate("projects")}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 font-mono whitespace-nowrap shrink-0"
          >
            全部仓库 ({projects.length}) <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.slice(0, 4).map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>
      </section>

      {/* 3. 算法思考与技术笔记 */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-purple-400 font-mono text-xs font-bold whitespace-nowrap shrink-0">[ 02 ]</span>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 truncate">
              <span>技术手记与沉淀</span>
              <span className="hidden sm:inline text-slate-500 font-normal">(WRITINGS &amp; LOGS)</span>
              <Binary className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            </h2>
          </div>
          <button
            onClick={() => onNavigate("blog")}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 font-mono whitespace-nowrap shrink-0"
          >
            全部手记 <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {posts.map((post) => (
            <PostItem key={post.id} post={post} onSelect={onSelectPost} />
          ))}
        </div>
      </section>
    </div>
  );
};