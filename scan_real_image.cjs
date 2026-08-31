const fs = require('fs');
const { createCanvas, loadImage } = require('playwright-chromium');

// 我们用 playwright 启动一个无头浏览器来精准提取图片的真实 Canvas 像素
const { chromium } = require('playwright-chromium');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 创建一个包含原图的页面并在内存中精确提取像素
  const imgBase64 = fs.readFileSync('C:/Users/19196/.gemini/antigravity/brain/7f8e3c92-510b-47f5-bf82-24b577cb392e/.user_uploaded/media_1788157007332.png').toString('base64');
  
  const result = await page.evaluate((base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        
        const imgData = ctx.getImageData(0, 0, size, size).data;
        const points = [];
        
        // 步长 3 像素，高精度扫描
        const step = 3;
        for (let y = 0; y < size; y += step) {
          for (let x = 0; x < size; x += step) {
            const idx = (y * size + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];
            
            // 距离中心距离 (排除最外侧的圆形圈，中心图腾在半径 < 105 范围内)
            const cx = x - size / 2;
            const cy = y - size / 2;
            const dist = Math.sqrt(cx * cx + cy * cy);
            
            // 判断是否是图腾高亮部分 (白色或浅蓝)
            const brightness = r * 0.299 + g * 0.587 + b * 0.114;
            
            if (dist < 100 && brightness > 155 && a > 100) {
              points.push({
                nx: Number((cx / 100).toFixed(3)),
                ny: Number((cy / 100).toFixed(3)),
                brightness: brightness > 220 ? 0.9 : 0.7
              });
            }
          }
        }
        resolve(points);
      };
      img.src = 'data:image/png;base64,' + base64;
    });
  }, imgBase64);
  
  await browser.close();
  
  console.log('1:1 Raw Pixel Scanned Points Count:', result.length);
  const tsContent = `// 1:1 Pixel-Perfect Scanned Raw Image Emblem Points\nexport const emblemPoints = ${JSON.stringify(result, null, 2)};\n`;
  fs.writeFileSync('D:/webcreat/src/data/emblemPoints.ts', tsContent, 'utf8');
  console.log('Saved to src/data/emblemPoints.ts');
})();