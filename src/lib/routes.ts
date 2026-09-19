import { basePath } from "../config/site";

export type PageTab = "home" | "blog" | "projects" | "about";
export type Route = { tab: PageTab | "not-found" } | { tab: "post-detail"; postSlug: string };

export function parseRoute(hash: string): Route {
  if (hash.startsWith("#/post/")) {
    try {
      const postSlug = decodeURIComponent(hash.slice(7));
      return postSlug ? { tab: "post-detail", postSlug } : { tab: "blog" };
    } catch {
      return { tab: "blog" };
    }
  }
  switch (hash) {
    case "#/blog": return { tab: "blog" };
    case "#/projects": return { tab: "projects" };
    case "#/about": return { tab: "about" };
    default: return { tab: "home" };
  }
}

export const postHash = (post: { slug: string; id: string }) =>
  `#/post/${encodeURIComponent(post.slug || post.id)}`;

export function routePath(route: Route): string {
  if (route.tab === "home") return "";
  if (route.tab === "post-detail") return `posts/${encodeURIComponent(route.postSlug)}/`;
  if (route.tab === "not-found") return "404.html";
  return `${route.tab}/`;
}

export const routeHref = (route: Route) => `${basePath}${routePath(route)}`;
export const postHref = (post: { slug: string }) => routeHref({ tab: "post-detail", postSlug: post.slug });

export function resolvePostRoute(route: Route, posts: Array<{ id: string; slug: string }>): Route {
  if (route.tab !== "post-detail") return route;
  const post = posts.find((item) => item.slug === route.postSlug || item.id === route.postSlug);
  return post ? { tab: "post-detail", postSlug: post.slug } : route;
}

export function parsePath(pathname: string): Route {
  const local = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname.replace(/^\//, "");
  if (!local || local === "index.html") return { tab: "home" };
  const page = local.replace(/\/$/, "");
  if (["blog", "projects", "about"].includes(page)) return { tab: page as PageTab };
  if (page.startsWith("posts/")) {
    try {
      const postSlug = decodeURIComponent(page.slice(6));
      return postSlug ? { tab: "post-detail", postSlug } : { tab: "not-found" };
    } catch { return { tab: "not-found" }; }
  }
  return { tab: "not-found" };
}

export const getRouteFromLocation = (location: Pick<Location, "hash" | "pathname">): Route =>
  location.hash.startsWith("#/") ? parseRoute(location.hash) : parsePath(location.pathname);

export function navigate(route: Route) {
  const href = routeHref(route);
  if (window.location.pathname + window.location.search + window.location.hash !== href) {
    window.history.pushState(null, "", href);
    window.dispatchEvent(new Event("app:navigate"));
  } else window.scrollTo({ top: 0, behavior: scrollBehavior() });
}

export const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
