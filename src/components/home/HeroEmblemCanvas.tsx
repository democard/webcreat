import React, { useEffect, useRef } from "react";
import { emblemPoints } from "../../data/emblemPoints";

export const HeroEmblemCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 340;
    let height = 340;

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 130,
      active: false,
    };

    interface Particle {
      originX: number;
      originY: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      baseAlpha: number;
      colorOffset: number;
      touchForce: number;
    }

    let particles: Particle[] = [];

    const initCanvas = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width || 320;
      height = rect.height || 320;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const scale = Math.min(width, height) * 0.42;

      particles = [];
      for (let i = 0; i < emblemPoints.length; i++) {
        const pt = emblemPoints[i];
        const px = cx + pt.nx * scale;
        const py = cy + pt.ny * scale;
        const baseAlpha = pt.brightness * 0.65 + 0.2;

        particles.push({
          originX: px,
          originY: py,
          x: px,
          y: py,
          vx: 0,
          vy: 0,
          size: 1.4,
          alpha: baseAlpha,
          baseAlpha: baseAlpha,
          colorOffset: (pt.nx + pt.ny) * 2,
          touchForce: 0,
        });
      }
    };

    initCanvas();

    const handleResize = () => {
      initCanvas();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        mouse.targetX = e.touches[0].clientX - rect.left;
        mouse.targetY = e.touches[0].clientY - rect.top;
        mouse.active = true;
      }
    };

    const handleLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        if (!isRunning) {
          isRunning = true;
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleLeave);
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleLeave);

    let time = 0;

    const render = () => {
      if (!isRunning) return;

      time += 0.015;

      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;

      // 核心局部星云光晕
      const haloGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.5);
      haloGrad.addColorStop(0, "rgba(56, 189, 248, 0.16)");
      haloGrad.addColorStop(0.5, "rgba(129, 140, 248, 0.06)");
      haloGrad.addColorStop(1, "transparent");
      ctx.fillStyle = haloGrad;
      ctx.fillRect(0, 0, width, height);

      // 鼠标局部光感
      if (mouse.active) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        mouseGlow.addColorStop(0, "rgba(56, 189, 248, 0.18)");
        mouseGlow.addColorStop(0.6, "rgba(168, 85, 247, 0.05)");
        mouseGlow.addColorStop(1, "transparent");
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 渲染 1807 颗流体图腾粒子
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 简谐流体呼吸
        const waveX = Math.sin(time + p.originY * 0.03) * 1.5;
        const waveY = Math.cos(time + p.originX * 0.03) * 1.5;

        let targetX = p.originX + waveX;
        let targetY = p.originY + waveY;
        let currentAlpha = p.baseAlpha;
        let currentTouch = 0;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = 1 - dist / mouse.radius;
            const ripple = Math.sin(dist * 0.08 - time * 3.5) * 14 * force;
            const angle = Math.atan2(dy, dx);

            targetX -= Math.cos(angle) * (ripple + force * 16);
            targetY -= Math.sin(angle) * (ripple + force * 16);

            currentAlpha = Math.min(1, p.baseAlpha + force * 0.5);
            currentTouch = force;
          }
        }

        p.touchForce += (currentTouch - p.touchForce) * 0.14;

        p.vx = (p.vx + (targetX - p.x) * 0.1) * 0.82;
        p.vy = (p.vy + (targetY - p.y) * 0.1) * 0.82;
        p.x += p.vx;
        p.y += p.vy;

        // 动态色彩空间变换
        if (p.touchForce > 0.06) {
          const tf = p.touchForce;
          const hue = 185 + tf * 135 + Math.sin(time * 2 + p.colorOffset) * 25;
          const lightness = 65 + tf * 25;
          ctx.fillStyle = `hsla(${hue}, 95%, ${lightness}%, ${currentAlpha})`;
        } else {
          const colorPulse = Math.sin(time + p.colorOffset);
          if (colorPulse > 0.3) {
            ctx.fillStyle = `rgba(186, 230, 253, ${currentAlpha})`;
          } else if (colorPulse < -0.3) {
            ctx.fillStyle = `rgba(199, 210, 254, ${currentAlpha})`;
          } else {
            ctx.fillStyle = `rgba(224, 242, 254, ${currentAlpha})`;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleLeave);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-square flex items-center justify-center cursor-pointer select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
