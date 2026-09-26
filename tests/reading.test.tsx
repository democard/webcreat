import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PostDetail } from "../src/pages/PostDetail";
import { postsData } from "../src/data/posts";
import { renderMarkdown } from "../src/lib/markdown";
import { postHref } from "../src/lib/routes";
import { loadArticle } from "../src/lib/content";

describe("reading interactions", () => {
  it("offers native next-article and section links", async () => {
    const post = postsData[0];
    const body = await loadArticle(post.slug);
    render(<PostDetail post={post} initialBody={body} />);
    const next = screen.getByRole("link", { name: /下一篇/ });
    expect(next.getAttribute("href")).toBe(postHref(postsData[1]));
    const toc = screen.getByRole("navigation", { name: "文章目录" });
    fireEvent.click(toc.querySelector("a")!);
    expect(document.activeElement?.id).toBe("article-section-1");
    expect(window.location.hash).toBe("#article-section-1");
    fireEvent.click(next);
    expect(window.location.pathname).toBe(postHref(postsData[1]));
  });
  it.each([
    ["Ctrl", { ctrlKey: true }],
    ["Cmd", { metaKey: true }],
    ["Shift", { shiftKey: true }],
    ["Alt", { altKey: true }],
    ["middle button", { button: 1 }],
    ["right button", { button: 2 }],
  ])("preserves native section-link behavior for %s clicks", (_name, options) => {
    const post = postsData[0];
    render(<PostDetail post={post} initialBody={{ slug: post.slug, ...renderMarkdown("## 第一节") }} />);
    const link = screen.getByRole("link", { name: "第一节" });
    const replace = vi.spyOn(window.history, "replaceState");
    const observeDefault = vi.fn((event: MouseEvent) => {
      const prevented = event.defaultPrevented;
      // Observe React's handler, then suppress jsdom's asynchronous native navigation.
      event.preventDefault();
      return prevented;
    });
    document.addEventListener("click", observeDefault, { once: true });

    fireEvent.click(link, options);

    expect(observeDefault).toHaveReturnedWith(false);
    expect(replace).not.toHaveBeenCalled();
  });
  it("round-trips custom heading IDs through section links and a remounted article", async () => {
    const post = postsData[0];
    const id = "自定义章节 a%20b";
    const body = {
      slug: post.slug,
      html: `<h2 id="${id}" tabindex="-1">自定义章节</h2>`,
      headings: [{ id, text: "自定义章节", level: 2 }],
    };
    const view = render(<PostDetail post={post} initialBody={body} />);
    const link = screen.getByRole("link", { name: "自定义章节" });
    expect(link.getAttribute("href")).toBe(`#${encodeURIComponent(id)}`);
    fireEvent.click(link);
    expect(window.location.hash).toBe(`#${encodeURIComponent(id)}`);
    expect(document.activeElement?.id).toBe(id);

    view.unmount();
    render(<PostDetail post={post} initialBody={body} />);
    await waitFor(() => expect(document.activeElement?.id).toBe(id));
  });
  it("restores a legacy fragment containing a literal percent sign", async () => {
    const post = postsData[0];
    window.history.replaceState(null, "", `${postHref(post)}#chapter%`);
    render(<PostDetail post={post} initialBody={{
      slug: post.slug,
      html: '<h2 id="chapter%" tabindex="-1">百分比章节</h2>',
      headings: [{ id: "chapter%", text: "百分比章节", level: 2 }],
    }} />);
    await waitFor(() => expect(document.activeElement?.id).toBe("chapter%"));
  });
  it("reports clipboard failures without falsely reporting success", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    const post = postsData[0];
    const body = { slug: post.slug, ...renderMarkdown("\x60\x60\x60js\nconst x = 1;\n\x60\x60\x60") };
    render(<PostDetail post={post} initialBody={body} />);
    fireEvent.click(screen.getByRole("button", { name: "分享本文" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("复制失败"));
    fireEvent.click(screen.getByRole("button", { name: "复制代码" }));
    await screen.findByText("复制失败，请选中代码复制");
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("const x = 1;");
  });
  it("only reports success after the clipboard write resolves", async () => {
    let resolve!: () => void;
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn(() => new Promise<void>((done) => { resolve = done; })) } });
    render(<PostDetail post={postsData[0]} initialBody={{ slug: postsData[0].slug, html: "<p>正文</p>", headings: [] }} />);
    fireEvent.click(screen.getByRole("button", { name: "分享本文" }));
    expect(screen.getByRole("status").textContent).toBe("");
    resolve();
    await screen.findByText("文章链接已复制");
  });
});
