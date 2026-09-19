import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";
import { projectRoot } from "./content";
import { basePath, site } from "../src/config/site";

const dist = path.join(projectRoot, "dist");
const posts = JSON.parse(await readFile(path.join(projectRoot, "src/generated/index.json"), "utf8"));
const pages = ["", "blog/", "projects/", "about/", ...posts.map((post: { slug: string }) => `posts/${post.slug}/`), "404.html"];
for (const page of pages) {
  const file = path.join(dist, page.endsWith(".html") ? page : `${page}index.html`);
  const dom = new JSDOM(await readFile(file, "utf8"), { url: new URL(page, site.url).href });
  const document = dom.window.document;
  assert(document.querySelector("main h1"), `${page}: missing static h1`);
  assert(document.querySelectorAll("main h1").length === 1, `${page}: ambiguous h1`);
  assert(document.querySelector('link[rel="canonical"]'), `${page}: no canonical`);
  assert(document.querySelector('link[type="application/rss+xml"]'), `${page}: no RSS discovery`);
  const structured = document.getElementById("page-structured-data");
  if (page === "404.html") assert(!structured, `${page}: should not describe a missing page with structured data`);
  else JSON.parse(structured!.textContent!);
  for (const element of document.querySelectorAll<HTMLLinkElement | HTMLScriptElement | HTMLImageElement | HTMLAnchorElement>("a[href],link[rel=stylesheet],script[src],img[src]")) {
    const url = element.getAttribute("href") || element.getAttribute("src") || "";
    if (url.startsWith("#")) { assert(document.getElementById(url.slice(1)), `${page}: missing section ${url}`); continue; }
    if (!url.startsWith(basePath)) continue;
    const local = new URL(url, site.url).pathname.slice(basePath.length);
    assert(existsSync(path.join(dist, local)) || existsSync(path.join(dist, local, "index.html")), `${page}: missing resource ${url}`);
  }
  if (page.startsWith("posts/")) {
    const post = posts.find((item: { slug: string }) => page === `posts/${item.slug}/`)!;
    assert(document.title.includes(post.title), `${page}: incorrect title`);
    const body = JSON.parse(await readFile(path.join(projectRoot, "src/generated/posts", `${post.slug}.json`), "utf8"));
    const expected = document.createElement("template");
    expected.innerHTML = body.html;
    const article = document.querySelector("article[data-post-slug]");
    assert(article, `${page}: missing article HTML`);
    assert.equal(article.innerHTML, expected.innerHTML, `${page}: article HTML differs from generated content`);
    assert(document.querySelector('meta[property="og:type"]')?.getAttribute("content") === "article");
    if (body.headings.length) assert(document.querySelector("nav[aria-label='文章目录'] a[href^='#']"), `${page}: no native table of contents`);
  }
  if (page === "404.html") assert(document.querySelector('meta[name="robots"]')?.getAttribute("content")?.includes("noindex"));
  dom.window.close();
}
for (const [file, selector, count] of [["feed.xml", "item", posts.length], ["sitemap.xml", "url", pages.length - 1]] as const) {
  const dom = new JSDOM(await readFile(path.join(dist, file), "utf8"), { contentType: "text/xml" });
  assert.equal(dom.window.document.querySelectorAll(selector).length, count, `${file}: incorrect entries`);
  dom.window.close();
}
console.log(`Verified ${pages.length} static pages, internal assets, article metadata, RSS, and sitemap.`);
