import { ArticleBody } from "../types/blog";

const articles = import.meta.glob<ArticleBody>("../generated/posts/*.json", { import: "default" });
const cache = new Map<string, Promise<ArticleBody>>();

export function loadArticle(slug: string): Promise<ArticleBody> {
  const loader = articles[`../generated/posts/${slug}.json`];
  if (!loader) return Promise.reject(new Error("Article not found"));
  if (!cache.has(slug)) cache.set(slug, loader().catch((error) => { cache.delete(slug); throw error; }));
  return cache.get(slug)!;
}

export async function loadSearchIndex(): Promise<Map<string, string>> {
  const { default: entries } = await import("../generated/search.json");
  return new Map(entries.map((entry) => [entry.slug, entry.text]));
}
