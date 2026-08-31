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
    <div className="space-y-20 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* 1. Hero 区域 */}
      <HomeHero onNavigate={onNavigate} />

      {/* 2. 开源工程 (LIVE REPOSITORIES) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-xs font-bold">[ 01 ]</span>
            <h2 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
              <span>工程与仓库 (LIVE REPOSITORIES)</span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </h2>
          </div>
          <button
            onClick={() => onNavigate("projects")}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 font-mono"
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

      {/* 3. 算法思考与技术沉淀 (WRITINGS & LOGS) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-mono text-xs font-bold">[ 02 ]</span>
            <h2 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
              <span>技术沉淀与研究 (WRITINGS &amp; LOGS)</span>
              <Binary className="w-3.5 h-3.5 text-indigo-400" />
            </h2>
          </div>
          <button
            onClick={() => onNavigate("blog")}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 font-mono"
          >
            全部日志 <ArrowRight className="w-3 h-3" />
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