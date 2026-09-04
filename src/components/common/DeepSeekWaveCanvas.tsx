import React, { useEffect, useRef } from "react";

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

    const mouse = {
      x: width * 0.5,
      y: 200,
      targetX: width * 0.5,
      targetY: 200,
      radius: 180,
      active: false,
    };

    interface StardustParticle {
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
    }

    let particles: StardustParticle[] = [];

    const initParticles = () => {
      particles = [];
      const step = width > 1024 ? 42 : 60;

      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          if (Math.random() > 0.65) {
            const px = x + (Math.random() - 0.5) * 20;
            const py = y + (Math.random() - 0.5) * 20;
            const baseAlpha = Math.random() * 0.12 + 0.02;

            particles.push({
              originX: px,
              originY: py,
              x: px,
              y: py,
              vx: 0,
              vy: 0,
              size: Math.random() * 1.2 + 0.6,
              alpha: baseAlpha,
              baseAlpha: baseAlpha,
              colorOffset: Math.random() * 10,
            });
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

    const handleLeave = () => {
      mouse.active = false;
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
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let time = 0;

    const render = () => {
      if (!isRunning) return;

      time += 0.01;

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // 1. 全局双核星云微光背景
      // (1) 右上侧轻微柔光
      const gradR = ctx.createRadialGradient(width * 0.75, height * 0.25, 20, width * 0.75, height * 0.25, 380);
      gradR.addColorStop(0, "rgba(56, 189, 248, 0.12)");
      gradR.addColorStop(0.5, "rgba(129, 140, 248, 0.04)");
      gradR.addColorStop(1, "transparent");
      ctx.fillStyle = gradR;
      ctx.fillRect(0, 0, width, height);

      // (2) 左侧微弱平衡暗夜极光
      const gradL = ctx.createRadialGradient(width * 0.2, height * 0.3, 10, width * 0.2, height * 0.3, 340);
      gradL.addColorStop(0, "rgba(14, 165, 233, 0.08)");
      gradL.addColorStop(0.5, "rgba(99, 102, 241, 0.03)");
      gradL.addColorStop(1, "transparent");
      ctx.fillStyle = gradL;
      ctx.fillRect(0, 0, width, height);

      // 鼠标全屏流光互动
      if (mouse.active) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
        mouseGlow.addColorStop(0, "rgba(56, 189, 248, 0.1)");
        mouseGlow.addColorStop(0.6, "rgba(168, 85, 247, 0.03)");
        mouseGlow.addColorStop(1, "transparent");
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. 渲染全屏环境微尘粒子
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const waveX = Math.sin(time + p.originY * 0.015) * 0.8;
        const waveY = Math.cos(time + p.originX * 0.015) * 0.8;

        let targetX = p.originX + waveX;
        let targetY = p.originY + waveY;
        let currentAlpha = p.baseAlpha;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = 1 - dist / mouse.radius;
            const angle = Math.atan2(dy, dx);
            targetX -= Math.cos(angle) * force * 12;
            targetY -= Math.sin(angle) * force * 12;
            currentAlpha = Math.min(0.6, p.baseAlpha + force * 0.35);
          }
        }

        p.vx = (p.vx + (targetX - p.x) * 0.1) * 0.85;
        p.vy = (p.vy + (targetY - p.y) * 0.1) * 0.85;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = `rgba(148, 163, 184, ${currentAlpha})`;
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
      window.removeEventListener("mouseleave", handleLeave);
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