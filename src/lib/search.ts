import { Post } from "../types/blog";

const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase().trim();
export const searchTerms = (query: string) => [...new Set(normalize(query).split(/\s+/).filter(Boolean))].slice(0, 16);

export function rankPosts(posts: Post[], query: string, fullText = new Map<string, string>()) {
  const terms = searchTerms(query);
  if (!terms.length) return posts;
  return posts.map((post) => {
    const fields = [[post.title, 12], [post.tags.join(" "), 8], [post.summary, 4], [fullText.get(post.slug) || "", 1]] as const;
    const scores = terms.map((term) => fields.reduce((score, [text, weight]) => score + (normalize(text).includes(term) ? weight : 0), 0));
    return { post, score: scores.every((score) => score > 0) ? scores.reduce((sum, score) => sum + score, 0) : 0 };
  }).filter((result) => result.score > 0).sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date)).map(({ post }) => post);
}

export function searchExcerpt(text: string, query: string, fallback: string) {
  const terms = searchTerms(query);
  const indexes = terms.map((term) => normalize(text).indexOf(term)).filter((index) => index >= 0);
  if (!indexes.length) return fallback;
  const start = Math.max(0, Math.min(...indexes) - 35);
  const end = Math.min(text.length, start + 130);
  return `${start ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}
