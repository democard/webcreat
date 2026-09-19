import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { projectRoot } from "./content";

const slug = process.argv[2];
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Usage: npm run new:post -- my-article-slug");
const directory = path.join(projectRoot, "src/content/posts");
await mkdir(directory, { recursive: true });
await writeFile(path.join(directory, `${slug}.md`), `---\nslug: ${slug}\ntitle: 新文章\nsummary: 在这里写一句清晰的摘要。\ndate: ${new Date().toISOString().slice(0, 10)}\ntags:\n  - 技术手记\nfeatured: false\ndraft: true\n---\n\n在这里开始写作。完成后把 draft 改为 false。\n`, { flag: "wx" });
console.log(`Created draft: src/content/posts/${slug}.md`);
