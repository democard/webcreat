import { Marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import kotlin from "highlight.js/lib/languages/kotlin";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";

Object.entries({ javascript, typescript, python, kotlin, bash, json, css, xml })
  .forEach(([name, language]) => hljs.registerLanguage(name, language));

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

const PAGE_IDS = ["root", "main-content", "page-structured-data"];

const markdown = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    code({ text, lang }) {
      const language = (lang || "").trim().split(/\s+/)[0].toLowerCase();
      const supported = language && hljs.getLanguage(language);
      const html = supported ? hljs.highlight(text, { language, ignoreIllegals: true }).value : escapeHtml(text);
      return `<pre><code class="hljs${supported ? ` language-${escapeHtml(language)}` : ""}">${html}</code></pre>`;
    },
  },
});

export interface Heading { id: string; text: string; level: number }

export function renderMarkdown(content: string, environment = { document, purifier: DOMPurify }): { html: string; headings: Heading[] } {
  const template = environment.document.createElement("template");
  template.innerHTML = environment.purifier.sanitize(markdown.parse(content, { async: false }), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select"],
    FORBID_ATTR: ["style"],
  });
  const headingElements = Array.from(template.content.querySelectorAll("h1, h2, h3"));
  const existingElements = Array.from(template.content.querySelectorAll("[id]"));
  const reservedIds = new Set([...PAGE_IDS, ...existingElements.map((element) => element.id)]);
  const otherIds = new Set([...PAGE_IDS, ...existingElements.filter((element) => !headingElements.includes(element))
    .map((element) => element.id)]);
  const assignedIds = new Set<string>();
  const headings = headingElements.map((heading, index) => {
    // Preserve authored links while keeping generated table-of-contents targets unique.
    let id = heading.id;
    if (!id || otherIds.has(id) || assignedIds.has(id)) {
      let number = index + 1;
      do { id = `article-section-${number++}`; } while (reservedIds.has(id));
    }
    reservedIds.add(id);
    assignedIds.add(id);
    heading.id = id;
    heading.setAttribute("tabindex", "-1");
    return { id, text: heading.textContent || "未命名章节", level: Number(heading.tagName.slice(1)) };
  });
  template.content.querySelectorAll("a[href]").forEach((link) => {
    if (/^https?:\/\//i.test(link.getAttribute("href") || "")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });
  template.content.querySelectorAll("img").forEach((img) => {
    img.loading = "lazy";
    img.decoding = "async";
  });
  return { html: template.innerHTML, headings };
}
