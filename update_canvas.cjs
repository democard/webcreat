const fs = require('fs');
const path = require('path');

// 写入一个基于离线高精度 Canvas 扫描采样的方法
const sampleScript = `
import React, { useEffect, useRef } from "react";

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

    const mouse = {
      x: width * 0.65,
      y: height * 0.45,
      targetX: width * 0.65,
      targetY: height * 0.45,
      radius: 200,
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
      isEmblem: boolean;
    }

    let particles: Particle[] = [];

    // 载入真实 Logo 图片进行 1:1 像素级精准点阵采样
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/logo.png";

    img.onload = () => {
      // 创建离线内存 Canvas 进行像素扫描
      const offCanvas = document.createElement("canvas");
      const offSize = 300;
      offCanvas.width = offSize;
      offCanvas.height = offSize;
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0, offSize, offSize);
      const imgData = offCtx.getImageData(0, 0, offSize, offSize).data;

      const centerX = width * 0.64;
      const centerY = height * 0.42;
      const targetScale = Math.min(width, height) * 0.46;
      const scaleFactor = targetScale / offSize;

      particles = [];

      // 采样步长（网格密度）
      const step = 4; // 采样分辨率

      for (let y = 0; y < offSize; y += step) {
        for (let x = 0; x < offSize; x += step) {
          const idx = (y * offSize + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const a = imgData[idx + 3];

          // 判断是否为白色图腾或者浅蓝下巴区域（亮度检测）
          // 原图中间图腾为白色 (r>180, g>180, b>180) 和下巴淡蓝色 (b>200, g>180)
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

          // 排除最外层圆形白框 (只采样中心 r < 110 内的图腾)
          const dxCenter = x - offSize / 2;
          const dyCenter = y - offSize / 2;
          const distToCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);

          // 核心图腾区域在半径 105 以内，且颜色明显偏白偏亮
          if (distToCenter < 100 && brightness > 150 && a > 100) {
            const posX = centerX + (x - offSize / 2) * scaleFactor;
            const posY = centerY + (y - offSize / 2) * scaleFactor;

            // 根据亮度计算初始透明度 (白区域更亮，浅蓝稍微柔和)
            const baseAlpha = brightness > 220 ? 0.85 : 0.6;

            particles.push({
              originX: posX,
              originY: posY,
              x: posX,
              y: posY,
              vx: 0,
              vy: 0,
              size: 2.8, // 科技方形点阵
              alpha: baseAlpha,
              baseAlpha,
              isEmblem: true,
            });
          }
        }
      }

      // 添加环境深空微星云背景粒子
      const bgStep = 32;
      for (let x = 0; x < width; x += bgStep) {
        for (let y = 0; y < height; y += bgStep) {
          if (Math.random() > 0.6) {
            const px = x + (Math.random() - 0.5) * 16;
            const py = y + (Math.random() - 0.5) * 16;
            particles.push({
              originX: px,
              originY: py,
              x: px,
              y: py,
              vx: 0,
              vy: 0,
              size: 1.4,
              alpha: Math.random() * 0.12 + 0.03,
              baseAlpha: Math.random() * 0.12 + 0.03,
              isEmblem: false,
            });
          }
        }
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      if (img.complete) img.onload?.(new Event("load"));
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
      time += 0.02;

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // 1. DeepSeek 极光背景渲染
      const grad = ctx.createRadialGradient(
        width * 0.65,
        height * 0.38,
        40,
        width * 0.65,
        height * 0.38,
        Math.min(width, height) * 0.6
      );
      grad.addColorStop(0, "rgba(14, 116, 144, 0.25)");
      grad.addColorStop(0.45, "rgba(30, 58, 138, 0.15)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 鼠标跟随发光
      const mouseGlow = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        300
      );
      mouseGlow.addColorStop(0, "rgba(56, 189, 248, 0.12)");
      mouseGlow.addColorStop(0.6, "rgba(99, 102, 241, 0.04)");
      mouseGlow.addColorStop(1, "transparent");
      ctx.fillStyle = mouseGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. 实时更新并渲染每一个 1:1 采样的图腾粒子
      for (const p of particles) {
        // 自主微浮动
        const waveX = Math.sin(time * 1.5 + p.originY * 0.02) * 2;
        const waveY = Math.cos(time * 1.5 + p.originX * 0.02) * 2;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = p.originX + waveX;
        let targetY = p.originY + waveY;
        let currentAlpha = p.baseAlpha;

        // 鼠标流体波动
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius);
          const ripple = Math.sin(dist * 0.06 - time * 5) * 20 * force;
          const angle = Math.atan2(dy, dx);

          targetX -= Math.cos(angle) * (ripple + force * 24);
          targetY -= Math.sin(angle) * (ripple + force * 24);

          currentAlpha = Math.min(1, p.baseAlpha + force * 0.6);
        }

        // 弹簧平滑阻尼
        p.vx = (p.vx + (targetX - p.x) * 0.12) * 0.78;
        p.vy = (p.vy + (targetY - p.y) * 0.12) * 0.78;
        p.x += p.vx;
        p.y += p.vy;

        // 绘制方块粒子 (DeepSeek Dot Matrix)
        if (p.isEmblem) {
          ctx.fillStyle = `rgba(224, 242, 254, ${currentAlpha})`;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else {
          ctx.fillStyle = `rgba(148, 163, 184, ${currentAlpha})`;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
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
      className="fixed inset-0 pointer-events-none z-0 opacity-90"
    />
  );
};
`;

fs.writeFileSync('D:/webcreat/src/components/common/DeepSeekWaveCanvas.tsx', sampleScript, 'utf8');
console.log('Successfully written pixel-perfect canvas scanner!');