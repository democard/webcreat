import React from "react";
import { Github, BookOpen, Mail } from "lucide-react";
import { HeroEmblemCanvas } from "./HeroEmblemCanvas";

interface HomeHeroProps {
  onNavigate: (tab: string) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onNavigate }) => {
  const techPills = [
    { name: "Kotlin", color: "hover:border-purple-500/50 hover:text-purple-300" },
    { name: "Jetpack Compose", color: "hover:border-emerald-500/50 hover:text-emerald-300" },
    { name: "Python", color: "hover:border-amber-500/50 hover:text-amber-300" },
    { name: "PySide6", color: "hover:border-emerald-500/50 hover:text-emerald-300" },
    { name: "React 18", color: "hover:border-cyan-500/50 hover:text-cyan-300" },
    { name: "TypeScript", color: "hover:border-sky-500/50 hover:text-sky-300" },
    { name: "TailwindCSS", color: "hover:border-teal-500/50 hover:text-teal-300" },
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 sm:pt-8 relative z-10">
      {/* 左侧文字排版 */}
      <div className="lg:col-span-7 space-y-6">
        {/* 状态徽章 */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 backdrop-blur-xl shadow-lg shadow-cyan-500/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="font-semibold tracking-wide">democard · 个人实验室</span>
        </div>

        {/* 主标题 */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans leading-tight">
            构建系统，<br />
            深入 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">底层与算法</span>。
          </h1>
          <p className="text-xs sm:text-sm font-mono text-slate-500 tracking-wider">
            // Talk is cheap. Show me the code.
          </p>
        </div>

        {/* 自述 */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          这里是 <strong>democard</strong> 的技术空间。专注于算法研究、系统底层设计与现代 Web 架构。不写空话，只记录真实的工程实践、性能调优与技术沉淀。
        </p>

        {/* 核心技术栈徽章 */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {techPills.map((tech) => (
            <span
              key={tech.name}
              className={`px-2 py-0.5 rounded-md bg-slate-950/40 text-slate-400 border border-slate-800/80 text-[11px] font-mono transition-colors ${tech.color}`}
            >
              {tech.name}
            </span>
          ))}
        </div>

        {/* 交互按键 */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
          <a
            href="https://github.com/democard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
          >
            <Github className="w-4 h-4" />
            <span>GitHub Profile</span>
          </a>
          <button
            onClick={() => onNavigate("blog")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 hover:border-cyan-400/50 transition-all backdrop-blur-xl hover:-translate-y-0.5 font-medium"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>技术手记</span>
          </button>
          <a
            href="mailto:democard666@gmail.com"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white border border-white/5 hover:border-white/20 transition-all backdrop-blur-md"
          >
            <Mail className="w-4 h-4" />
            <span>技术交流</span>
          </a>
        </div>
      </div>

      {/* 右侧：狼首微米流体图腾专属容器 (100% 容器内居中自适应，绝不溢出截断) */}
      <div className="lg:col-span-5 flex items-center justify-center pt-2 lg:pt-0">
        <HeroEmblemCanvas />
      </div>
    </section>
  );
};