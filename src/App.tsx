import React, { useState, useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { SearchModal } from "./components/common/SearchModal";
import { DeepSeekWaveCanvas } from "./components/common/DeepSeekWaveCanvas";
import { Home } from "./pages/Home";
import { BlogList } from "./pages/BlogList";
import { PostDetail } from "./pages/PostDetail";
import { Projects } from "./pages/Projects";
import { About } from "./pages/About";
import { postsData } from "./data/posts";
import { useGitHubProjects } from "./hooks/useGitHubProjects";
import { Post, Project } from "./types/blog";

const getRouteFromHash = (): { tab: string; postSlug?: string } => {
  const hash = window.location.hash || "#/";
  if (hash.startsWith("#/post/")) {
    const slug = hash.slice(7);
    return { tab: "post-detail", postSlug: decodeURIComponent(slug) };
  }
  if (hash === "#/blog") return { tab: "blog" };
  if (hash === "#/projects") return { tab: "projects" };
  if (hash === "#/about") return { tab: "about" };
  return { tab: "home" };
};

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // 鍏ㄨ嚜鍔ㄥ疄鏃跺悓姝?GitHub 浠撳簱 (甯︽湰鍦版绉掔骇缂撳瓨)
  const { projects: autoProjects } = useGitHubProjects("democard");

  // 璺敱鍚屾锛氬鐞?Hash 鍙樺寲涓庢祻瑙堝櫒鍓嶈繘/鍚庨€€
  useEffect(() => {
    const syncRoute = () => {
      const route = getRouteFromHash();
      if (route.tab === "post-detail" && route.postSlug) {
        const found = postsData.find(
          (p) => p.slug === route.postSlug || p.id === route.postSlug
        );
        if (found) {
          setSelectedPost(found);
          setCurrentTab("post-detail");
        } else {
          setCurrentTab("blog");
          setSelectedPost(null);
          window.location.hash = "#/blog";
        }
      } else {
        setCurrentTab(route.tab);
        setSelectedPost(null);
      }
    };

    syncRoute();
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    setCurrentTab("post-detail");
    window.location.hash = `#/post/${post.slug || post.id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    setSelectedPost(null);
    window.location.hash = tab === "home" ? "#/" : `#/${tab}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-200 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* 鏋佺畝娣辩┖姘村ⅷ鍥捐吘娉㈢汗鐢诲竷 */}
      <DeepSeekWaveCanvas />

      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        {currentTab === "home" && (
          <Home
            posts={postsData}
            projects={autoProjects}
            onSelectPost={handleSelectPost}
            onNavigate={handleSelectTab}
            onOpenTerminal={() => {}}
          />
        )}

        {currentTab === "blog" && (
          <BlogList posts={postsData} onSelectPost={handleSelectPost} />
        )}

        {currentTab === "post-detail" && selectedPost && (
          <PostDetail
            post={selectedPost}
            onBack={() => handleSelectTab("blog")}
          />
        )}

        {currentTab === "projects" && (
          <Projects projects={autoProjects} />
        )}

        {currentTab === "about" && (
          <About />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posts={postsData}
        projects={autoProjects}
        onSelectPost={handleSelectPost}
        onSelectProject={() => {
          handleSelectTab("projects");
        }}
      />
    </div>
  );
};