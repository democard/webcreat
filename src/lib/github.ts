import { Project } from "../types/blog";

export const CACHE_TTL = 30 * 60 * 1000;
export const cacheKey = (username: string) => `democard_github_projects_v3:${username.toLowerCase()}`;
export type ProjectSource = "live" | "cache" | "fallback";
interface Cache { data: Project[]; timestamp: number }
interface GitHubRepo {
  id: number; name: string; description: string | null; homepage: string | null;
  stargazers_count: number; forks_count: number; language: string | null;
  topics?: string[]; updated_at: string; fork: boolean; default_branch: string;
}

export function safeWebUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const project = value as Project;
  return typeof project.id === "string" && typeof project.title === "string"
    && typeof project.description === "string" && Array.isArray(project.tags)
    && project.tags.every((tag) => typeof tag === "string")
    && (project.githubUrl === undefined || !!safeWebUrl(project.githubUrl))
    && (project.demoUrl === undefined || !!safeWebUrl(project.demoUrl))
    && (project.updatedAt === undefined || typeof project.updatedAt === "string")
    && [project.stars, project.forks].every((count) => count === undefined || (typeof count === "number" && Number.isFinite(count)));
}

export function readProjectsCache(username: string): Cache | null {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey(username)) || "null");
    if (!cached || !Array.isArray(cached.data) || !cached.data.every(isProject)
      || !Number.isFinite(cached.timestamp) || cached.timestamp <= 0 || cached.timestamp > Date.now()) return null;
    return cached;
  } catch { return null; }
}

export function writeProjectsCache(username: string, data: Project[]) {
  try { localStorage.setItem(cacheKey(username), JSON.stringify({ timestamp: Date.now(), data })); }
  catch { /* Storage can be unavailable; the fetched projects still render. */ }
}

export function extractSummary(markdown: string): string | null {
  const clean = markdown.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, "").replace(/<[^>]*>/g, "");
  for (const line of clean.split("\n").map((line) => line.trim())) {
    if (!line || /^(#|!|\[|---|\||>)/.test(line)) continue;
    const text = line.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*`_]/g, "").trim();
    if (text.length > 15) return text.length > 240 ? `${text.slice(0, 237)}…` : text;
  }
  return null;
}

const technologies: [RegExp, string][] = [
  [/jetpack compose/i, "Jetpack Compose"], [/pyside6|pyqt/i, "PySide6"], [/\bpython\b/i, "Python"],
  [/\bkotlin\b/i, "Kotlin"], [/\bandroid\b/i, "Android"], [/\breact\b/i, "React"],
  [/\btypescript\b/i, "TypeScript"], [/tailwind/i, "TailwindCSS"], [/tronclass|厦大/i, "TronClass"],
];

async function withResponse<T>(url: string, signal: AbortSignal, read: (response: Response) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true });
  if (signal.aborted) controller.abort();
  const timeout = setTimeout(abort, 8000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    return await read(response);
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", abort);
  }
}

export async function fetchProjects(username: string, signal: AbortSignal, onList?: (projects: Project[]) => void): Promise<Project[]> {
  const owner = encodeURIComponent(username);
  const result: unknown = await withResponse(`https://api.github.com/users/${owner}/repos?sort=updated&per_page=30`, signal, (response) => response.json());
  if (!Array.isArray(result)) throw new Error("Unexpected repository response");
  const repos = result.filter((repo): repo is GitHubRepo => repo && typeof repo.id === "number"
    && typeof repo.name === "string" && typeof repo.fork === "boolean" && !repo.fork
    && typeof repo.default_branch === "string");
  if (result.length && !repos.length && result.some((repo) => !repo?.fork)) throw new Error("Invalid repository data");
  const projects: Project[] = repos.map((repo) => ({
    id: String(repo.id), title: repo.name,
    description: typeof repo.description === "string" && repo.description || "正在持续构建与维护中的开源项目。",
    tags: Array.from(new Set([repo.language, ...(Array.isArray(repo.topics) ? repo.topics : [])].filter((tag): tag is string => typeof tag === "string" && !!tag))).slice(0, 4),
    githubUrl: `https://github.com/${owner}/${encodeURIComponent(repo.name)}`,
    demoUrl: safeWebUrl(repo.homepage),
    stars: Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : 0,
    forks: Number.isFinite(repo.forks_count) ? repo.forks_count : 0,
    updatedAt: typeof repo.updated_at === "string" ? repo.updated_at.split("T")[0] : undefined,
    featured: true,
  }));
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  onList?.(projects);

  // Publish basic repository data immediately, then enrich it with at most four README requests at once.
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(4, repos.length) }, async () => {
    while (next < repos.length && !signal.aborted) {
      const index = next++;
      const repo = repos[index];
      try {
        const readme = await withResponse(`https://raw.githubusercontent.com/${owner}/${encodeURIComponent(repo.name)}/${encodeURIComponent(repo.default_branch)}/README.md`, signal, (response) => response.text());
        const tags = new Set(projects[index].tags);
        technologies.forEach(([pattern, tag]) => { if (pattern.test(readme)) tags.add(tag); });
        projects[index] = { ...projects[index], description: extractSummary(readme) || projects[index].description, tags: [...tags].slice(0, 4) };
      } catch { /* Missing README or a timeout must not discard the repository. */ }
      if (!projects[index].tags.length) projects[index] = { ...projects[index], tags: ["Engineering"] };
    }
  }));
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  return projects;
}
