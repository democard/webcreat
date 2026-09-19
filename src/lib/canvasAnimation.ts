/** A single animation loop that pauses when hidden, off screen, or reduced motion is requested. */
export function createCanvasAnimation(draw: (elapsed: number) => void, element?: Element) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let elapsed = 0;
  let lastTime = 0;
  let inView = !element || (() => {
    const rect = element.getBoundingClientRect();
    return rect.bottom >= 0 && rect.top <= window.innerHeight;
  })();
  let disposed = false;
  const visible = () => !disposed && !document.hidden && inView;
  const tick = (now: number) => {
    frame = 0;
    if (!visible() || motion.matches) return;
    if (!lastTime || now - lastTime >= 16) {
      elapsed += lastTime ? Math.min(now - lastTime, 50) / 1000 : 0;
      lastTime = now;
      draw(elapsed);
    }
    frame = requestAnimationFrame(tick);
  };
  const invalidate = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (!visible()) return;
    draw(elapsed);
    if (!motion.matches) frame = requestAnimationFrame(tick);
  };
  const observer = element ? new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    invalidate();
  }) : undefined;
  if (element) observer?.observe(element);
  document.addEventListener("visibilitychange", invalidate);
  motion.addEventListener("change", invalidate);
  invalidate();
  return {
    invalidate,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", invalidate);
      motion.removeEventListener("change", invalidate);
    },
  };
}
