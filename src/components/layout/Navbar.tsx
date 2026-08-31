import React from "react";
import { Search, Sun, Moon, Github, Home, BookOpen, FolderGit2, User } from "lucide-react";

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
  isDark,
  onToggleTheme,
  onOpenSearch,
}) => {
  const navItems = [
    { id: "home", label: "首页" },
    { id: "blog", label: "文章" },
    { id: "projects", label: "项目" },
    { id: "about", label: "关于" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl transition-colors">
      <div className="max-w-4xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <button
          onClick={() => onSelectTab("home")}
          className="text-left group"
        >
          <span className="font-mono font-bold text-sm tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors">
            democard
          </span>
        </button>

        {/* Center Nav Links */}
        <nav className="hidden sm:flex items-center gap-1 text-xs font-medium">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-slate-800 text-slate-100 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-400 bg-slate-900/80 hover:bg-slate-800 hover:text-slate-200 rounded-lg border border-slate-800 transition-colors font-mono"
            title="搜索 (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <kbd className="text-[10px] font-mono bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800 text-slate-400">
              ⌘K
            </kbd>
          </button>

          <a
            href="https://github.com/democard"
            target="_blank"
            rel="noreferrer"
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};