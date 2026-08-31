import React, { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, Share2, Check, Bookmark, Tag } from "lucide-react";
import { marked } from "marked";
import { Post } from "../types/blog";

interface PostDetailProps {
  post: Post;
  onBack: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const rendered = marked.parse(post.content);
    if (typeof rendered === "string") {
      setHtmlContent(rendered);
    } else {
      rendered.then((res) => setHtmlContent(res));
    }
  }, [post]);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>返回文章列表</span>
        </button>
      </div>

      {/* Article Header */}
      <div className="space-y-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {post.date}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {post.readTime}
          </span>
          <span>·</span>
          <div className="flex items-center gap-1">
            {post.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-medium">
                #{t}
              </span>
            ))}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
          {post.title}
        </h1>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic border-l-2 border-cyan-500 pl-3">
          {post.summary}
        </p>
      </div>

      {/* Article Markdown Body */}
      <article
        className="prose prose-zinc dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Bottom Share & Navigation */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
        <span>感谢阅读！欢迎交流讨论。</span>
        <button
          onClick={copyUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors border border-zinc-200 dark:border-zinc-800"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? "链接已复制" : "分享本文"}</span>
        </button>
      </div>
    </div>
  );
};