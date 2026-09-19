import { renderToString } from "react-dom/server";
import { App } from "./App";
import { PostDetail } from "./pages/PostDetail";
import { loadArticle } from "./lib/content";
import { Route } from "./lib/routes";
import { postsData } from "./data/posts";

export async function renderPage(route: Route) {
  const post = route.tab === "post-detail" ? postsData.find((item) => item.slug === route.postSlug) : undefined;
  const article = post ? await loadArticle(post.slug) : undefined;
  return renderToString(<App initialRoute={route} initialArticle={article} ArticleComponent={PostDetail} />);
}
