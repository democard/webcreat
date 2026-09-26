import { describe, expect, it } from "vitest";
import { resolveFragmentTarget } from "../scripts/build-links";

describe("static article fragment links", () => {
  it.each([
    ["目录", "#%E7%9B%AE%E5%BD%95"],
    ["with space", "#with%20space"],
    ["C++", "#C++"],
    ["100%", "#100%"],
  ])("locates the browser target for %s", (id, href) => {
    const article = document.implementation.createHTMLDocument();
    const target = article.createElement("h2");
    target.id = id;
    article.body.appendChild(target);
    expect(resolveFragmentTarget(article, href)).toBe(target);
    expect(resolveFragmentTarget(article, "#missing")).toBeNull();
  });
});
