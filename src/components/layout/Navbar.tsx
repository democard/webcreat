import React from "react";
import { Search, Github } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
}) => {
  const navItems = [
    { id: "home", label: "首页" },
    { id: "blog", label: "文章" },
    { id: "projects", label: "项目" },
    { id: "about", label: "关于" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl transition-colors">
      <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand with emblem */}
        <button
          onClick={() => onSelectTab("home")}
          className="flex items-center gap-2 group text-left"
        >
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center overflow-hidden p-1 group-hover:border-cyan-400/60 transition-all">
            <img src="./emblem.svg" alt="logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-mono font-bold text-sm tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors">
            democard
          </span>
        </button>

        {/* Center Nav Links (Responsive: visible on both desktop & mobile) */}
        <nav className="flex items-center gap-1 text-xs font-mono">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all text-xs ${
                  isActive
                    ? "bg-slate-800/90 text-cyan-300 font-semibold border border-slate-700/60 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 bg-slate-900/80 hover:bg-slate-800 hover:text-slate-200 rounded-lg border border-slate-800/80 transition-colors"
            title="全局搜索 (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline text-[10px] text-slate-500 bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
              ⌘K
            </span>
          </button>

          <a
            href="https://github.com/democard"
            target="_blank"
            rel="noreferrer"
            className="p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800/80 transition-colors"
            title="GitHub Profile"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
};