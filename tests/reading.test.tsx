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
    render(<PostDetail post={post} initialBody={body} onBack={vi.fn()} onSelectPost={vi.fn()} />);
    const next = screen.getByRole("link", { name: /下一篇/ });
    expect(next.getAttribute("href")).toBe(postHref(postsData[1]));
    const toc = screen.getByRole("navigation", { name: "文章目录" });
    fireEvent.click(toc.querySelector("a")!);
    expect(document.activeElement?.id).toBe("article-section-1");
    expect(window.location.hash).toBe("#article-section-1");
    fireEvent.click(next);
    expect(window.location.pathname).toBe(postHref(postsData[1]));
  });
  it("reports clipboard failures without falsely reporting success", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    const post = postsData[0];
    const body = { slug: post.slug, ...renderMarkdown("\x60\x60\x60js\nconst x = 1;\n\x60\x60\x60") };
    render(<PostDetail post={post} initialBody={body} onBack={vi.fn()} onSelectPost={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "分享本文" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("复制失败"));
    fireEvent.click(screen.getByRole("button", { name: "复制代码" }));
    await screen.findByText("复制失败，请选中代码复制");
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith("const x = 1;");
  });
  it("only reports success after the clipboard write resolves", async () => {
    let resolve!: () => void;
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn(() => new Promise<void>((done) => { resolve = done; })) } });
    render(<PostDetail post={postsData[0]} initialBody={{ slug: postsData[0].slug, html: "<p>正文</p>", headings: [] }} onBack={vi.fn()} onSelectPost={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "分享本文" }));
    expect(screen.getByRole("status").textContent).toBe("");
    resolve();
    await screen.findByText("文章链接已复制");
  });
});
