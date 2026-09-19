import { absoluteUrl, site } from "../config/site";
import { Post } from "../types/blog";
import { Route, routePath } from "./routes";

const titles = { home: site.title, blog: "技术手记", projects: "开源项目", about: "关于我", "not-found": "页面未找到" };

export function pageMetadata(route: Route, post?: Post) {
  const missing = route.tab === "not-found" || (route.tab === "post-detail" && !post);
  const title = `${post?.title || (missing ? titles["not-found"] : titles[route.tab as keyof typeof titles])} · ${site.name}`;
  const url = absoluteUrl(routePath(route));
  return { title, description: post?.summary || site.description, url, missing,
    type: post ? "article" : "website",
    structuredData: missing ? undefined : post ? {
      "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title,
      description: post.summary, datePublished: post.date, dateModified: post.updated || post.date,
      inLanguage: "zh-CN", mainEntityOfPage: url, url,
      author: { "@type": "Person", name: site.author, url: site.github },
      keywords: post.tags.join(", "),
    } : { "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: site.url, description: site.description, inLanguage: "zh-CN" },
  };
}

export function updateMetadata(route: Route, post?: Post) {
  const meta = pageMetadata(route, post);
  document.title = meta.title;
  const set = (attribute: string, name: string, content: string) => {
    let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
    if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, name); document.head.appendChild(element); }
    element.content = content;
  };
  set("name", "description", meta.description);
  set("name", "robots", meta.missing ? "noindex, follow" : "index, follow");
  set("property", "og:title", meta.title);
  set("property", "og:description", meta.description);
  set("property", "og:url", meta.url);
  set("property", "og:type", meta.type);
  set("name", "twitter:title", meta.title);
  set("name", "twitter:description", meta.description);
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
  canonical.href = meta.url;
  let structured = document.getElementById("page-structured-data");
  if (!meta.structuredData) structured?.remove();
  else {
    if (!structured) { structured = document.createElement("script"); structured.id = "page-structured-data"; structured.setAttribute("type", "application/ld+json"); document.head.appendChild(structured); }
    structured.textContent = JSON.stringify(meta.structuredData);
  }
}
