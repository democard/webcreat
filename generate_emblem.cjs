const fs = require('fs');

function generateSolidWolfEmblem() {
  const points = [];
  
  // 采样步长（提升密度至 3.5）
  const step = 3.5;
  
  for (let y = -95; y <= 95; y += step) {
    for (let x = -90; x <= 90; x += step) {
      const absX = Math.abs(x);
      let inside = false;

      // 1. 顶部双耳/双角实体 (y: -95 到 -15)
      if (y >= -92 && y < -15) {
        const t = (y + 92) / 77; // 0 -> 1
        const innerBound = 22 - t * 8;   // 22 -> 14
        const outerBound = 24 + t * 44;  // 24 -> 68 (向外扩张)
        if (absX >= innerBound && absX <= outerBound) {
          inside = true;
        }
      }

      // 2. 中部核心实体面罩与脸颊 (y: -15 到 40)
      if (y >= -15 && y <= 40) {
        const t = (y + 15) / 55; // 0 -> 1
        const outerCheek = 68 - t * 24; // 68 -> 44 (向内收窄)
        const innerV = 12 * (1 - t);   // 倒 V 型镂空
        if (absX >= innerV && absX <= outerCheek) {
          inside = true;
        }
      }

      // 3. 下半部实体 V 型下颌与尖下巴 (y: 40 到 90)
      if (y > 40 && y <= 90) {
        const t = (90 - y) / 50; // 1 -> 0
        const outerJaw = t * 44; // 44 -> 0
        if (absX <= outerJaw) {
          inside = true;
        }
      }

      // 4. 内部关键特征镂空 (雕刻出原图的几何细节与阴影层次)
      // (a) 中缝上部 V 槽镂空
      if (y < -15 && y > -65) {
        const t = (y + 65) / 50;
        if (absX < t * 14) inside = false;
      }
      // (b) 中下部眼睛与战甲切线空隙
      if (y >= 10 && y <= 35) {
        const slitY = (y - 10) / 25;
        const slitX = 20 + slitY * 12;
        if (Math.abs(absX - slitX) < 2.5) {
          // 留出细缝
          inside = false;
        }
      }

      if (inside) {
        // 计算不同区域的质感亮度
        let brightness = 0.82;
        if (y > 55 && absX < 12) brightness = 0.95; // 底部高光尖
        else if (y < -30) brightness = 0.88; // 顶部角尖高光

        points.push({
          nx: Number((x / 100).toFixed(3)),
          ny: Number((y / 100).toFixed(3)),
          brightness
        });
      }
    }
  }
  return points;
}

const points = generateSolidWolfEmblem();
console.log('Generated solid emblem points count:', points.length);

const tsContent = `// Precomputed High-Density Solid Wolf Emblem Points\nexport const emblemPoints = ${JSON.stringify(points, null, 2)};\n`;
fs.writeFileSync('D:/webcreat/src/data/emblemPoints.ts', tsContent, 'utf8');