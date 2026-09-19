import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { SearchModal } from "./components/common/SearchModal";
import { DeepSeekWaveCanvas } from "./components/common/DeepSeekWaveCanvas";
import { InternalLink } from "./components/common/InternalLink";
import { Home } from "./pages/Home";
import { BlogList } from "./pages/BlogList";
import { Projects } from "./pages/Projects";
import { About } from "./pages/About";
import { postsData } from "./data/posts";
import { useGitHubProjects } from "./hooks/useGitHubProjects";
import { getRouteFromLocation, navigate, resolvePostRoute, Route, routeHref } from "./lib/routes";
import { updateMetadata } from "./lib/metadata";
import { ArticleBody, Post, Project } from "./types/blog";
import type { PostDetailProps } from "./pages/PostDetail";

const LazyPostDetail = lazy(() => import("./pages/PostDetail").then((module) => ({ default: module.PostDetail })));
interface AppProps {
  initialRoute?: Route;
  initialArticle?: ArticleBody;
  ArticleComponent?: React.ComponentType<PostDetailProps>;
}

export const App: React.FC<AppProps> = ({ initialRoute, initialArticle, ArticleComponent }) => {
  const [route, setRoute] = useState(() => resolvePostRoute(initialRoute || getRouteFromLocation(window.location), postsData));
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { projects, loading, source, refresh } = useGitHubProjects("democard");
  const selectedPost = route.tab === "post-detail"
    ? postsData.find((post) => post.slug === route.postSlug || post.id === route.postSlug) : undefined;
  const currentTab = route.tab === "post-detail" && !selectedPost ? "not-found" : route.tab;
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const Article = ArticleComponent || LazyPostDetail;

  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
    return () => { delete document.documentElement.dataset.hydrated; };
  }, []);

  useEffect(() => {
    if (window.location.hash.startsWith("#/")) window.history.replaceState(null, "", routeHref(route));
    const syncRoute = () => {
      const next = resolvePostRoute(getRouteFromLocation(window.location), postsData);
      if (window.location.hash.startsWith("#/")) window.history.replaceState(null, "", routeHref(next));
      setRoute(next);
      setIsSearchOpen(false);
      window.scrollTo({ top: 0, behavior: "instant" });
      document.getElementById("main-content")?.focus({ preventScroll: true });
    };
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("app:navigate", syncRoute);
    return () => {
      window.removeEventListener("hashchange", syncRoute);
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("app:navigate", syncRoute);
    };
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!event.isComposing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!event.repeat) setIsSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  useEffect(() => { updateMetadata(route, selectedPost); }, [route, selectedPost]);

  const handleSelectPost = (post: Post) => navigate({ tab: "post-detail", postSlug: post.slug });
  const handleSelectProject = (project: Project) => {
    if (project.githubUrl) window.open(project.githubUrl, "_blank", "noopener,noreferrer");
    else navigate({ tab: "projects" });
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-200 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      <a href="#main-content" className="skip-link" onClick={(event) => { event.preventDefault(); document.getElementById("main-content")?.focus(); }}>跳到正文</a>
      <DeepSeekWaveCanvas />
      <Navbar currentTab={currentTab} onOpenSearch={() => setIsSearchOpen(true)} />
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        {currentTab === "home" && <Home posts={postsData} projects={projects} />}
        {currentTab === "blog" && <BlogList posts={postsData} />}
        {currentTab === "post-detail" && selectedPost && <Suspense fallback={<p role="status">正在载入文章…</p>}>
          <Article key={selectedPost.id} post={selectedPost} initialBody={initialArticle?.slug === selectedPost.slug ? initialArticle : undefined} />
        </Suspense>}
        {currentTab === "projects" && <Projects projects={projects} loading={loading} source={source} onRefresh={refresh} />}
        {currentTab === "about" && <About />}
        {currentTab === "not-found" && <section className="mx-auto max-w-xl space-y-5 py-20">
          <p className="font-mono text-sm text-cyan-400">404 / PAGE NOT FOUND</p>
          <h1 className="text-3xl font-bold text-white">这个页面暂未找到</h1>
          <p className="text-slate-400">链接可能有误，或内容已经移动。可以从文章列表继续阅读。</p>
          <InternalLink to={{ tab: "blog" }} className="inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">浏览全部文章</InternalLink>
        </section>}
      </main>
      <Footer />
      {isSearchOpen && <SearchModal onClose={closeSearch} posts={postsData} projects={projects} onSelectPost={handleSelectPost} onSelectProject={handleSelectProject} />}
    </div>
  );
};
