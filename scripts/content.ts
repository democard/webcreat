import { mkdir, readFile, readdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import { renderMarkdown } from "../src/lib/markdown";

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputDir = path.join(projectRoot, "src/content/posts");
const outputDir = path.join(projectRoot, "src/generated");

export function parsePost(source: string, filename: string) {
  const match = source.replace(/^\uFEFF/, "").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: missing YAML frontmatter`);
  const data = parse(match[1]);
  const validDate = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(new Date(value).getTime()) && new Date(value).toISOString().slice(0, 10) === value;
  const fail = (field: string) => { throw new Error(`${filename}: invalid ${field}`); };
  if (!data || typeof data !== "object" || Array.isArray(data)) fail("frontmatter");
  for (const field of ["title", "summary", "date", "slug"]) {
    if (typeof data[field] !== "string" || !data[field].trim()) fail(field);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) fail("slug (use lowercase words separated by hyphens)");
  if (data.id !== undefined && (typeof data.id !== "string" || !data.id.trim())) fail("id");
  if (!validDate(data.date)) fail("date");
  if (data.updated !== undefined && (!validDate(data.updated) || data.updated < data.date)) fail("updated");
  if (!Array.isArray(data.tags) || !data.tags.length || data.tags.some((tag: unknown) => typeof tag !== "string" || !tag.trim())) fail("tags");
  for (const field of ["featured", "draft"]) if (data[field] !== undefined && typeof data[field] !== "boolean") fail(field);
  if (!match[2].trim()) fail("article body");
  return { id: data.id || data.slug, slug: data.slug, title: data.title.trim(), summary: data.summary.trim(),
    date: data.date, updated: data.updated, tags: [...new Set<string>(data.tags.map((tag: string) => tag.trim()))],
    featured: data.featured === true, draft: data.draft === true, content: match[2].trim() };
}

export function estimateReadingTime(text: string) {
  const han = text.match(/\p{Script=Han}/gu)?.length || 0;
  const words = text.replace(/\p{Script=Han}/gu, " ").match(/[\p{L}\p{N}_]+/gu)?.length || 0;
  return Math.max(1, Math.ceil(han / 350 + words / 200));
}

/** Legacy ids and canonical slugs share the same article route lookup. */
export function validatePostIdentifiers(posts: ReadonlyArray<{ filename: string; id: string; slug: string }>) {
  const identifiers = new Map<string, { filename: string; field: "id" | "slug" }>();
  for (const post of posts) {
    for (const field of ["id", "slug"] as const) {
      if (field === "slug" && post.slug === post.id) continue;
      const identifier = post[field];
      const previous = identifiers.get(identifier);
      if (previous) {
        throw new Error(`${post.filename}: duplicate article identifier "${identifier}" (${field}); `
          + `already used by ${previous.filename} (${previous.field})`);
      }
      identifiers.set(identifier, { filename: post.filename, field });
    }
  }
}

async function writeChanged(file: string, value: unknown) {
  const content = JSON.stringify(value, null, 2) + "\n";
  if (await readFile(file, "utf8").catch(() => "") !== content) await writeFile(file, content);
}

export async function generateContent() {
  const filenames = (await readdir(inputDir)).filter((file) => file.endsWith(".md")).sort();
  const all = await Promise.all(filenames.map(async (file) => parsePost(await readFile(path.join(inputDir, file), "utf8"), file)));
  validatePostIdentifiers(all.map((post, index) => ({ filename: filenames[index], id: post.id, slug: post.slug })));
  const posts = all.filter((post) => !post.draft).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const dom = new JSDOM("");
  const environment = { document: dom.window.document, purifier: createDOMPurify(dom.window) };
  const metadata = [];
  const search = [];
  await mkdir(path.join(outputDir, "posts"), { recursive: true });
  for (const { content, draft, ...post } of posts) {
    const body = renderMarkdown(content, environment);
    const template = dom.window.document.createElement("template");
    template.innerHTML = body.html;
    const text = template.content.textContent?.replace(/\s+/g, " ").trim() || "";
    const minutes = estimateReadingTime(text);
    const entry = { ...post, readTime: `${minutes} 分钟`, readingMinutes: minutes };
    metadata.push(entry);
    search.push({ slug: post.slug, text });
    await writeChanged(path.join(outputDir, "posts", `${post.slug}.json`), { slug: post.slug, ...body });
  }
  dom.window.close();
  // Only remove stale generated JSON files inside the fixed generated/posts directory.
  const valid = new Set(posts.map((post) => `${post.slug}.json`));
  for (const file of await readdir(path.join(outputDir, "posts"))) {
    if (file.endsWith(".json") && !valid.has(file)) await unlink(path.join(outputDir, "posts", file));
  }
  await writeChanged(path.join(outputDir, "index.json"), metadata);
  await writeChanged(path.join(outputDir, "search.json"), search);
  return metadata;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const posts = await generateContent();
  console.log(`Validated and generated ${posts.length} published articles.`);
}
