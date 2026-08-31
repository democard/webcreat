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

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // 全自动实时同步 GitHub 仓库
  const { projects: autoProjects, loading: projectsLoading } = useGitHubProjects("democard");

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
  };

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    setSelectedPost(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-200 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* 极简深空水墨图腾波纹画布 */}
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
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
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
            onBack={() => setCurrentTab("blog")}
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
          setCurrentTab("projects");
        }}
      />
    </div>
  );
};