import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { JSDOM } from "jsdom";
import { projectRoot } from "./content";
import { absoluteUrl, basePath, site } from "../src/config/site";
import { pageMetadata } from "../src/lib/metadata";
import { Route, routePath } from "../src/lib/routes";
import { Post } from "../src/types/blog";

const dist = path.join(projectRoot, "dist");
const template = await readFile(path.join(dist, "index.html"), "utf8");
const posts: Post[] = JSON.parse(await readFile(path.join(projectRoot, "src/generated/index.json"), "utf8"));
const manifest = JSON.parse(await readFile(path.join(dist, ".vite/manifest.json"), "utf8"));
const routes: Route[] = [{ tab: "home" }, { tab: "blog" }, { tab: "projects" }, { tab: "about" },
  ...posts.map((post): Route => ({ tab: "post-detail", postSlug: post.slug })), { tab: "not-found" }];

const server = await createServer({ root: projectRoot, configFile: false, plugins: [react()], base: basePath,
  server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const { renderPage } = await server.ssrLoadModule("/src/entry-server.tsx");
  for (const route of routes) {
    const post = route.tab === "post-detail" ? posts.find((item) => item.slug === route.postSlug) : undefined;
    const metadata = pageMetadata(route, post);
    const dom = new JSDOM(template);
    const document = dom.window.document;
    document.title = metadata.title;
    const root = document.getElementById("root")!;
    root.dataset.route = routePath(route);
    root.innerHTML = await renderPage(route);
    const meta = (attribute: string, name: string, content: string) => {
      let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
      if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, name); document.head.appendChild(element); }
      element.content = content;
    };
    meta("name", "description", metadata.description);
    meta("name", "robots", metadata.missing ? "noindex, follow" : "index, follow");
    meta("property", "og:title", metadata.title);
    meta("property", "og:description", metadata.description);
    meta("property", "og:type", metadata.type);
    meta("property", "og:url", metadata.url);
    meta("property", "og:locale", "zh_CN");
    meta("name", "twitter:card", "summary");
    meta("name", "twitter:title", metadata.title);
    meta("name", "twitter:description", metadata.description);
    const image = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    if (image) image.content = absoluteUrl("logo.png");
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (icon) icon.href = `${basePath}emblem.svg`;
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = metadata.url;
    document.head.appendChild(canonical);
    const feed = document.createElement("link");
    feed.rel = "alternate"; feed.type = "application/rss+xml"; feed.title = `${site.name} · RSS`; feed.href = absoluteUrl("feed.xml");
    document.head.appendChild(feed);
    if (metadata.structuredData) {
      const structured = document.createElement("script");
      structured.id = "page-structured-data";
      structured.type = "application/ld+json";
      structured.textContent = JSON.stringify(metadata.structuredData).replace(/</g, "\\u003c");
      document.head.appendChild(structured);
    }
    if (post) for (const css of manifest["src/pages/PostDetail.tsx"]?.css || []) {
      const link = document.createElement("link"); link.rel = "stylesheet"; link.href = `${basePath}${css}`; document.head.appendChild(link);
    }
    const destination = route.tab === "not-found" ? path.join(dist, "404.html") : path.join(dist, routePath(route), "index.html");
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, dom.serialize());
    dom.window.close();
  }
} finally { await server.close(); }

const xml = (value: string) => value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);
const articleUrl = (post: Post) => absoluteUrl(`posts/${post.slug}/`);
const sitemap = routes.filter((route) => route.tab !== "not-found").map((route) => {
  const post = route.tab === "post-detail" ? posts.find((item) => item.slug === route.postSlug) : undefined;
  return `<url><loc>${xml(absoluteUrl(routePath(route)))}</loc>${post ? `<lastmod>${post.updated || post.date}</lastmod>` : ""}</url>`;
}).join("\n");
await writeFile(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>`);
const items = posts.map((post) => `<item><title>${xml(post.title)}</title><link>${xml(articleUrl(post))}</link><guid isPermaLink="true">${xml(articleUrl(post))}</guid><pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate><description>${xml(post.summary)}</description>${post.tags.map((tag) => `<category>${xml(tag)}</category>`).join("")}</item>`).join("\n");
await writeFile(path.join(dist, "feed.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(site.name)}</title><link>${xml(site.url)}</link><description>${xml(site.description)}</description><language>zh-CN</language><atom:link href="${xml(absoluteUrl("feed.xml"))}" rel="self" type="application/rss+xml"/>\n${items}\n</channel></rss>`);
await writeFile(path.join(dist, ".nojekyll"), "");
if (basePath === "/") await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl("sitemap.xml")}\n`);
console.log(`Prerendered ${routes.length} pages, RSS, and sitemap.`);
