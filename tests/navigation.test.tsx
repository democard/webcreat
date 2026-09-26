import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { PostDetail } from "../src/pages/PostDetail";
import { postsData } from "../src/data/posts";
import { loadArticle } from "../src/lib/content";
import { postHref, routeHref } from "../src/lib/routes";
import { ArticleBody } from "../src/types/blog";

vi.mock("../src/components/common/DeepSeekWaveCanvas", () => ({ DeepSeekWaveCanvas: () => null }));
vi.mock("../src/components/home/HeroEmblemCanvas", () => ({ HeroEmblemCanvas: () => null }));
vi.mock("../src/hooks/useGitHubProjects", () => ({ useGitHubProjects: () => ({
  projects: [], source: "fallback", loading: false, refresh: vi.fn(),
}) }));
vi.mock("../src/lib/content", () => ({ loadArticle: vi.fn() }));

const post = postsData[0];
const body: ArticleBody = {
  slug: post.slug,
  html: '<h2 id="article-section-1" tabindex="-1">第一节</h2><h2 id="article-section-2" tabindex="-1">第二节</h2>',
  headings: [
    { id: "article-section-1", text: "第一节", level: 2 },
    { id: "article-section-2", text: "第二节", level: 2 },
  ],
};

describe("article fragment navigation", () => {
  it.each(["hashchange", "popstate"])("leaves native same-page fragment scrolling intact on %s", (eventType) => {
    window.history.replaceState(null, "", postHref(post));
    render(<App initialArticle={body} ArticleComponent={PostDetail} />);
    const heading = document.getElementById("article-section-2")!;
    heading.focus();
    vi.mocked(window.scrollTo).mockClear();
    window.history.replaceState(null, "", `${postHref(post)}#article-section-2`);

    fireEvent(window, new Event(eventType));

    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(heading);
  });

  it("restores an article fragment after a history navigation loads the body", async () => {
    let resolveBody!: (article: ArticleBody) => void;
    vi.mocked(loadArticle).mockReturnValue(new Promise((resolve) => { resolveBody = resolve; }));
    window.history.replaceState(null, "", routeHref({ tab: "about" }));
    render(<App ArticleComponent={PostDetail} />);
    vi.mocked(HTMLElement.prototype.scrollIntoView).mockClear();

    window.history.pushState(null, "", `${postHref(post)}#article-section-2`);
    fireEvent.popState(window);
    expect(screen.getByText("正在载入正文…").getAttribute("role")).toBe("status");
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
    await act(async () => { resolveBody(body); });

    await waitFor(() => expect(document.activeElement?.id).toBe("article-section-2"));
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "instant", block: "start" });
  });

  it("ignores malformed article fragments while loading the body", async () => {
    vi.mocked(loadArticle).mockResolvedValue(body);
    window.history.replaceState(null, "", `${postHref(post)}#%E0%A4%A`);
    render(<App ArticleComponent={PostDetail} />);
    await screen.findByRole("heading", { name: "第二节" });
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
