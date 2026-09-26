import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../src/lib/markdown";

describe("article rendering", () => {
  it("removes scripts, executable URLs, event handlers, and embedded controls", () => {
    const { html } = renderMarkdown('<script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">link</a><button>fake copy</button>');
    expect(html).not.toMatch(/<script|onerror|javascript:|<button/);
    expect(html).toContain("link");
  });
  it("creates unique section targets for duplicate and formatted headings", () => {
    const { html, headings } = renderMarkdown("## **重复标题**\n\n## 重复标题\n\n### 子标题");
    expect(headings.map((heading) => heading.id)).toEqual(["article-section-1", "article-section-2", "article-section-3"]);
    expect(headings[0].text).toBe("重复标题");
    expect(html).toContain('id="article-section-3"');
  });
  it("keeps section targets distinct from ids already present in the article", () => {
    const { html, headings } = renderMarkdown('<div id="article-section-1">Preface</div>\n\n## First\n\n## Second');
    const template = document.createElement("template");
    template.innerHTML = html;
    expect(headings.map((heading) => heading.id)).toEqual(["article-section-2", "article-section-3"]);
    for (const heading of headings) {
      const matches = template.content.querySelectorAll(`[id="${heading.id}"]`);
      expect(matches).toHaveLength(1);
      expect(matches[0].tagName).toBe("H2");
    }
  });
  it("preserves explicit heading targets and avoids them when numbering other headings", () => {
    const { html, headings } = renderMarkdown('## First\n\n[Introduction](#article-section-1)\n\n'
      + '<h2 id="article-section-1">Introduction</h2>');
    expect(headings.map((heading) => heading.id)).toEqual(["article-section-2", "article-section-1"]);
    const template = document.createElement("template");
    template.innerHTML = html;
    expect(template.content.querySelector('h2[id="article-section-1"]')?.textContent).toBe("Introduction");
  });
  it("retains the first explicit heading anchor when later headings reuse it", () => {
    const { html, headings } = renderMarkdown('<h2 id="intro">First</h2>\n\n<h2 id="intro">Second</h2>');
    expect(headings.map((heading) => heading.id)).toEqual(["intro", "article-section-2"]);
    const template = document.createElement("template");
    template.innerHTML = html;
    expect(template.content.querySelectorAll('[id="intro"]')).toHaveLength(1);
  });
  it.each(["root", "main-content", "page-structured-data"])(
    "keeps heading targets unique when the page shell already owns %s", (id) => {
      const { html, headings } = renderMarkdown(`<h2 id="${id}">Article section</h2>`);
      const page = document.implementation.createHTMLDocument();
      page.head.innerHTML = '<script id="page-structured-data" type="application/ld+json">{}</script>';
      page.body.innerHTML = '<div id="root"><main id="main-content"><article></article></main></div>';
      const article = page.querySelector("article")!;
      article.innerHTML = html;
      const heading = article.querySelector("h2");
      expect(page.getElementById(headings[0].id)).toBe(heading);
      expect(page.querySelectorAll(`[id="${headings[0].id}"]`)).toHaveLength(1);
      expect(headings[0].id).not.toBe(id);
    },
  );
  it("highlights known languages while preserving literal code and unknown languages", () => {
    const rendered = renderMarkdown('```ts\nconst x = "<script>";\n```\n\n```unknown\n<img onerror="run()">\n```');
    expect(rendered.html).toContain("hljs-keyword");
    const template = document.createElement("template");
    template.innerHTML = rendered.html;
    expect(template.content.querySelectorAll("code")[0].textContent).toBe('const x = "<script>";');
    expect(template.content.querySelectorAll("code")[1].textContent).toBe('<img onerror="run()">');
    expect(template.content.querySelector("img")).toBeNull();
  });
});
