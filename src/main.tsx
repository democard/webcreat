import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { getRouteFromLocation, resolvePostRoute, routePath } from "./lib/routes";
import { postsData } from "./data/posts";
import { ArticleBody } from "./types/blog";
import "./index.css";

async function start() {
  const root = document.getElementById("root")!;
  const route = resolvePostRoute(getRouteFromLocation(window.location), postsData);
  let article: ArticleBody | undefined;
  let ArticleComponent;
  if (route.tab === "post-detail") {
    ArticleComponent = (await import("./pages/PostDetail")).PostDetail;
    const element = root.querySelector<HTMLElement>("article[data-post-slug]");
    if (element?.dataset.postSlug === route.postSlug) article = {
      slug: route.postSlug, html: element.innerHTML,
      headings: Array.from(element.querySelectorAll<HTMLElement>("h1[id],h2[id],h3[id]")).map((heading) => ({
        id: heading.id, text: heading.textContent || "", level: Number(heading.tagName.slice(1)),
      })),
    };
  }
  const application = <React.StrictMode><ErrorBoundary><App initialRoute={route} initialArticle={article} ArticleComponent={ArticleComponent} /></ErrorBoundary></React.StrictMode>;
  if (root.dataset.route === routePath(route) && root.childNodes.length) hydrateRoot(root, application);
  else createRoot(root).render(application);
}
start().catch(() => {
  const notice = document.createElement("p");
  notice.setAttribute("role", "alert");
  notice.className = "mx-auto max-w-3xl p-4 text-slate-300";
  notice.textContent = "交互功能暂时没能加载，已显示的内容仍可阅读。请刷新页面重试。";
  document.body.prepend(notice);
});
