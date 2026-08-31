import React from "react";
import { Github, Mail, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 mt-20 py-8 bg-slate-950/40 text-xs text-slate-500 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 font-mono">
          <span>© 2026</span>
          <a
            href="https://github.com/democard"
            target="_blank"
            rel="noreferrer"
            className="text-slate-300 hover:text-cyan-400 font-semibold transition-colors"
          >
            democard
          </a>
          <span>· Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <a
            href="https://github.com/democard/webcreat"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <Github className="w-3.5 h-3.5" /> Source Code
          </a>
          <a
            href="mailto:democard666@gmail.com"
            className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" /> Contact
          </a>
        </div>
      </div>
    </footer>
  );
};