<div align="center">

# 🌿 democard.dev (webcreat)

**极简、现代化、高性能的开源个人博客与技术作品集**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

作者：[@democard](https://github.com/democard) · [在线访问博客](https://democard.github.io/webcreat/)

</div>

---

## 🌟 核心特性 (Features)

- ⚡ **DeepSeek 风格流体点阵**：1:1 精确扫描的自定义狼首图腾，支持鼠标扰动与触碰动态彩虹流光变色。
- 🔄 **GitHub 实时自动同步**：基于公开 API 自动解析个人开源仓库的 README.md 简介与技术栈标签，免去手动维护。
- ✍️ **Markdown 极速排版引擎**：优雅渲染多级标题、列表、引用与代码块高亮。
- 🔍 **全局快速搜索 (`Cmd+K` / `Ctrl+K`)**：毫秒级模糊检索文章、技术标签与开源项目。
- 🎨 **暗黑极致美学**：符合现代暗黑生态的微光边框与通透毛玻璃质感。
- 🚀 **零配置一键部署**：通过 GitHub Actions 自动编译并发布到 GitHub Pages。

---

## 🛠️ 项目结构

```text
src/
├── components/
│   ├── common/       # 基础组件 (DeepSeekWaveCanvas 点阵画布、SearchModal 搜索等)
│   ├── home/         # 首页高内聚子组件 (HomeHero, ProjectCard, PostItem)
│   └── layout/       # 布局组件 (Navbar 导航栏、Footer 页脚)
├── data/             # 本地文章与静态数据
├── hooks/            # 自定义 Hook (useGitHubProjects 实时同步引擎)
├── pages/            # 核心路由页面 (Home, BlogList, PostDetail, Projects, About)
└── types/            # TypeScript 类型定义契约
```

---

## 🚀 本地开发与写作

### 1. 克隆代码
```bash
git clone https://github.com/democard/webcreat.git
cd webcreat
```

### 2. 安装依赖并启动
```bash
npm install
npm run dev
```
打开浏览器访问 `http://localhost:5173` 即可开始本地预览与写作。

---

## 👤 作者 (Author)

- **democard** ([@democard](https://github.com/democard))
- 邮箱联系：[democard666@gmail.com](mailto:democard666@gmail.com)

---

## 📄 开源协议 (License)

本项目基于 [MIT License](./LICENSE) 开源。