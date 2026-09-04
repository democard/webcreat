import React, { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, Share2, Check, ArrowUp } from "lucide-react";
import { marked } from "marked";
import { Post } from "../types/blog";

interface PostDetailProps {
  post: Post;
  onBack: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const rendered = marked.parse(post.content);
    if (typeof rendered === "string") {
      setHtmlContent(rendered);
    } else {
      rendered.then((res) => setHtmlContent(res));
    }
  }, [post]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const copyUrl = () => {
    const url = `${window.location.origin}${window.location.pathname}#/post/${post.slug || post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-3xl mx-auto relative">
      {/* 顶部阅读进度条 */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 z-50 transition-all duration-75"
        style={{ width: `${readingProgress}%` }}
      />

      {/* 顶部返回与分享条 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-cyan-300 bg-slate-900/60 hover:bg-slate-800/80 transition-all border border-slate-800/80 hover:border-cyan-500/30"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>返回文章列表</span>
        </button>

        <button
          onClick={copyUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-all border border-slate-800/80 hover:border-cyan-500/30"
          title="复制文章直达链接"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? "已复制直达链接" : "分享本文"}</span>
        </button>
      </div>

      {/* 文章头部 */}
      <header className="space-y-4 pb-6 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            {post.date}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            {post.readTime}
          </span>
          <span>·</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {post.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px]"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight font-sans">
          {post.title}
        </h1>

        <div className="text-xs sm:text-sm text-slate-400 leading-relaxed italic border-l-2 border-cyan-500/80 pl-4 py-1 bg-cyan-950/10 rounded-r-lg">
          {post.summary}
        </div>
      </header>

      {/* 文章正文 */}
      <article
        className="prose max-w-none text-sm text-slate-300 leading-relaxed font-sans"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* 底部互动 */}
      <footer className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <span>// 感谢阅读 · 欢迎在 GitHub 仓库中讨论交流</span>
        <button
          onClick={copyUrl}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all border border-slate-800/80 hover:border-cyan-500/30"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? "链接已复制到剪贴板" : "分享此文直达链接"}</span>
        </button>
      </footer>

      {/* 浮动返回顶部按钮 */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 transition-all hover:-translate-y-1 backdrop-blur-xl"
          title="返回顶部"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};