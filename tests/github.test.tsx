import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { cacheKey, CACHE_TTL, extractSummary, fetchProjects, readProjectsCache, safeWebUrl, writeProjectsCache } from "../src/lib/github";
import { useGitHubProjects } from "../src/hooks/useGitHubProjects";

const projects = [{ id: "1", title: "Cached project", description: "Cached description", tags: ["TypeScript"] }];
const repo = (id: number) => ({ id, name: `repo-${id}`, fork: false, default_branch: "release/docs", description: "Repository description", language: "TypeScript", topics: [], homepage: "javascript:alert(1)", stargazers_count: 1, forks_count: 0, updated_at: "2026-09-07T12:00:00Z" });

describe("GitHub cache and fetching", () => {
  it("serves a fresh user-specific cache without making requests", async () => {
    writeProjectsCache("alice", projects);
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const { result } = renderHook(() => useGitHubProjects("alice"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toEqual(projects);
    expect(result.current.source).toBe("cache");
    expect(fetch).not.toHaveBeenCalled();
    expect(readProjectsCache("bob")).toBeNull();
  });
  it("preserves stale data when a refresh fails", async () => {
    localStorage.setItem(cacheKey("alice"), JSON.stringify({ timestamp: Date.now() - CACHE_TTL - 1, data: projects }));
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { result } = renderHook(() => useGitHubProjects("alice"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toEqual(projects);
    expect(result.current.source).toBe("cache");
  });
  it("rejects corrupt cache entries and invalid URLs", () => {
    localStorage.setItem(cacheKey("alice"), JSON.stringify({ timestamp: Date.now(), data: [{ ...projects[0], tags: "wrong" }] }));
    expect(readProjectsCache("alice")).toBeNull();
    localStorage.setItem(cacheKey("alice"), "{broken-json");
    expect(readProjectsCache("alice")).toBeNull();
    expect(safeWebUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeWebUrl("https://example.com")).toBe("https://example.com/");
  });
  it("caches a valid empty account instead of repeatedly refetching", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetch);
    const first = renderHook(() => useGitHubProjects("empty"));
    await waitFor(() => expect(readProjectsCache("empty")?.data).toEqual([]));
    first.unmount();
    renderHook(() => useGitHubProjects("empty"));
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("publishes basic data early, uses the default branch, and limits README concurrency", async () => {
    let active = 0;
    let maxActive = 0;
    let readmesFinished = 0;
    const fetch = vi.fn(async (url: string) => {
      if (url.includes("api.github.com")) return { ok: true, json: async () => Array.from({ length: 7 }, (_, index) => repo(index)) };
      active++;
      maxActive = Math.max(active, maxActive);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      readmesFinished++;
      return { ok: true, text: async () => "# Title\n\nThis repository contains a useful React project." };
    });
    vi.stubGlobal("fetch", fetch);
    const onList = vi.fn(() => expect(readmesFinished).toBe(0));
    const result = await fetchProjects("alice", new AbortController().signal, onList);
    expect(onList).toHaveBeenCalledTimes(1);
    expect(maxActive).toBe(4);
    expect(result).toHaveLength(7);
    expect(result[0].demoUrl).toBeUndefined();
    expect(result[0].tags).toContain("React");
    expect(fetch.mock.calls.filter(([url]) => url.includes("raw.githubusercontent.com")).every(([url]) => url.includes("release%2Fdocs/README.md"))).toBe(true);
  });
  it("aborts in-flight requests on unmount", async () => {
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal("fetch", vi.fn((_url, options) => new Promise((_resolve, reject) => {
      requestSignal = options.signal;
      options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    })));
    const { unmount } = renderHook(() => useGitHubProjects("alice"));
    expect(requestSignal?.aborted).toBe(false);
    unmount();
    expect(requestSignal?.aborted).toBe(true);
  });
  it("skips code fences when extracting README summaries", () => {
    expect(extractSummary("# Title\n```sh\nthis should not appear as a description\n```\nA useful description for readers.")).toBe("A useful description for readers.");
  });
});
