import { useState, useEffect } from "react";
import { Project } from "../types/blog";
import { projectsData as fallbackProjects } from "../data/projects";

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  updated_at: string;
  fork: boolean;
}

// 辅助函数：从 README.md 文本中解析出最具价值的第一段简介
const extractSummaryFromReadme = (markdown: string): string | null => {
  if (!markdown) return null;
  // 移除 html 标签如 <div align="center">
  const clean = markdown.replace(/<[^>]*>/g, "");
  const lines = clean.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  for (const line of lines) {
    // 忽略 badge 行、标题行、链接导航行
    if (line.startsWith("#") || line.startsWith("[![") || line.startsWith("[") || line.startsWith("---") || line.startsWith("```")) {
      continue;
    }
    // 提取加粗的核心简介或普通段落
    const text = line.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").trim();
    if (text.length > 15) {
      return text;
    }
  }
  return null;
};

// 辅助函数：从 README.md 中自动提取额外的精细技术标签
const extractTagsFromReadme = (markdown: string, baseTags: string[]): string[] => {
  const allTags = new Set(baseTags);
  const lower = markdown.toLowerCase();
  
  if (lower.includes("jetpack compose")) allTags.add("Jetpack Compose");
  if (lower.includes("pyside6") || lower.includes("pyqt")) allTags.add("PySide6");
  if (lower.includes("python")) allTags.add("Python");
  if (lower.includes("kotlin")) allTags.add("Kotlin");
  if (lower.includes("android")) allTags.add("Android");
  if (lower.includes("react")) allTags.add("React");
  if (lower.includes("typescript")) allTags.add("TypeScript");
  if (lower.includes("tailwindcss")) allTags.add("TailwindCSS");
  if (lower.includes("tronclass") || lower.includes("厦大")) allTags.add("TronClass");

  return Array.from(allTags);
};

export const useGitHubProjects = (username = "democard") => {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReposWithReadme = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`GitHub API returned ${response.status}`);
        }

        const repos: GitHubRepo[] = await response.json();

        if (Array.isArray(repos) && repos.length > 0) {
          const originalRepos = repos.filter((r) => !r.fork);

          // 并行抓取每个仓库的真实 README.md
          const repoPromises = originalRepos.map(async (r) => {
            let readmeSummary: string | null = null;
            let readmeContent = "";

            try {
              const rawRes = await fetch(
                `https://raw.githubusercontent.com/${username}/${r.name}/main/README.md`
              );
              if (rawRes.ok) {
                readmeContent = await rawRes.text();
                readmeSummary = extractSummaryFromReadme(readmeContent);
              } else {
                const masterRes = await fetch(
                  `https://raw.githubusercontent.com/${username}/${r.name}/master/README.md`
                );
                if (masterRes.ok) {
                  readmeContent = await masterRes.text();
                  readmeSummary = extractSummaryFromReadme(readmeContent);
                }
              }
            } catch (e) {
              // Ignore readme fetch error
            }

            // 整合标签
            let tags = r.language ? [r.language] : [];
            if (r.topics && r.topics.length > 0) {
              tags.push(...r.topics);
            }
            if (readmeContent) {
              tags = extractTagsFromReadme(readmeContent, tags);
            }
            if (tags.length === 0) tags = ["Engineering"];

            // 优先使用从 README 解析出的高质量详细介绍，其次 fallback 到仓库 description
            const finalDescription =
              readmeSummary ||
              r.description ||
              "正在持续构建与维护中的开源项目。";

            return {
              id: String(r.id),
              title: r.name,
              description: finalDescription,
              tags: tags.slice(0, 4), // 优雅保持最多 4 个高价值标签
              githubUrl: r.html_url,
              demoUrl: r.homepage || undefined,
              stars: r.stargazers_count,
              forks: r.forks_count,
              updatedAt: r.updated_at ? r.updated_at.split("T")[0] : undefined,
              featured: true,
            };
          });

          const mappedProjects = await Promise.all(repoPromises);
          if (mappedProjects.length > 0) {
            setProjects(mappedProjects);
          }
        }
      } catch (err) {
        console.warn("GitHub API fallback to local data:", err);
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchReposWithReadme();
  }, [username]);

  return { projects, loading };
};