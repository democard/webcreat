import React, { useEffect, useRef } from "react";
import { emblemPoints } from "../../data/emblemPoints";

export const DeepSeekWaveCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const updateCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateCanvasSize();

    const getEmblemCenter = () => {
      const isDesktop = width > 1024;
      const cx = isDesktop ? width * 0.72 : width * 0.5;
      const cy = isDesktop ? Math.min(height * 0.38, 320) : Math.min(height * 0.32, 240);
      return { cx, cy };
    };

    const mouse = {
      x: width * 0.5,
      y: 280,
      targetX: width * 0.5,
      targetY: 280,
      radius: 190,
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
      isEmblem: boolean;
    }

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const { cx, cy } = getEmblemCenter();
      const isDesktop = width > 1024;
      const emblemScale = isDesktop ? Math.min(width * 0.24, 220) : Math.min(width * 0.34, 150);

      // 1. 载入图腾核心粒子 (移动端透明度减半作为柔和背景水印，桌面端保持锐利明亮)
      for (let i = 0; i < emblemPoints.length; i++) {
        const pt = emblemPoints[i];
        const px = cx + pt.nx * emblemScale;
        const py = cy + pt.ny * emblemScale;
        const baseAlpha = isDesktop
          ? pt.brightness * 0.55 + 0.15
          : (pt.brightness * 0.35 + 0.08) * 0.5;

        particles.push({
          originX: px,
          originY: py,
          x: px,
          y: py,
          vx: 0,
          vy: 0,
          size: isDesktop ? 1.4 : 1.2,
          alpha: baseAlpha,
          baseAlpha: baseAlpha,
          colorOffset: (pt.nx + pt.ny) * 2,
          touchForce: 0,
          isEmblem: true,
        });
      }

      // 2. 全局环境星轨微尘系统 (Ambient Stardust Mesh)
      const step = isDesktop ? 40 : 60;
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          if (Math.random() > 0.65) {
            const px = x + (Math.random() - 0.5) * 16;
            const py = y + (Math.random() - 0.5) * 16;
            const edx = px - cx;
            const edy = py - cy;
            const eDist = Math.sqrt(edx * edx + edy * edy);
            if (eDist > (isDesktop ? 140 : 90)) {
              const bgAlpha = Math.random() * 0.12 + 0.03;
              particles.push({
                originX: px,
                originY: py,
                x: px,
                y: py,
                vx: 0,
                vy: 0,
                size: Math.random() * 1.2 + 0.6,
                alpha: bgAlpha,
                baseAlpha: bgAlpha,
                colorOffset: Math.random() * 10,
                touchForce: 0,
                isEmblem: false,
              });
            }
          }
        }
      }
    };

    initParticles();

    const handleResize = () => {
      updateCanvasSize();
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    // 网页后台挂起时暂停动画，节省 CPU 与电池
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
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let time = 0;

    const render = () => {
      if (!isRunning) return;

      time += 0.012;

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const { cx, cy } = getEmblemCenter();
      const isDesktop = width > 1024;

      // 1. 全局平衡双核极光：
      // (1) 右侧主图腾极光 (Cyan / Violet)
      const gradR = ctx.createRadialGradient(cx, cy, 20, cx, cy, isDesktop ? 380 : 250);
      gradR.addColorStop(0, "rgba(56, 189, 248, 0.16)");
      gradR.addColorStop(0.4, "rgba(129, 140, 248, 0.07)");
      gradR.addColorStop(0.8, "rgba(192, 132, 252, 0.02)");
      gradR.addColorStop(1, "transparent");
      ctx.fillStyle = gradR;
      ctx.fillRect(0, 0, width, height);

      // (2) 左侧微弱平衡暗夜极光 (Deep Indigo / Emerald)
      if (isDesktop) {
        const gradL = ctx.createRadialGradient(width * 0.22, height * 0.28, 10, width * 0.22, height * 0.28, 360);
        gradL.addColorStop(0, "rgba(14, 165, 233, 0.08)");
        gradL.addColorStop(0.5, "rgba(99, 102, 241, 0.04)");
        gradL.addColorStop(1, "transparent");
        ctx.fillStyle = gradL;
        ctx.fillRect(0, 0, width, height);
      }

      // 鼠标全屏流光互动
      if (mouse.active) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
        mouseGlow.addColorStop(0, "rgba(56, 189, 248, 0.12)");
        mouseGlow.addColorStop(0.5, "rgba(168, 85, 247, 0.04)");
        mouseGlow.addColorStop(1, "transparent");
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. 渲染全屏粒子与图腾粒子
      for (const p of particles) {
        const waveFreq = p.isEmblem ? 0.03 : 0.015;
        const waveAmp = p.isEmblem ? 1.4 : 0.7;
        const waveX = Math.sin(time + p.originY * waveFreq) * waveAmp;
        const waveY = Math.cos(time + p.originX * waveFreq) * waveAmp;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = p.originX + waveX;
        let targetY = p.originY + waveY;
        let currentAlpha = p.baseAlpha;
        let currentTouch = 0;

        if (mouse.active && dist < mouse.radius) {
          const force = 1 - dist / mouse.radius;
          const ripple = Math.sin(dist * 0.06 - time * 3) * (p.isEmblem ? 14 : 7) * force;
          const angle = Math.atan2(dy, dx);

          targetX -= Math.cos(angle) * (ripple + force * (p.isEmblem ? 16 : 8));
          targetY -= Math.sin(angle) * (ripple + force * (p.isEmblem ? 16 : 8));

          currentAlpha = Math.min(1, p.baseAlpha + force * 0.45);
          currentTouch = force;
        }

        p.touchForce += (currentTouch - p.touchForce) * 0.12;

        p.vx = (p.vx + (targetX - p.x) * 0.1) * 0.82;
        p.vy = (p.vy + (targetY - p.y) * 0.1) * 0.82;
        p.x += p.vx;
        p.y += p.vy;

        if (p.isEmblem) {
          if (p.touchForce > 0.08) {
            const tf = p.touchForce;
            const hue = 185 + tf * 130 + Math.sin(time * 2 + p.colorOffset) * 25;
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
        } else {
          if (p.touchForce > 0.1) {
            ctx.fillStyle = `rgba(56, 189, 248, ${Math.min(0.6, currentAlpha + 0.3)})`;
          } else {
            ctx.fillStyle = `rgba(148, 163, 184, ${currentAlpha})`;
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
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};