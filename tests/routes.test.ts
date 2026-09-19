import { describe, expect, it } from "vitest";
import { parsePath, parseRoute, postHash, postHref, getRouteFromLocation, resolvePostRoute } from "../src/lib/routes";

describe("article URLs", () => {
  it("resolves physical article routes inside the GitHub Pages base", () => {
    expect(parsePath(postHref({ slug: "hello-world" }))).toEqual({ tab: "post-detail", postSlug: "hello-world" });
    expect(parsePath("/webcreat/missing/")).toEqual({ tab: "not-found" });
    expect(parsePath("/webcreat/posts/%/")).toEqual({ tab: "not-found" });
  });
  it("keeps legacy hash links and ignores normal article section fragments", () => {
    expect(getRouteFromLocation({ pathname: "/webcreat/", hash: "#/post/legacy" })).toEqual({ tab: "post-detail", postSlug: "legacy" });
    expect(getRouteFromLocation({ pathname: "/webcreat/posts/hello/", hash: "#article-section-2" })).toEqual({ tab: "post-detail", postSlug: "hello" });
  });
  it("maps a historical article id to its canonical, refresh-safe slug", () => {
    expect(resolvePostRoute(
      { tab: "post-detail", postSlug: "old-id" },
      [{ id: "old-id", slug: "canonical-slug" }],
    )).toEqual({ tab: "post-detail", postSlug: "canonical-slug" });
    expect(resolvePostRoute({ tab: "post-detail", postSlug: "missing" }, [])).toEqual({ tab: "post-detail", postSlug: "missing" });
  });
  it("round-trips Chinese, spaces, percent signs, and slashes", () => {
    const post = { id: "1", slug: "中文 / 100%" };
    expect(parseRoute(postHash(post))).toEqual({ tab: "post-detail", postSlug: post.slug });
  });
  it.each(["#/post/%", "#/post/%E0%A4%A", "#/post/"])("handles invalid article URLs without throwing: %s", (hash) => {
    expect(parseRoute(hash)).toEqual({ tab: "blog" });
  });
  it.each(["blog", "projects", "about"])("supports the %s page", (tab) => {
    expect(parseRoute(`#/${tab}`)).toEqual({ tab });
  });
});
