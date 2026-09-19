import { expect, it, vi } from "vitest";
import { createCanvasAnimation } from "../src/lib/canvasAnimation";

it("pauses a canvas outside the viewport and resumes when it returns", () => {
  let visibility!: (entries: { isIntersecting: boolean }[]) => void;
  const disconnect = vi.fn();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: typeof visibility) { visibility = callback; }
    observe() {} disconnect = disconnect;
  });
  let id = 0;
  const frames = new Map<number, FrameRequestCallback>();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++id, callback); return id; });
  vi.stubGlobal("cancelAnimationFrame", (frame: number) => frames.delete(frame));
  const draw = vi.fn();
  const canvas = document.createElement("canvas");
  const animation = createCanvasAnimation(draw, canvas);
  expect(frames.size).toBe(1);
  visibility([{ isIntersecting: false }]);
  expect(frames.size).toBe(0);
  const calls = draw.mock.calls.length;
  animation.invalidate();
  expect(draw).toHaveBeenCalledTimes(calls);
  visibility([{ isIntersecting: true }]);
  expect(frames.size).toBe(1);
  animation.dispose();
  expect(disconnect).toHaveBeenCalled();
});

it("renders once for reduced motion and stops its loop when hidden or disposed", () => {
  const media = new EventTarget();
  let reduced = true;
  Object.defineProperty(media, "matches", { get: () => reduced });
  vi.spyOn(window, "matchMedia").mockReturnValue(media as MediaQueryList);
  let hidden = false;
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  let id = 0;
  const frames = new Map<number, FrameRequestCallback>();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++id, callback); return id; });
  vi.stubGlobal("cancelAnimationFrame", (frame: number) => frames.delete(frame));
  const draw = vi.fn();
  const animation = createCanvasAnimation(draw);
  expect(draw).toHaveBeenCalledTimes(1);
  expect(frames.size).toBe(0);
  reduced = false;
  media.dispatchEvent(new Event("change"));
  expect(frames.size).toBe(1);
  hidden = true;
  document.dispatchEvent(new Event("visibilitychange"));
  expect(frames.size).toBe(0);
  hidden = false;
  document.dispatchEvent(new Event("visibilitychange"));
  expect(frames.size).toBe(1);
  animation.dispose();
  expect(frames.size).toBe(0);
  const calls = draw.mock.calls.length;
  media.dispatchEvent(new Event("change"));
  expect(draw).toHaveBeenCalledTimes(calls);
});
