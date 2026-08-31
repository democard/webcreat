import React, { useState, useEffect } from "react";
import { Search, X, BookOpen, FolderGit2, ArrowRight } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 gap-3">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章、技术标签或开源项目..."
            className="flex-1 bg-transparent text-zinc-900 dark:text-zinc-100 text-sm outline-none placeholder-zinc-400 font-sans"
          />
          <kbd className="px-2 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded border border-zinc-200 dark:border-zinc-700 font-mono">
            ESC
          </kbd>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Posts */}
          {matchedPosts.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                文章 ({matchedPosts.length})
              </div>
              <div className="space-y-1">
                {matchedPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => {
                      onSelectPost(post);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-left group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                        {post.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                        {post.summary}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {matchedProjects.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-purple-500" />
                项目 ({matchedProjects.length})
              </div>
              <div className="space-y-1">
                {matchedProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-left group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {proj.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                        {proj.description}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedPosts.length === 0 && matchedProjects.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-500">
              未找到与 "{query}" 匹配的内容
            </div>
          )}
        </div>
      </div>
    </div>
  );
};