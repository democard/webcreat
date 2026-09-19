import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Calendar, Clock, Share2, Check, ArrowUp, ArrowRight, BookOpen } from "lucide-react";
import "highlight.js/styles/github-dark.css";
import { ArticleBody, Post } from "../types/blog";
import { postsData } from "../data/posts";
import { loadArticle } from "../lib/content";
import { InternalLink } from "../components/common/InternalLink";
import { copyText } from "../lib/clipboard";
import { postHref, scrollBehavior } from "../lib/routes";

export interface PostDetailProps {
  initialBody?: ArticleBody;
  post: Post;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, initialBody }) => {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");
  const [readingProgress, setReadingProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const shareTimer = useRef<ReturnType<typeof setTimeout>>();
  const mounted = useRef(true);
  const [body, setBody] = useState<ArticleBody | undefined>(initialBody);
  const [loadError, setLoadError] = useState(false);
  const [activeHeading, setActiveHeading] = useState(initialBody?.headings[0]?.id || "");
  const html = body?.html || "";
  const headings = body?.headings || [];

  useEffect(() => {
    if (initialBody) return;
    let active = true;
    loadArticle(post.slug).then((article) => { if (active) setBody(article); })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [post.slug, initialBody]);
  const currentIndex = postsData.findIndex((item) => item.id === post.id);
  const prevPost = currentIndex > 0 ? postsData[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < postsData.length - 1 ? postsData[currentIndex + 1] : null;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; clearTimeout(shareTimer.current); };
  }, []);

  useEffect(() => {
    const container = articleRef.current;
    if (!container) return;
    let disposed = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const buttons = Array.from(container.querySelectorAll("pre")).map((pre) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy-btn";
      button.textContent = "复制代码";
      button.setAttribute("aria-label", "复制代码");
      button.setAttribute("aria-live", "polite");
      let timer: ReturnType<typeof setTimeout> | undefined;
      button.onclick = async () => {
        button.disabled = true;
        clearTimeout(timer);
        if (timer) timers.delete(timer);
        const success = await copyText(pre.querySelector("code")?.textContent || "");
        if (disposed) return;
        button.disabled = false;
        button.textContent = success ? "已复制" : "复制失败，请选中代码复制";
        timer = setTimeout(() => {
          button.textContent = "复制代码";
          timers.delete(timer!);
        }, 2500);
        timers.add(timer);
      };
      pre.appendChild(button);
      return button;
    });
    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
      buttons.forEach((button) => { button.onclick = null; button.remove(); });
    };
  }, [html]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const article = articleRef.current;
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const distance = rect.height - window.innerHeight;
      const progress = distance <= 0 ? (rect.bottom <= window.innerHeight ? 100 : 0) : (window.scrollY - top) / distance * 100;
      setReadingProgress(Math.max(0, Math.min(100, progress)));
      setShowBackToTop(window.scrollY > 300);
      const sections = Array.from(article.querySelectorAll<HTMLElement>("h1[id],h2[id],h3[id]"));
      const passed = sections.filter((section) => section.getBoundingClientRect().top <= 160);
      const active = passed[passed.length - 1] || sections[0];
      if (active) setActiveHeading(active.id);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    if (articleRef.current) observer.observe(articleRef.current);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [html]);

  const copyUrl = async () => {
    clearTimeout(shareTimer.current);
    const url = new URL(postHref(post), window.location.origin);
    const success = await copyText(url.href);
    if (!mounted.current) return;
    setCopyStatus(success ? "success" : "error");
    shareTimer.current = setTimeout(() => setCopyStatus("idle"), 2500);
  };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: scrollBehavior() });

  return (
    <div className="space-y-8 w-full mx-auto relative">
      <div aria-hidden="true" className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 z-50" style={{ width: `${readingProgress}%` }} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InternalLink to={{ tab: "blog" }} className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-300 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4" />返回文章列表
        </InternalLink>
        <button onClick={copyUrl} className="requires-js inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-300 hover:text-cyan-300">
          {copyStatus === "success" ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          分享本文
        </button>
      </div>
      <p className={copyStatus === "idle" ? "sr-only" : "fixed bottom-6 left-1/2 z-50 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl border border-cyan-400/30 bg-slate-900 px-4 py-3 text-sm text-cyan-200 shadow-xl"} role="status">
        {copyStatus === "success" ? "文章链接已复制" : copyStatus === "error" ? "复制失败，请从浏览器地址栏复制链接。" : ""}
      </p>
      <header className="space-y-4 border-b border-slate-800/80 pb-6">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-cyan-400" />{post.date}</span>
          {post.updated && <time dateTime={post.updated} className="text-slate-400">更新于 {post.updated}</time>}
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-indigo-400" />{post.readTime}</span>
          {post.tags.map((tag) => <span key={tag} className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-cyan-300">#{tag}</span>)}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">{post.title}</h1>
        <p className="border-l-2 border-cyan-500 pl-4 text-base leading-relaxed text-slate-400">{post.summary}</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_13rem] gap-8 items-start">
      {headings.length > 0 && <details open className="lg:order-2 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-200"><BookOpen className="mr-2 inline h-4 w-4 text-cyan-400" />文章目录</summary>
        <nav aria-label="文章目录" className="mt-3 flex flex-col items-start gap-2">
          {headings.map((heading) => <a href={`#${heading.id}`} key={heading.id} aria-current={activeHeading === heading.id ? "location" : undefined} className={`text-left text-sm hover:text-cyan-300 ${activeHeading === heading.id ? "text-cyan-300" : "text-slate-400"} ${heading.level === 3 ? "ml-4" : ""}`}
            onClick={(event) => {
              event.preventDefault();
              const target = document.getElementById(heading.id);
              target?.focus({ preventScroll: true });
              target?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
              const url = new URL(window.location.href);
              url.hash = heading.id;
              window.history.replaceState(null, "", url);
            }}>{heading.text}</a>)}
        </nav>
      </details>}
      <div className="min-w-0 lg:order-1">
        {body ? <article ref={articleRef} data-post-slug={post.slug} className="prose max-w-none text-base text-slate-300" dangerouslySetInnerHTML={{ __html: html }} />
          : loadError ? <div role="alert" className="rounded-xl border border-slate-700 p-6 text-slate-300">正文暂时没能加载。<button onClick={() => window.location.reload()} className="ml-2 text-cyan-300 underline">刷新重试</button></div>
          : <p role="status" className="py-12 text-slate-400">正在载入正文…</p>}
      </div>
      </div>
      <nav aria-label="相邻文章" className="grid grid-cols-1 gap-4 border-t border-slate-800 pt-8 sm:grid-cols-2">
        {prevPost ? <InternalLink to={{ tab: "post-detail", postSlug: prevPost.slug }} className="rounded-xl border border-slate-800 p-4 text-left hover:border-cyan-500/40">
          <span className="flex items-center gap-1 text-xs text-slate-400"><ArrowLeft className="h-3 w-3" />上一篇</span>
          <span className="mt-2 block text-sm text-slate-200">{prevPost.title}</span>
        </InternalLink> : <div className="hidden sm:block" />}
        {nextPost && <InternalLink to={{ tab: "post-detail", postSlug: nextPost.slug }} className="rounded-xl border border-slate-800 p-4 text-right hover:border-cyan-500/40 sm:col-start-2">
          <span className="flex items-center justify-end gap-1 text-xs text-slate-400">下一篇<ArrowRight className="h-3 w-3" /></span>
          <span className="mt-2 block text-sm text-slate-200">{nextPost.title}</span>
        </InternalLink>}
      </nav>
      <footer className="text-sm text-slate-500">感谢阅读 · 欢迎在 GitHub 仓库中交流讨论</footer>
      {showBackToTop && <button onClick={scrollToTop} aria-label="返回顶部" className="fixed bottom-6 right-6 z-40 rounded-full border border-cyan-500/30 bg-slate-900 p-3 text-cyan-400 shadow-lg">
        <ArrowUp className="h-4 w-4" />
      </button>}
    </div>
  );
};
