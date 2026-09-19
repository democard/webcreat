import React, { useEffect, useRef, useState } from "react";
import { Search, X, BookOpen, Cpu, ArrowRight } from "lucide-react";
import { Post, Project } from "../../types/blog";
import { loadSearchIndex } from "../../lib/content";
import { rankPosts, searchExcerpt, searchTerms } from "../../lib/search";
import { SearchHighlight } from "./SearchHighlight";

interface SearchModalProps {
  onClose: () => void;
  posts: Post[];
  projects: Project[];
  onSelectPost: (post: Post) => void;
  onSelectProject: (project: Project) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  onClose, posts, projects, onSelectPost, onSelectProject,
}) => {
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(true);
  const [fullText, setFullText] = useState(new Map<string, string>());
  const [indexStatus, setIndexStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    loadSearchIndex().then((index) => { if (active) { setFullText(index); setIndexStatus("ready"); } })
      .catch(() => { if (active) setIndexStatus("error"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (restoreFocus.current) trigger?.focus();
    };
  }, []);

  const q = query.toLocaleLowerCase().trim();
  const matches = (values: string[]) => searchTerms(q).every((term) => values.some((value) => value.toLocaleLowerCase().includes(term)));
  const matchedPosts = rankPosts(posts, q, fullText);
  const matchedProjects = projects.filter((project) => matches([project.title, project.description, ...project.tags]));

  const handleKeys = (event: React.KeyboardEvent) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Tab") {
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('input, button:not([disabled]), a[href], [tabindex="0"]') || []);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      return;
    }
    const results = Array.from(resultsRef.current?.querySelectorAll<HTMLButtonElement>("[data-search-result]") || []);
    const current = results.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = current < 0 ? (event.key === "ArrowDown" ? 0 : results.length - 1)
        : event.key === "ArrowDown" ? current + 1 : current - 1;
      if (results.length) results[(next + results.length) % results.length].focus();
    } else if (event.key === "Enter" && event.target === inputRef.current && results.length) {
      event.preventDefault();
      results[0].click();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="全局搜索"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={handleKeys}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-black/75 p-4 pt-16 sm:pt-20 text-slate-200 backdrop-blur-md"
    >
      <div className="mx-auto flex max-h-[calc(100dvh-6rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-950 shadow-2xl shadow-cyan-950/20">
        <div className="flex items-center gap-3 border-b border-slate-800/80 px-4 py-3.5">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-400" />
          <input ref={inputRef} type="search" aria-label="搜索文章、项目或标签" maxLength={120}
            value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索标题、正文、标签或项目…"
            className="min-w-0 flex-1 bg-transparent text-base text-slate-100 outline-none placeholder:text-slate-500" />
          <button onClick={onClose} aria-label="关闭搜索" className="rounded-lg p-2 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="px-4 pt-3 text-xs text-slate-500" role="status">{matchedPosts.length + matchedProjects.length} 条结果{indexStatus === "loading" ? " · 正在加载正文索引…" : indexStatus === "error" ? " · 正文索引暂不可用，仍可搜索标题和标签" : " · 支持全文检索"}</p>
        <div ref={resultsRef} className="space-y-4 overflow-y-auto p-3">
          {matchedPosts.length > 0 && <section className="space-y-2" aria-label="文章搜索结果">
            <h2 className="flex items-center gap-2 px-2 text-sm text-slate-400"><BookOpen className="h-4 w-4 text-cyan-400" />技术手记 ({matchedPosts.length})</h2>
            {matchedPosts.map((post) => <button key={post.id} data-search-result
              onClick={() => { restoreFocus.current = false; onSelectPost(post); onClose(); }}
              className="group flex w-full items-center justify-between rounded-xl border border-transparent p-3 text-left hover:border-cyan-500/30 hover:bg-slate-900/70 focus-visible:bg-slate-900">
              <span className="min-w-0"><span className="block text-sm font-semibold text-slate-200 group-hover:text-cyan-300"><SearchHighlight text={post.title} query={q} /></span>
                <span className="mt-1 block line-clamp-2 text-sm text-slate-400"><SearchHighlight text={searchExcerpt(fullText.get(post.slug) || "", q, post.summary)} query={q} /></span></span>
              <ArrowRight className="ml-2 h-4 w-4 shrink-0 text-slate-500" />
            </button>)}
          </section>}
          {matchedProjects.length > 0 && <section className="space-y-2" aria-label="项目搜索结果">
            <h2 className="flex items-center gap-2 px-2 text-sm text-slate-400"><Cpu className="h-4 w-4 text-indigo-400" />工程与仓库 ({matchedProjects.length})</h2>
            {matchedProjects.map((project) => <button key={project.id} data-search-result
              onClick={() => { if (!project.githubUrl) restoreFocus.current = false; onSelectProject(project); onClose(); }}
              className="group flex w-full items-center justify-between rounded-xl border border-transparent p-3 text-left hover:border-indigo-500/30 hover:bg-slate-900/70 focus-visible:bg-slate-900">
              <span className="min-w-0"><span className="block text-sm font-semibold text-slate-200 group-hover:text-indigo-300">{project.title}</span>
                <span className="mt-1 block line-clamp-1 text-xs text-slate-400">{project.description}</span></span>
              <ArrowRight className="ml-2 h-4 w-4 shrink-0 text-slate-500" />
            </button>)}
          </section>}
          {!matchedPosts.length && !matchedProjects.length && <p className="p-8 text-center text-sm text-slate-400">未检索到与“{query}”匹配的内容，试试其他关键词。</p>}
        </div>
        <p className="border-t border-slate-800 px-4 py-3 text-xs text-slate-500">↑ ↓ 选择 · Enter 打开 · Esc 关闭</p>
      </div>
    </dialog>
  );
};
