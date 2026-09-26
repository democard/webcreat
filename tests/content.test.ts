import { describe, expect, it } from "vitest";
import { estimateReadingTime, parsePost, validatePostIdentifiers } from "../scripts/content";
import { rankPosts, searchExcerpt } from "../src/lib/search";
import { postsData } from "../src/data/posts";

const fixture = `---\nslug: hello-world\ntitle: Hello\nsummary: A useful introduction\ndate: "2026-09-07"\ntags: [React, React]\ndraft: true\n---\n## A real article\n\nContent.`;
describe("Markdown publication contract", () => {
  it("loads frontmatter, normalizes tags and preserves drafts", () => {
    const post = parsePost(fixture, "hello-world.md");
    expect(post.tags).toEqual(["React"]);
    expect(post.draft).toBe(true);
    expect(post.content).toBe("## A real article\n\nContent.");
    expect(post.id).toBe("hello-world");
  });
  it.each([
    ["slug: hello-world", "slug: ../../outside", "slug"],
    ['date: "2026-09-07"', 'date: "2026-02-31"', "date"],
    ['date: "2026-09-07"', 'date: "2026-99-07"', "date"],
    ["tags: [React, React]", "tags: not-an-array", "tags"],
    ["draft: true", 'draft: "true"', "draft"],
  ])("rejects invalid publication metadata: %s", (from, to, field) => {
    expect(() => parsePost(fixture.replace(from, to), "invalid.md")).toThrow(field);
  });
  it("estimates mixed Chinese and English reading time", () => {
    expect(estimateReadingTime("中".repeat(350) + " word".repeat(200))).toBe(2);
    expect(estimateReadingTime("短文")).toBe(1);
  });
  it("allows an article to use its own slug as its legacy id", () => {
    expect(() => validatePostIdentifiers([
      { filename: "hello.md", id: "hello", slug: "hello" },
      { filename: "other.md", id: "legacy-other", slug: "other" },
    ])).not.toThrow();
  });
  it.each([
    ["duplicate ids", { id: "legacy-first", slug: "second" }, "legacy-first"],
    ["duplicate slugs", { id: "legacy-second", slug: "first" }, "first"],
    ["id matching another slug", { id: "first", slug: "second" }, "first"],
    ["slug matching another id", { id: "legacy-second", slug: "legacy-first" }, "legacy-first"],
  ])("rejects %s and identifies both source files", (_label, second, identifier) => {
    expect(() => validatePostIdentifiers([
      { filename: "first.md", id: "legacy-first", slug: "first" },
      { filename: "second.md", ...second },
    ])).toThrow(new RegExp(`second\\.md.*${identifier}.*first\\.md`));
  });
  it("checks draft identifiers together with published articles", () => {
    const draft = parsePost(fixture.replace("slug: hello-world", "slug: hello-world\nid: legacy-draft"), "draft.md");
    const published = parsePost(fixture.replace("slug: hello-world", "slug: published\nid: hello-world")
      .replace("draft: true", "draft: false"), "published.md");
    expect(() => validatePostIdentifiers([
      { filename: "draft.md", ...draft },
      { filename: "published.md", ...published },
    ])).toThrow(/published\.md.*hello-world.*draft\.md/);
  });
});

describe("weighted full-text search", () => {
  it("finds a body-only Chinese phrase and requires every query term", () => {
    const body = new Map([[postsData[0].slug, "这里讨论紫色海豚和事务一致性。"]]);
    expect(rankPosts(postsData, "紫色海豚 一致性", body)).toEqual([postsData[0]]);
    expect(rankPosts(postsData, "紫色海豚 不存在", body)).toEqual([]);
    expect(searchExcerpt(body.get(postsData[0].slug)!, "紫色海豚", "fallback")).toContain("紫色海豚");
  });
  it("ranks a title match above a body-only match", () => {
    const posts = [{ ...postsData[0], title: "Alpha" }, { ...postsData[1], title: "Needle" }];
    expect(rankPosts(posts, "needle", new Map([[posts[0].slug, "needle"]]))[0].slug).toBe(posts[1].slug);
  });
});
