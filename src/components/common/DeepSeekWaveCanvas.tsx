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
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const getEmblemCenter = () => {
      const cx = width > 1024 ? width * 0.72 : width * 0.5;
      const cy = width > 1024 ? Math.min(height * 0.38, 320) : 240;
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
      const emblemScale = Math.min(width * 0.24, 220);

      // 1. 载入 1800+ 颗狐狸头核心粒子
      for (let i = 0; i < emblemPoints.length; i++) {
        const pt = emblemPoints[i];
        const px = cx + pt.nx * emblemScale;
        const py = cy + pt.ny * emblemScale;
        const baseAlpha = pt.brightness * 0.55 + 0.15;

        particles.push({
          originX: px,
          originY: py,
          x: px,
          y: py,
          vx: 0,
          vy: 0,
          size: 1.5,
          alpha: baseAlpha,
          baseAlpha: baseAlpha,
          colorOffset: (pt.nx + pt.ny) * 2,
          touchForce: 0,
          isEmblem: true,
        });
      }

      // 2. 全局环境星轨微尘系统 (Ambient Stardust Mesh - 极其微弱柔和，全屏平衡右侧重量)
      const step = 38;
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          if (Math.random() > 0.65) {
            const px = x + (Math.random() - 0.5) * 16;
            const py = y + (Math.random() - 0.5) * 16;
            // 避开狐狸头主体区域，分布在左侧和四周
            const edx = px - cx;
            const edy = py - cy;
            const eDist = Math.sqrt(edx * edx + edy * edy);
            if (eDist > 140) {
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
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.012;

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const { cx, cy } = getEmblemCenter();

      // 1. 全局平衡双核极光：
      // (1) 右侧主图腾极光 (Cyan / Violet)
      const gradR = ctx.createRadialGradient(cx, cy, 20, cx, cy, 380);
      gradR.addColorStop(0, "rgba(56, 189, 248, 0.2)");
      gradR.addColorStop(0.4, "rgba(129, 140, 248, 0.1)");
      gradR.addColorStop(0.8, "rgba(192, 132, 252, 0.03)");
      gradR.addColorStop(1, "transparent");
      ctx.fillStyle = gradR;
      ctx.fillRect(0, 0, width, height);

      // (2) 左侧微弱平衡暗夜极光 (Deep Indigo / Emerald - 彻底平衡左轻右重)
      const gradL = ctx.createRadialGradient(width * 0.22, height * 0.28, 10, width * 0.22, height * 0.28, 360);
      gradL.addColorStop(0, "rgba(14, 165, 233, 0.1)");
      gradL.addColorStop(0.5, "rgba(99, 102, 241, 0.05)");
      gradL.addColorStop(1, "transparent");
      ctx.fillStyle = gradL;
      ctx.fillRect(0, 0, width, height);

      // 鼠标全屏流光互动
      if (mouse.active) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
        mouseGlow.addColorStop(0, "rgba(56, 189, 248, 0.12)");
        mouseGlow.addColorStop(0.5, "rgba(168, 85, 247, 0.05)");
        mouseGlow.addColorStop(1, "transparent");
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. 渲染全屏粒子与图腾粒子
      for (const p of particles) {
        // 自然流体微呼吸
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
          // 狐狸头触碰激发出青蓝 -> 亮蓝紫 -> 霓虹玫紫 -> 金色流光
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
          // 全局环境微尘：随鼠标掠过产生柔和微亮
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

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
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