import React, { useState, useEffect } from "react";
import { Search, X, BookOpen, Cpu, ArrowRight } from "lucide-react";
import { Post, Project } from "../../types/blog";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  projects: Project[];
  onSelectPost: (post: Post) => void;
  onSelectProject: (proj: Project) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  posts,
  projects,
  onSelectPost,
  onSelectProject,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();
  const matchedPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );

  const matchedProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-950/95 border border-slate-800/90 rounded-2xl shadow-2xl shadow-cyan-950/20 overflow-hidden flex flex-col backdrop-blur-2xl">
        {/* 搜索输入框 */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800/80 gap-3">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索技术手记、开源仓库或标签..."
            className="flex-1 bg-transparent text-slate-100 text-sm outline-none placeholder:text-slate-500 font-sans"
          />
          <kbd className="px-2 py-0.5 text-[10px] bg-slate-900 text-slate-400 rounded border border-slate-800 font-mono">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 检索结果列表 */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* 文章 */}
          {matchedPosts.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>技术手记 ({matchedPosts.length})</span>
              </div>
              <div className="space-y-1">
                {matchedPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => {
                      onSelectPost(post);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900/70 border border-transparent hover:border-cyan-500/30 transition-all text-left group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {post.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
                        {post.summary}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 开源仓库 */}
          {matchedProjects.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>工程与仓库 ({matchedProjects.length})</span>
              </div>
              <div className="space-y-1">
                {matchedProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900/70 border border-transparent hover:border-indigo-500/30 transition-all text-left group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {proj.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
                        {proj.description}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedPosts.length === 0 && matchedProjects.length === 0 && (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              未检索到与 "{query}" 匹配的内容
            </div>
          )}
        </div>
      </div>
    </div>
  );
};