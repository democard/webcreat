import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlogList } from "../src/pages/BlogList";
import { postsData } from "../src/data/posts";
import { navigate, routeHref } from "../src/lib/routes";

describe("blog filter navigation", () => {
  it("resets active filters when navigating to the unfiltered blog on the same page", () => {
    window.history.replaceState(null, "", `${routeHref({ tab: "blog" })}?tag=Kotlin&q=assistant`);
    render(<BlogList posts={postsData} />);
    expect(screen.getByRole("button", { name: "Kotlin", exact: true }).getAttribute("aria-pressed")).toBe("true");
    act(() => navigate({ tab: "blog" }));
    expect(window.location.search).toBe("");
    expect(screen.getByRole("button", { name: "全部文章" }).getAttribute("aria-pressed")).toBe("true");
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(postsData.length);
  });

  it("still restores saved filters on history navigation", () => {
    window.history.replaceState(null, "", routeHref({ tab: "blog" }));
    render(<BlogList posts={postsData} />);
    window.history.replaceState(null, "", `${routeHref({ tab: "blog" })}?tag=Kotlin`);
    fireEvent.popState(window);
    expect(screen.getByRole("button", { name: "Kotlin", exact: true }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
  });
});
