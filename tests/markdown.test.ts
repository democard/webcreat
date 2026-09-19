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
