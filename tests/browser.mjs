import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-chromium";
import AxeBuilder from "@axe-core/playwright";
import { JSDOM } from "jsdom";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(project, "dist");
const artifacts = process.env.WEBCREAT_ARTIFACT_DIR || path.join(project, "test-results");
await mkdir(artifacts, { recursive: true });
const posts = JSON.parse(await readFile(path.join(project, "src/generated/index.json"), "utf8"));
const homepage = new JSDOM(await readFile(path.join(dist, "index.html"), "utf8"));
const canonical = homepage.window.document.querySelector('link[rel="canonical"]')?.getAttribute("href");
assert(canonical, "Build the site before running browser checks: missing homepage canonical URL");
const base = new URL(canonical).pathname;
homepage.window.close();
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".xml": "application/xml" };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/") { response.writeHead(302, { Location: base }).end(); return; }
    let target = path.resolve(dist, pathname.startsWith(base) ? pathname.slice(base.length) : "404.html");
    if (!target.startsWith(dist + path.sep) && target !== dist) throw new Error("Invalid path");
    let status = pathname.startsWith(base) ? 200 : 404;
    const info = await stat(target).catch(() => null);
    if (info?.isDirectory()) target = path.join(target, "index.html");
    if (!info) { target = path.join(dist, "404.html"); status = 404; }
    const content = await readFile(target);
    response.writeHead(status, { "Content-Type": mime[path.extname(target)] || "application/octet-stream" }).end(content);
  } catch { response.writeHead(400).end("Bad request"); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = `${origin}${base}`;
const browser = await chromium.launch({ headless: true });
const checks = [];
const errors = [];
const check = async (name, task) => {
  try { await task(); checks.push({ name, passed: true }); console.log(`PASS ${name}`); }
  catch (error) { checks.push({ name, passed: false, error: String(error) }); console.log(`FAIL ${name}: ${String(error).slice(0, 300)}`); }
};
const contexts = [];
async function context(options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce", ...options });
  contexts.push(ctx);
  await ctx.route("https://fonts.googleapis.com/**", (route) => route.fulfill({ contentType: "text/css", body: "" }));
  await ctx.route("https://api.github.com/**", (route) => route.fulfill({ status: 503, contentType: "application/json", body: '{}' }));
  return ctx;
}
const ready = (page) => page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
const layoutFits = async (page) => assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), "page overflows horizontally");
const sectionReached = (page, id) => page.waitForFunction((targetId) => {
  const target = document.getElementById(targetId);
  if (!target) return false;
  const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const intended = window.scrollY + target.getBoundingClientRect().top - margin;
  // Browsers clamp anchor scrolling when a section is close to the end of the document.
  const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const expected = Math.min(maximum, Math.max(0, intended));
  return Math.abs(window.scrollY - expected) <= 2;
}, id, { timeout: 5000 });
const accessibility = async (page, label) => {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  await writeFile(path.join(artifacts, `axe-${label}.json`), JSON.stringify(result.violations, null, 2));
  assert.equal(result.violations.length, 0, result.violations.map((violation) => `${violation.id}: ${violation.nodes.length} nodes`).join("; "));
};
try {
  const desktop = await context();
  const page = await desktop.newPage();
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => { if (message.type() === "error" && /hydration|hydrating|Minified React error/i.test(message.text())) errors.push(message.text()); });
  await page.goto(url);
  await ready(page);
  await check("desktop homepage and transparent emblem", async () => {
    await layoutFits(page);
    const transparent = await page.locator("canvas").last().evaluate((canvas) => {
      const context = canvas.getContext("2d");
      return context.getImageData(0, 0, 1, 1).data[3] === 0 && context.getImageData(canvas.width - 1, canvas.height - 1, 1, 1).data[3] === 0;
    });
    assert(transparent);
    await page.screenshot({ path: path.join(artifacts, "home-desktop.png"), fullPage: true });
  });
  await check("homepage accessibility", () => accessibility(page, "home"));
  await check("native search focus trap and full-text keyboard search", async () => {
    const trigger = page.getByRole("button", { name: "全局搜索", exact: true });
    await trigger.focus();
    await page.keyboard.press("Control+k");
    await page.getByRole("dialog").waitFor();
    for (let index = 0; index < 10; index++) {
      await page.keyboard.press("Tab");
      assert(await page.evaluate(() => !!document.activeElement.closest("dialog")));
    }
    await page.keyboard.press("Escape");
    assert(await trigger.evaluate((element) => document.activeElement === element));
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("searchbox").fill("DPAPI");
    await dialog.getByRole("button", { name: /校园助手/ }).waitFor();
    await accessibility(page, "search");
    await dialog.getByRole("searchbox").press("Enter");
    await page.waitForURL(/posts\/building-xmu-assistant-engineering-retrospective\//);
    await page.locator("article[data-post-slug]").waitFor();
  });
  await check("article direct refresh, section navigation and clipboard", async () => {
    await page.goto(`${url}posts/${posts[0].slug}/`);
    await ready(page);
    await page.reload();
    await ready(page);
    assert.equal(await page.locator("main h1").textContent(), posts[0].title);
    await page.getByRole("navigation", { name: "文章目录" }).getByRole("link").nth(1).click();
    assert(await page.evaluate(() => document.activeElement.id.startsWith("article-section-")));
    assert(page.url().includes(posts[0].slug));
    assert(new URL(page.url()).hash.startsWith("#article-section-"));
    await page.evaluate(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text) => { window.__copied = text; } } }); });
    await page.getByRole("button", { name: "分享本文" }).click();
    await page.getByText("文章链接已复制", { exact: true }).waitFor();
    assert((await page.evaluate(() => window.__copied)).endsWith(`/posts/${posts[0].slug}/`));
    await page.getByRole("button", { name: "复制代码", exact: true }).first().click();
    assert((await page.evaluate(() => window.__copied)).length > 5);
    await page.getByText("文章链接已复制", { exact: true }).waitFor({ state: "hidden" });
    await page.screenshot({ path: path.join(artifacts, "article-desktop.png"), fullPage: true });
  });
  await check("article accessibility", () => accessibility(page, "article"));
  await check("native article fragments preserve the reading position", async () => {
    await page.goto(`${url}posts/${posts[0].slug}/`);
    await ready(page);
    await page.evaluate(() => { window.location.hash = "article-section-3"; });
    await sectionReached(page, "article-section-3");
    assert(new URL(page.url()).hash === "#article-section-3");
  });
  await check("browser back restores an asynchronously loaded article section", async () => {
    await page.goto(url);
    await ready(page);
    await page.locator(`a[href='${base}posts/${posts[0].slug}/']`).first().click();
    await page.locator("article[data-post-slug]").waitFor();
    await page.getByRole("navigation", { name: "文章目录" }).getByRole("link").nth(2).click();
    const fragment = new URL(page.url()).hash;
    await page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "关于", exact: true }).click();
    await page.waitForURL(`${url}about/`);
    await page.goBack();
    await page.locator("article[data-post-slug]").waitFor();
    assert.equal(new URL(page.url()).hash, fragment);
    await sectionReached(page, fragment.slice(1));
  });
  await check("legacy article URL migration and browser back", async () => {
    await page.goto(`${url}#/post/${posts[0].slug}`);
    await ready(page);
    await page.waitForURL(`${url}posts/${posts[0].slug}/`);
    await page.getByRole("link", { name: /下一篇/ }).click();
    await page.waitForURL(`${url}posts/${posts[1].slug}/`);
    await page.goBack();
    await page.waitForURL(`${url}posts/${posts[0].slug}/`);
    assert.equal(await page.locator("main h1").textContent(), posts[0].title);
  });
  await check("blog filters survive refresh", async () => {
    await page.goto(`${url}blog/`); await ready(page);
    await page.getByRole("button", { name: "Kotlin", exact: true }).click();
    await page.reload(); await ready(page);
    await page.waitForFunction(() => document.querySelector('button[aria-pressed="true"]')?.textContent === "Kotlin");
    assert.equal(await page.locator("main h2").count(), 1);
    await page.getByRole("button", { name: "清除筛选", exact: true }).click();
    await accessibility(page, "blog");
  });
  await check("blog navigation clears filters without reloading", async () => {
    await page.goto(`${url}blog/`); await ready(page);
    await page.getByRole("button", { name: "Kotlin", exact: true }).click();
    await page.getByRole("searchbox", { name: "搜索技术笔记" }).fill("assistant");
    await page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "文章", exact: true }).click();
    await page.waitForURL(`${url}blog/`);
    assert.equal(await page.getByRole("searchbox", { name: "搜索技术笔记" }).inputValue(), "");
    assert.equal(await page.getByRole("button", { name: "全部文章", exact: true }).getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator("main h2").count(), posts.length);
  });
  await check("reading pages defer GitHub until project data is requested", async () => {
    const readingContext = await context();
    const readingPage = await readingContext.newPage();
    readingPage.on("pageerror", (error) => errors.push(String(error)));
    const githubRequests = [];
    readingPage.on("request", (request) => {
      if (request.url().startsWith("https://api.github.com/")) githubRequests.push(request.url());
    });
    for (const route of [`posts/${posts[0].slug}/`, "blog/", "about/"]) {
      await readingPage.goto(url + route); await ready(readingPage);
    }
    assert.equal(githubRequests.length, 0);
    const requested = readingPage.waitForRequest("https://api.github.com/**");
    await readingPage.getByRole("button", { name: "全局搜索", exact: true }).click();
    await requested;
    assert.equal(githubRequests.length, 1);
    await readingPage.getByRole("button", { name: "关闭搜索" }).click();
    const projectRequest = readingPage.waitForRequest("https://api.github.com/**");
    await readingPage.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "项目", exact: true }).click();
    await projectRequest;
    assert.equal(githubRequests.length, 2);
  });
  await check("project fallback, filtering and accessible demo links", async () => {
    await page.goto(`${url}projects/`); await ready(page);
    await page.getByRole("searchbox", { name: "搜索开源项目" }).fill("not-found-xyz");
    await page.getByRole("heading", { name: "暂时没有匹配的项目" }).waitFor();
    await page.getByRole("button", { name: "清除筛选", exact: true }).click();
    assert(await page.locator("main article a[href^='https://github.com']").count() > 0);
    await accessibility(page, "projects");
  });
  await check("custom 404", async () => {
    const response = await page.goto(`${url}not-a-page/`); await ready(page);
    assert.equal(response.status(), 404);
    assert((await page.locator("main h1").textContent()).includes("未找到"));
    assert((await page.locator('meta[name="robots"]').getAttribute("content")).includes("noindex"));
  });
  const mobileContext = await context({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mobile = await mobileContext.newPage();
  mobile.on("pageerror", (error) => errors.push(String(error)));
  await check("mobile routes, search and article layout", async () => {
    for (const route of ["", "blog/", "projects/", "about/", `posts/${posts[0].slug}/`]) {
      await mobile.goto(url + route); await ready(mobile); await layoutFits(mobile);
    }
    await mobile.getByRole("button", { name: "全局搜索", exact: true }).click();
    await mobile.getByRole("dialog").getByRole("searchbox").fill("Canvas");
    await mobile.getByRole("button", { name: "关闭搜索" }).click();
    await mobile.screenshot({ path: path.join(artifacts, "article-mobile.png"), fullPage: true });
    await mobile.goto(url); await ready(mobile);
    await mobile.screenshot({ path: path.join(artifacts, "home-mobile.png"), fullPage: true });
    await accessibility(mobile, "mobile");
  });
  const staticContext = await context({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await check("articles remain readable and linked without JavaScript", async () => {
    await staticPage.goto(`${url}blog/`);
    assert.equal(await staticPage.locator("main a[href*='/posts/']").count(), posts.length);
    for (const post of posts) {
      const response = await staticPage.goto(`${url}posts/${post.slug}/`);
      assert.equal(response.status(), 200);
      assert.equal(await staticPage.locator("main h1").textContent(), post.title);
      const body = JSON.parse(await readFile(path.join(project, "src/generated/posts", `${post.slug}.json`), "utf8"));
      const expected = new JSDOM(body.html);
      assert.equal((await staticPage.locator("article[data-post-slug]").textContent()).trim(), expected.window.document.body.textContent.trim());
      expected.window.close();
    }
    await staticPage.getByRole("link", { name: /上一篇/ }).click();
    assert(staticPage.url().includes(posts[1].slug));
  });
  await check("no runtime or hydration errors", async () => assert.deepEqual(errors, []));
} finally {
  await Promise.all(contexts.map((context) => context.close()));
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  await writeFile(path.join(artifacts, "browser-report.json"), JSON.stringify({ checks, errors }, null, 2));
}
if (checks.some((check) => !check.passed)) process.exitCode = 1;
console.log(`${checks.filter((check) => check.passed).length}/${checks.length} browser checks passed.`);
