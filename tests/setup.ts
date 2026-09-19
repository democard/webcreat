import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

Object.defineProperty(window, "matchMedia", { writable: true, value: vi.fn((query) => ({
  matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
})) });
window.scrollTo = vi.fn();
HTMLElement.prototype.scrollIntoView = vi.fn();
// jsdom has no layout or native dialog focus management; test application behavior separately.
HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.IntersectionObserver = class {
  root = null; rootMargin = ""; thresholds = [];
  observe() {} unobserve() {} disconnect() {} takeRecords() { return []; }
};
afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
});
