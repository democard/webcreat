import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App";
import { postsData } from "../src/data/posts";

vi.mock("../src/components/common/DeepSeekWaveCanvas", () => ({ DeepSeekWaveCanvas: () => null }));
vi.mock("../src/components/home/HeroEmblemCanvas", () => ({ HeroEmblemCanvas: () => null }));
vi.mock("../src/hooks/useGitHubProjects", () => ({ useGitHubProjects: () => ({
  projects: [{ id: "repo", title: "Example repository", description: "A TypeScript project", tags: ["TypeScript"], githubUrl: "https://github.com/democard/webcreat" }],
  source: "live", loading: false,
}) }));

describe("global search and route integration", () => {
  it("opens from Ctrl+K, closes from Meta+K, restores focus, and clears the next search", async () => {
    const user = userEvent.setup();
    render(<App />);
    const trigger = screen.getByRole("button", { name: "全局搜索" });
    trigger.focus();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const input = screen.getByRole("searchbox");
    expect(document.activeElement).toBe(input);
    const lastResult = screen.getByRole("button", { name: /Example repository/ });
    lastResult.focus();
    fireEvent.keyDown(lastResult, { key: "Tab" });
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(lastResult);
    input.focus();
    expect(document.body.style.overflow).toBe("hidden");
    await user.type(input, "no-such-content");
    expect(screen.getByText(/未检索到与/)).toBeTruthy();
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
    await user.click(trigger);
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("chooses the last result with ArrowUp and opens the selected project", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    render(<App />);
    await user.click(screen.getByRole("button", { name: "全局搜索" }));
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "ArrowUp" });
    expect(document.activeElement?.textContent).toContain("Example repository");
    await user.keyboard("{Enter}");
    expect(open).toHaveBeenCalledWith("https://github.com/democard/webcreat", "_blank", "noopener,noreferrer");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("opens an article from Enter and connects the next-article callback", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "全局搜索" }));
    await user.type(screen.getByRole("searchbox"), postsData[0].title);
    await user.keyboard("{Enter}");
    await screen.findByRole("link", { name: /下一篇/ });
    expect(window.location.pathname).toContain(postsData[0].slug);
    expect(document.activeElement).toBe(document.getElementById("main-content"));
    await user.click(screen.getByRole("link", { name: /下一篇/ }));
    await waitFor(() => expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(postsData[1].title));
    expect(window.location.pathname).toContain(postsData[1].slug);
  });
  it("renders a safe destination for malformed and missing article URLs", () => {
    window.history.replaceState(null, "", "#/post/%E0%A4%A");
    const view = render(<App />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("在实践中思考");
    view.unmount();
    window.history.replaceState(null, "", "#/post/missing");
    render(<App />);
    expect(screen.getByText(/这个页面暂未找到/)).toBeTruthy();
  });
});
