# 📋 democard.dev (webcreat) 完整项目交接与上下文指南
> **文档用途**：本指南专为后续接手的 **AI 助手（如 Claude / ChatGPT / Cursor 等）** 或 **开发人员** 编写。阅读本文档即可 100% 掌握本项目的全貌架构、核心视觉算法、关键代码位置、历史避坑经验及未来规划，零门槛无缝续写与迭代。

---

## 1. 📌 项目基本概览 (Project Overview)

- **项目名称**：`webcreat`（线上品牌：`democard.dev`）
- **项目定位**：极简、现代、高性能的暗黑极客风格个人博客、开源作品集与技术实验室。
- **开源仓库**：[https://github.com/democard/webcreat](https://github.com/democard/webcreat)
- **在线演示地址**：[https://democard.github.io/webcreat/](https://democard.github.io/webcreat/)
- **所有者 / 作者**：[@democard](https://github.com/democard)（联系邮箱：`democard666@gmail.com`）
- **系统环境**：Windows 11（PowerShell 终端环境，注意避免使用 Linux 专有语法如 `&&` 连接命令，应使用 `;`）。

---

## 2. 🛠️ 核心技术栈与配置 (Tech Stack & Architecture)

| 层次 | 技术选型 | 版本 | 关键说明 |
| :--- | :--- | :--- | :--- |
| **前端框架** | React | `^18.3.1` | 函数式组件，全面 Hooks 驱动 |
| **语言规范** | TypeScript | `~5.7.2` | 严谨的接口与类型声明 (`types/blog.ts`) |
| **构建与开发**| Vite | `^6.1.0` | 极速冷启动，`base: "./"` 适配 GitHub Pages 相对路径 |
| **样式系统** | TailwindCSS | `^3.4.17` | 搭配 `@tailwindcss/typography` 深度定制暗黑 Prose 排版 |
| **图标体系** | Lucide React | `^0.475.0` | 统一的线性矢量科技感图标 |
| **内容解析** | Marked | `^18.0.11` | Markdown 转换 HTML，搭配定制代码高亮与样式渲染 |
| **CI / CD** | GitHub Actions | 自定义 Workflow | 推送 `main` 分支全自动 `npm run build` 并部署至 GitHub Pages |

---

## 3. 📂 项目目录结构剖析 (Directory Structure)

```text
D:\webcreat\
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自动化部署配置（pages 环境）
├── public/
│   ├── emblem.svg              # 狼首矢量标志（用于 Navbar 与 Favicon）
│   └── logo.png                # 品牌 Logo 图标
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── DeepSeekWaveCanvas.tsx  # 全局星空三维流动波浪粒子画布（全屏背景）
│   │   │   └── SearchModal.tsx         # 全局 Cmd+K / Ctrl+K 弹窗搜索组件
│   │   ├── home/
│   │   │   ├── HeroEmblemCanvas.tsx    # 核心视觉：1807 粒子狼首图腾交互 Canvas
│   │   │   ├── HomeHero.tsx            # 首页主屏布局（6:6 左右等分栅格）
│   │   │   ├── PostItem.tsx            # 首页精选文章卡片条目
│   │   │   └── ProjectCard.tsx         # 首页与项目页的仓库展示卡片
│   │   └── layout/
│   │       ├── Navbar.tsx              # 吸顶毛玻璃导航栏，支持全局搜索与标签切换
│   │       └── Footer.tsx              # 统一底部栏，包含开源信息与版权
│   ├── data/
│   │   ├── emblemPoints.ts     # 核心数据：高精度采样生成的 1807 组狼首粒子坐标
│   │   ├── posts.ts            # 本地博客文章源数据（支持完整 Markdown）
│   │   └── projects.ts         # 本地兜底开源项目数据
│   ├── hooks/
│   │   └── useGitHubProjects.ts# 自动拉取 GitHub API 实时同步仓库 Stars 与语言标签
│   ├── pages/
│   │   ├── Home.tsx            # 首页（Hero + 开源项目 + 精选文章）
│   │   ├── BlogList.tsx        # 博客列表页（分类筛选 + 实时检索）
│   │   ├── PostDetail.tsx      # 文章详情页（Markdown 渲染 + 目录导航 + 代码复制）
│   │   ├── Projects.tsx        # 开源工程展厅（分类筛选 + 实时动态星标）
│   │   └── About.tsx           # 关于作者页（个人履历 + 技能树 + 社交方式）
│   ├── types/
│   │   └── blog.ts             # 核心数据模型定义 (Post, Project, Tag, Category)
│   ├── App.tsx                 # 单页轻量状态路由调度中枢与主题控制
│   ├── index.css               # Tailwind 指令与全局暗黑 Prose / 自定义滚动条样式
│   └── main.tsx                # 应用渲染入口
├── package.json                # 项目依赖及 scripts 命令
├── vite.config.ts              # Vite 配置文件 (base: "./", port: 5173)
└── README.md                   # 面向 GitHub 访客的项目自述文件
```

---

## 4. 🎨 核心视觉与特殊实现机制 (Key Visual Systems)

### 4.1 🐺 狼首微米流体图腾 (`HeroEmblemCanvas.tsx` & `emblemPoints.ts`)
这是整站最核心、最具辨识度的视觉符号：
1. **数据源**：`emblemPoints.ts` 导出了 1,807 个高密度归一化采样点 `{ nx, ny, brightness }`。
   - 坐标范围：X `[-0.654, 0.616]`，Y `[-0.866, 0.807]`。
2. **绘制原理**：
   - 使用 HTML5 Canvas 2D 逐帧动画渲染。
   - 支持 DPR 屏幕物理像素高清适配 (`Math.min(window.devicePixelRatio || 1, 2)`)。
   - 图腾粒子半径设置为 `1.85px`，带有简谐微流动呼吸波（`Math.sin` & `Math.cos`）。
3. **物理交互**：
   - 鼠标接近粒子群时，触发距离反比斥力与波纹扰动（`ripple` 物理冲击）。
   - 粒子根据受力强度（`touchForce`）动态在青色（Cyan 185°）与霓虹紫（Purple）之间做 HSL 流光变换。
4. **【极度重要】纯透明 Canvas 规则**：
   - **Canvas 内部严禁使用 `fillRect` 填充任何背景或渐变光晕！** 必须保持 `ctx.clearRect(0, 0, width, height)` 纯透明，只绘制粒子弧线 `ctx.arc()`。
   - 这样粒子才能完美“悬浮”于全屏星空画布上，绝对不会出现 90° 直角方框或阴影剪裁。

### 4.2 🌌 全屏星海粒子波浪 (`DeepSeekWaveCanvas.tsx`)
- 作为 `fixed inset-0 pointer-events-none -z-10` 的全屏底层背景。
- 采用双层动态波浪网格算法，模拟类似 DeepSeek 官网的流动科技星尘，随时间轴缓缓起伏。

### 4.3 🔄 路由与状态体系 (`App.tsx`)
- 采用轻量且稳定的 Tab 状态管理，非 History API 路由，彻底规避 GitHub Pages 单页刷新 404 问题：
  `currentTab: "home" | "blog" | "post-detail" | "projects" | "about"`
- 全站宽度统一采用 `max-w-5xl` 容器标准，既保证了大屏上的大气舒展，又防止超宽屏阅读疲劳。

---

## 5. ⚠️ 历史踩坑与必须遵守的避坑铁律 (Critical Lessons & Fixes)

接手的 AI 请**务必阅读本章节**，不要重蹈历史修改的覆辙：

1. **避免方形边界 / 边框截断问题**：
   - *曾经的 Bug*：原代码在 Canvas 内部调用了 `ctx.createRadialGradient` 并用 `ctx.fillRect(0, 0, width, height)` 填充，导致光晕在 Canvas 边缘被硬生生切出一条矩形边框。
   - *铁律*：**绝对不要在 `HeroEmblemCanvas` 中画任何矩形背景**！
2. **避免宽度缩限（图腾变小）问题**：
   - *曾经的 Bug*：`Home.tsx` 顶层曾包裹了一个 `max-w-4xl (896px)` 的限制，同时 Hero 采用 `7:5` 分栏，导致右侧图腾最大只能渲染到 340px。
   - *当前架构*：Hero 必须保持 `lg:col-span-6` 左右各 50% 等分，且图腾映射 scale 设定为 `0.54`，图腾能够自由撑满 500px~600px 宽度。
3. **GitHub Actions 部署延迟特性**：
   - 项目在推送（`git push origin main`）后，GitHub Actions 耗时约为 **1 ~ 3 分钟**（在 Actions 标签页可见 `Deploy to GitHub Pages`）。
   - 部署完毕后，用户或测试者需要使用 **`Ctrl + F5` 强制硬刷新**（或无痕模式）以清除浏览器旧静态资源强缓存。
4. **Windows 环境下的 Git / Shell 命令**：
   - 用户在 Windows PowerShell 环境下运行命令，不支持 `&&`，请使用分号 `;`（如 `git add -A; git commit -m "..."; git push origin main`）。

---

## 6. 💻 开发与维护常用命令 (Commands)

```powershell
# 1. 启动本地开发服务 (默认端口 5173)
npm run dev

# 2. 本地生产打包与 TypeScript 类型检查
npm run build

# 3. 本地预览打包产物
npm run preview

# 4. 提交代码并触发全自动线上部署
git add -A; git commit -m "feat/fix: 说明你的改动"; git push origin main

# 5. 检查 GitHub Actions 部署状态 (需要 gh cli)
gh run list --limit 3
```

---

## 7. 🚀 后续可接续优化与规划建议 (Roadmap for Next AI)

后续接手的 AI 可在以下方向继续协助用户深化与迭代：

1. **文章系统进阶**：
   - 目前文章硬编码在 `src/data/posts.ts` 中。可利用 Vite 的 `import.meta.glob('/src/content/posts/*.md', { as: 'raw' })` 改为读取真实的 `.md` 独立文件，实现更自然的本地写作。
2. **代码阅读器增强 (`PostDetail.tsx`)**：
   - 增加代码块一键复制按钮反馈提示。
   - 为代码块引入 Prism.js 或 highlight.js 的精细语法高亮支持。
3. **移动端手势与触控调优**：
   - 针对移动端屏幕尺寸，优化狼首图腾的 TouchMove 多指互动灵敏度。
4. **SEO 与社交卡片 (OpenGraph)**：
   - 在 `index.html` 中补齐 Twitter Card、OG Image、元描述等标签，提升在推特 / 微信中的分享展示效果。

---
*本文档已在代码仓库根目录持久化保存为 `PROJECT_HANDOVER.md`。接手项目时优先阅读本指南！*
