import { Post } from "../types/blog";

export const postsData: Post[] = [
  {
    id: "building-xmu-assistant-engineering-retrospective",
    slug: "building-xmu-assistant-engineering-retrospective",
    title: "从痛点到双端落地：一个校园助手的工程实战与思考",
    summary: "为了解决大学日常中平台分散、通知不及时和课件整理繁琐的困扰，我用 Python/PySide6 与 Kotlin/Jetpack Compose 打造了一款双端校园助手。这是一份关于协议分析、算法求解、移动端架构与开源致谢的真实手记。",
    date: "2026-08-31",
    readTime: "8 min read",
    tags: ["实战复盘", "Kotlin", "Python", "架构设计", "开源思考"],
    featured: true,
    content: `
在大学校园里，教学与教务往往被割裂在多个独立的信息系统中：
- **学习平台（TronClass / LNT）**：签到任务时效性极强，且课件往往分散在各个层级的章节树中；
- **综合教务系统**：课表、成绩核算与期末考试安排分散在另一个入口，日常查询需要反复走统一身份认证。

当这些碎片化的流程成为每天的固定负担时，作为一名开发者，最自然的想法就是：**能否通过工程化的方式，构建一个统一、低侵入、真正高效的双端助手？**

于是，\`xmu_assistant\` 诞生了。

---

## 01. 桌面端：PySide6 打造轻量常驻工作台

最早动工的是 Windows 桌面端。它的定位很明确：**在 PC 上低占用常驻，提供可靠的状态轮询与课件聚合。**

我基于 **Python + PySide6 (Qt)** 进行了模块化架构设计：

### 接口协议梳理与定位算法
通过对平台网络协议的梳理，我们能够获取到当前课程的事件流。其中最有趣的是**雷达签到（地理位置校验）机制**：
平台并未直接下发目标基准坐标，但在提交候选位置时，接口会返回当前位置与目标点的 \`distance\`（距离偏差）。

在局部平面坐标系下，这本质上是一个经典的**几何圆相交（Trilateration）三边测量问题**：
利用两次已知坐标应答返回的偏差距离作为半径，联立求出解集交点，从而精确估算出签到基准中心点。

### 防抖策略与人性化设计
为了避免高频请求对服务器造成压力，桌面端设计了多层防御机制：
- **随机抖动延迟（10–30s）** 与作答门槛；
- **二维码签到仅做系统级弹窗提醒**，不执行自动化，确保合规与合理使用；
- 支持 **PushPlus 微信通知** 与 **QQ 邮箱（SMTP）** 离线兜底。

---

## 02. Android 端：Kotlin + Jetpack Compose 原生体验

桌面端稳定后，日常移动场景对便携性提出了更高要求。为了追求丝滑的响应速度与系统级集成，我选择采用 **100% 原生 Kotlin + Jetpack Compose (Material 3)** 构建 Android 端。

### 架构与并发调度
校园移动网络的特点是弱网切换频繁、易休眠。为此我在 Android 端实现了几项关键支撑：
1. **\`BoundedParallel.kt\`**：限制批量课件下载与接口拉取的并发通道，平滑流量脉冲；
2. **\`SessionHealthProbe\`**：多维度探测会话健康度（识别 401/403、重定向至统一登录域或登录表单特征），实现无感静默恢复；
3. **系统深度集成**：开发了**桌面今日课表 Widget 小组件**、**Quick Settings 控制中心快捷磁贴**，以及考试日程全屏强提醒。

---

## 03. 本地凭据安全与工程权衡

数据安全始终是个人工具类项目的红线：
- **Windows 桌面端**：使用 Windows 原生 **DPAPI (\`win32crypt\`)**，对保存在本地的 Cookie 进行当前用户级硬件密钥加密；
- **Android 原生端**：引入 **\`AndroidX Security (EncryptedSharedPreferences)\`** 保护敏感凭据；
- **免责声明与边界意识**：程序仅查询当前登录账号本人的授权数据，坚决不越界。

---

## 04. 致谢与开源传承 (Acknowledgments)

一个优秀的开源项目从来不是闭门造车的结果。在开发 \`xmu_assistant\` 的过程中，社区前人的探索为我提供了巨大的启发与帮助，在此特别致谢：

- 感谢 **[KrsMt-0113/XMU-Rollcall-Bot](https://github.com/KrsMt-0113/XMU-Rollcall-Bot)** 开源项目，其在签到轮询接口、数字码递归提取以及基于距离估算候选位置的思路，为本作提供了极高价值的参考；
- 感谢 **[KrsMt-0113/XMUFD](https://github.com/KrsMt-0113/XMUFD)** 项目在课件下载机制上的探索；
- 感谢 **requests、PySide6、OkHttp、Jetpack Compose、WorkManager、MockWebServer** 等优秀的开源基础设施。

---

## 05. 结语

从最初为了解决自身课业琐事的脚本，到如今涵盖双端架构、单元测试与发布流程的成熟工具，这个项目不仅是一次技术栈的横跨实践，更让我体会到了**用代码改善身边真实体验**的踏实与乐趣。

项目已基于 Apache-2.0 协议在 GitHub 开源，欢迎交流与指正。
`
  },
  {
    id: "canvas-fluid-emblem-physics-and-dark-ui",
    slug: "canvas-fluid-emblem-physics-and-dark-ui",
    title: "1800 颗粒子的流体图腾：Canvas 物理引擎与暗黑界面调优手记",
    summary: "拒绝千篇一律的死板贴图，用原生 HTML5 Canvas 构建高精度狼首点阵流体系统。本文记录从矢量采样提取、正弦简谐波纹、触碰彩虹流光转换到双核星云视觉配平的完整实现细节。",
    date: "2026-09-02",
    readTime: "6 min read",
    tags: ["前端工程", "Canvas", "物理模拟", "交互设计", "数学实践"],
    featured: true,
    content: `
在这个博客最初设计时，右侧如果只放一张静态的 PNG Logo，整个界面会显得非常沉寂死板；而如果放过重的 3D 渲染，不仅会拖慢加载，还会过度喧宾夺主。

最终我选择了一个极客又克制的折中方案：**将狼首图腾数字化为 1800+ 颗微米级粒子，并运行在原生 2D Canvas 物理引擎中。**

---

## 01. 矢量点阵提取与清洗

很多点阵效果看起来粗劣，核心原因在于粒子密度不足，或者提取算法带入了大面积背景噪点。

为了让图腾呈现丝绸般的质感：
1. **几何采样算法**：以 500×500 原始 SVG 矢量为基准，对核心几何面执行步长为 3px 的高密均匀采样；
2. **噪点与外圈剔除**：在坐标归一化阶段计算每颗点到中心的极半径，严格过滤掉外围边界多余的圆形扫面点，仅保留纯净狼首轮廓（共精确保留 1807 个坐标点）；
3. **坐标压缩与预编译**：采样结果生成为轻量静态数组 \`emblemPoints.ts\`，免去客户端运行时的重复像素解析开销。

\`\`\`typescript
// 数据结构极简压缩：仅保留归一化坐标与亮度通道
export interface EmblemPoint {
  nx: number;         // 归一化 X (-1.0 ~ 1.0)
  ny: number;         // 归一化 Y (-1.0 ~ 1.0)
  brightness: number; // 亮度权重 (0.0 ~ 1.0)
}
\`\`\`

---

## 02. 流体呼吸与扰动物理模拟

粒子并不是静止的，而是拥有生命感地持续呼吸：

### 简谐波纹算法
每颗粒子叠加了基于自身空间位置的正弦波动位移，模拟液态微流动：

\`\`\`javascript
const waveFreq = p.isEmblem ? 0.03 : 0.015;
const waveAmp = p.isEmblem ? 1.4 : 0.7;
const waveX = Math.sin(time + p.originY * waveFreq) * waveAmp;
const waveY = Math.cos(time + p.originX * waveFreq) * waveAmp;
\`\`\`

### 弹性扰动与回弹力场
当鼠标在屏幕移动时，粒子与光标距离产生反比力场。粒子被推开后，通过胡克定律配合阻尼系数（0.82）平滑弹回原位，既有机械键盘般的利落感，又具备液态的柔和。

---

## 03. 触碰流光与 HSL 动态色彩映射

默认状态下，图腾由淡蓝（#bae6fd）与冰晶紫（#c7d2fe）交替脉动，保持深色背景下的专业冷静。

而当鼠标掠过激活动态力场时，触发连续色相渐变：
- **色相从 185°（冷青色）平滑演进到 315°（霓虹洋红）**；
- 亮度随着受力大小从 65% 动态激增至 90% 高光金色；
- 离开鼠标后，颜色与光度呈指数衰减逐渐回归深海冰晶色。

---

## 04. 视觉重心配平与性能治理

在全屏排版中，右侧高密度的亮色图腾很容易造成“左轻右重”的失衡感。为此我设计了**双核星云配平机制**：
- 在左侧文案后方铺设极其微弱的暗夜深靛极光（Deep Indigo），在视觉重量上与右侧青紫主星云形成引力平衡；
- 在四周散布极其微弱的星轨微尘系统（Ambient Stardust Mesh），弱光随光标轻微泛起。

### 电池与高分屏优化
- **Retina 适配**：根据 \`devicePixelRatio\` 自动缩放 Canvas 缓冲区，消除高分屏锯齿；
- **Page Visibility 节电**：切出页面时通过 \`document.hidden\` 自动挂起 \`requestAnimationFrame\`，零后台损耗。
`
  },
  {
    id: "zero-bloat-modern-frontend-architecture",
    slug: "zero-bloat-modern-frontend-architecture",
    title: "现代前端的克制与性能演进：一个零依赖博客的构建哲学",
    summary: "当现代 Web 开发越来越深陷庞大的打包产物与繁复的依赖黑洞时，如何做减法？本文分享 webcreat 在轻量化路由、全自动数据同步与 CSS 瘦身中的工程抉择。",
    date: "2026-09-03",
    readTime: "5 min read",
    tags: ["架构思考", "React", "性能调优", "轻量化", "开源实践"],
    featured: true,
    content: `
不知从何时起，一个简单的个人主页动辄要引入几百个 npm 包、打包体积破兆、首屏需要经历层层渲染。

在构建 \`webcreat\` 时，我给自己定下了一条原则：**如果原生机制或几十行精简代码就能解决的问题，绝不引入重型第三方库。**

---

## 01. 为什么不用重型路由库？

单页应用（SPA）部署在 GitHub Pages 这类静态托管平台上，最容易遇到的就是 **404 页面刷新失效** 问题。通常的做法是放一个 \`404.html\` 做重定向 hack，或者配置庞大的历史模式重写插件。

但对于一个以内容阅读为主的个人空间，**原生 Hash 路由（#）** 才是最稳健的工程解：

\`\`\`typescript
const getRouteFromHash = (): { tab: string; postSlug?: string } => {
  const hash = window.location.hash || "#/";
  if (hash.startsWith("#/post/")) {
    return { tab: "post-detail", postSlug: decodeURIComponent(hash.slice(7)) };
  }
  if (hash === "#/blog") return { tab: "blog" };
  if (hash === "#/projects") return { tab: "projects" };
  if (hash === "#/about") return { tab: "about" };
  return { tab: "home" };
};
\`\`\`

- **零配置适配**：原生兼容任意静态主机，不需要任何反向代理重写；
- **原生历史栈**：天然支持浏览器前进、后退与深层链接（Deep-linking）分享；
- **体积为零**：彻底摆脱了几十 KB 的路由运行时代价。

---

## 02. GitHub API 实时同步与 SWR 缓存

传统静态博客的一大痛点是：**每次 GitHub 仓库有新更新或新增项目，必须手动拉代码、修改配置并重新部署。**

\`webcreat\` 采用轻量自动化抓取：
1. 直接读取 GitHub 官方公共只读接口（无需任何 Token，绝对安全）；
2. 自动拉取各仓库的 \`README.md\` 并实时解析出最具代表性的简介与技术标签；
3. **引入 30 分钟本地 localStorage 缓存**：用户二次打开时实现 **0ms 瞬时直出**，在后台异步静默校验更新，既消除了网络抖动白屏，又彻底避开了 API 请求频次限制。

---

## 03. 视觉审美的克制演化

在早期的设计探索中，我曾尝试过高饱和的霓虹渐变与各种花哨的卡片发光，但实际使用时会产生强烈的视觉疲劳。

最终定格的暗黑生态美学：
- **深色基底**：选用接近暗物质的 \`#0b0f17\`，而不是生硬的纯黑（#000000）；
- **通透毛玻璃**：\`bg-slate-950/20 backdrop-blur-2xl\`，让背景流体波纹若隐若现；
- **微光响应**：平时保持低对比度克制，仅在鼠标悬停时激活青蓝微边框与右上角环境柔光。

优秀的前端工程从来不是拼凑依赖的堆砌，而是在严苛的约束下，交出最精巧、最敏捷的纯粹作品。
`
  }
];