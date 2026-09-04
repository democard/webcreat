import { useState, useEffect } from "react";
import { Project } from "../types/blog";
import { projectsData as fallbackProjects } from "../data/projects";

const CACHE_KEY = "democard_github_projects_cache_v2";
const CACHE_TTL = 30 * 60 * 1000; // 30 分钟缓存

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

// 从 localStorage 读取有效缓存
const getCachedProjects = (): Project[] | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
      // 检查缓存是否在有效期内
      if (Date.now() - (parsed.timestamp || 0) < CACHE_TTL) {
        return parsed.data;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
};

// 存入缓存
const setCachedProjects = (data: Project[]) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch (e) {
    // ignore
  }
};

// 辅助函数：从 README.md 文本中解析出最具价值的第一段简介
const extractSummaryFromReadme = (markdown: string): string | null => {
  if (!markdown) return null;
  const clean = markdown.replace(/<[^>]*>/g, "");
  const lines = clean.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  for (const line of lines) {
    if (
      line.startsWith("#") ||
      line.startsWith("[![") ||
      line.startsWith("[") ||
      line.startsWith("---") ||
      line.startsWith("```")
    ) {
      continue;
    }
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
  // 优先从本地缓存瞬时加载（0ms 无闪烁渲染）
  const [projects, setProjects] = useState<Project[]>(() => {
    const cached = getCachedProjects();
    return cached || fallbackProjects;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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

            let tags = r.language ? [r.language] : [];
            if (r.topics && r.topics.length > 0) {
              tags.push(...r.topics);
            }
            if (readmeContent) {
              tags = extractTagsFromReadme(readmeContent, tags);
            }
            if (tags.length === 0) tags = ["Engineering"];

            const finalDescription =
              readmeSummary ||
              r.description ||
              "正在持续构建与维护中的开源项目。";

            return {
              id: String(r.id),
              title: r.name,
              description: finalDescription,
              tags: tags.slice(0, 4),
              githubUrl: r.html_url,
              demoUrl: r.homepage || undefined,
              stars: r.stargazers_count,
              forks: r.forks_count,
              updatedAt: r.updated_at ? r.updated_at.split("T")[0] : undefined,
              featured: true,
            };
          });

          const mappedProjects = await Promise.all(repoPromises);
          if (isMounted && mappedProjects.length > 0) {
            setProjects(mappedProjects);
            setCachedProjects(mappedProjects);
          }
        }
      } catch (err) {
        console.warn("GitHub API fallback to cached/local data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReposWithReadme();

    return () => {
      isMounted = false;
    };
  }, [username]);

  return { projects, loading };
};