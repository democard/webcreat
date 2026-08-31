import React from "react";
import { Mail, Github, Terminal, Cpu, Binary, Code2 } from "lucide-react";

export const About: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-2xl">
      <div className="space-y-2 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          关于 (About)
        </h1>
        <p className="text-xs font-mono text-cyan-400">
          democard · Systems, Algorithms &amp; Architecture
        </p>
      </div>

      <div className="space-y-5 text-sm text-slate-300 leading-relaxed font-sans">
        <p>
          你好，我是 <strong>democard</strong>。
        </p>
        <p>
          这里是我的个人技术空间与数字化实验室。我主要聚焦于<strong>算法研究、底层系统设计与现代化 Web 工程架构</strong>。平时喜欢通过写代码去解构复杂问题，并将经过实战验证的思考与性能调优经验沉淀在这里。
        </p>
        <p className="font-mono text-xs text-slate-400 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
          // 技术信条：严谨的逻辑、纯粹的实现、持续的工程演进。
        </p>

        <div className="pt-4 flex items-center gap-4 text-xs font-mono">
          <a
            href="https://github.com/democard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-white hover:text-cyan-400 underline underline-offset-4 transition-colors"
          >
            <Github className="w-4 h-4" /> GitHub
          </a>
          <span className="text-slate-700">/</span>
          <a
            href="mailto:democard666@gmail.com"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4 text-cyan-400" /> democard666@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};