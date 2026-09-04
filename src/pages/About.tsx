import React from "react";
import { Mail, Github, Cpu, Binary, Code2, Terminal, Layers } from "lucide-react";

export const About: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-200 max-w-2xl mx-auto">
      {/* 头部 */}
      <div className="space-y-2 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            关于我 (About)
          </h1>
        </div>
        <p className="text-xs font-mono text-cyan-400">
          democard · Systems, Algorithms &amp; Architecture
        </p>
      </div>

      {/* 核心介绍 */}
      <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
        <p>
          你好，我是 <strong className="text-white font-semibold">democard</strong>。
        </p>
        <p>
          这里是我的个人技术空间与数字化实验室。我主要聚焦于<strong>算法研究、系统底层设计与现代化工程架构</strong>。平时喜欢通过写代码去解构复杂问题，并将经过实战验证的思考与性能调优经验沉淀在这里。
        </p>

        {/* 极客信条 */}
        <div className="font-mono text-xs text-slate-300 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1 backdrop-blur-xl">
          <div className="text-cyan-400 font-semibold">// 技术信条 (Engineering Creed)</div>
          <p className="text-slate-400">
            严谨的逻辑、纯粹的实现、持续的工程演进。优秀的软件始于对真实痛点的忍无可忍。
          </p>
        </div>

        {/* 核心方向卡片 */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>核心技术关注 (Focus Areas)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-950/20 border border-slate-800/70 space-y-1.5 backdrop-blur-lg">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <Binary className="w-4 h-4 text-cyan-400" />
                <span>算法与底层协议</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                网络协议分析、几何三边测量估算定位、弱网环境高可靠调度与并发限流。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/20 border border-slate-800/70 space-y-1.5 backdrop-blur-lg">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>多端与原生架构</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Python + PySide6 桌面工作台、Kotlin + Jetpack Compose 原生应用与系统级服务集成。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/20 border border-slate-800/70 space-y-1.5 backdrop-blur-lg sm:col-span-2">
              <div className="flex items-center gap-2 text-sky-300 font-semibold">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>现代 Web &amp; 高性能交互</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                React 18、TypeScript、TailwindCSS，Canvas/WebGL 粒子流体渲染与自适应响应式设计。
              </p>
            </div>
          </div>
        </div>

        {/* 联系与社交 */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs font-mono">
          <a
            href="https://github.com/democard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 underline underline-offset-4 transition-colors"
          >
            <Github className="w-4 h-4" /> GitHub (@democard)
          </a>
          <span className="text-slate-700">/</span>
          <a
            href="mailto:democard666@gmail.com"
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Mail className="w-4 h-4 text-cyan-400" /> democard666@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};