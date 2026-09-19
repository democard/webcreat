# democard.dev · webcreat

个人技术博客与开源作品集，使用 React 18、TypeScript、Vite 和 Tailwind CSS。保留透明狼首粒子与暗色视觉，同时提供可直接访问的静态文章、全文搜索和清晰的写作流程。

作者：[@democard](https://github.com/democard) · [已配置的站点地址](https://democard.github.io/webcreat/) · [MIT License](./LICENSE)

## 功能

- **静态阅读**：首页、文章、项目、关于和 404 在构建时生成 HTML；文章直接刷新可用，关闭 JavaScript 仍可阅读和通过链接导航。
- **独立文章链接**：使用 `/webcreat/posts/<slug>/`，兼容旧的 `#/post/<slug 或 id>` 链接。
- **Markdown 写作**：独立文件、元数据校验、草稿、自动阅读时长、更新日期；正文在构建时完成清理与代码高亮。
- **全文搜索**：Ctrl/Cmd+K 打开，搜索标题、摘要、标签和正文，关键词高亮；支持方向键、Enter 和 Esc。
- **阅读体验**：桌面侧栏目录、手机折叠目录、阅读进度、代码复制、文章分享和相邻文章。
- **项目展示**：公开 GitHub 仓库同步，30 分钟缓存，搜索、分类和排序；请求失败时可继续浏览缓存或预置项目。
- **发现与订阅**：每页标题、描述、canonical、分享元数据；文章结构化数据、RSS 和 sitemap。
- **移动与键盘**：响应式布局、可缩放页面、原生链接和对话框、焦点管理、系统减少动态效果支持。
- **发布检查**：行为测试、静态产物校验和 Chromium 浏览器验收纳入 GitHub Actions。

## 开始

使用 Node.js 22.22.2+（22.x）或 24.15+（24.x）；本轮验证环境为 Node.js 24.18.0。

```bash
npm ci
npm run dev
```

打开终端打印的地址，默认是 `http://localhost:5173/webcreat/`。

```bash
npm run new:post -- my-first-note
```

编辑生成的 `src/content/posts/my-first-note.md`。完成后将 `draft: true` 改为 `false`；开发服务会重新生成内容。完整字段与维护约定见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 检查与预览

依次运行：

```bash
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm run preview
```

构建产物在 `dist/`。浏览器检查自动启动并关闭本地静态服务，截图和报告默认写入 `test-results/`。Linux 首次安装浏览器可使用 `npx playwright install --with-deps chromium`。

## 目录

```text
src/
├── config/site.ts        # 站点地址、标题与作者信息
├── content/posts/        # Markdown 原文和元数据
├── generated/            # 自动生成的文章、索引；不提交
├── components/           # 布局、搜索、卡片和画布
├── pages/                # 首页、文章、项目、关于
├── data/                 # 文章索引入口与预置项目
├── hooks/                # GitHub 同步
├── lib/                  # 路由、内容加载、搜索、安全、缓存
└── entry-server.tsx      # 构建时静态渲染入口
scripts/                  # 内容校验、新文章、预渲染、产物校验
tests/                    # 行为测试与浏览器验收
```

## 文档

- [运行和部署](./RUN.md)
- [写作和贡献](./CONTRIBUTING.md)
- [架构与维护交接](./PROJECT_HANDOVER.md)
- [验收记录及验证边界](./TEST_REPORT.md)
- [同类项目调研与采用理由](./RESEARCH_NOTES.md)

默认站点地址为 `https://democard.github.io/webcreat/`，资源前缀由 `src/config/site.ts` 推导。修改域名或仓库路径后必须重新构建。GitHub Pages 工作流在推送到 main/master 后先检查再发布；本轮维护尚未提交、推送或更新线上版本。
