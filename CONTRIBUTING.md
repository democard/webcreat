# 写作与贡献指南

## 开始

1. 创建修改分支，使用 README 中的 Node.js 版本并运行 npm ci。
2. 运行 npm run dev，访问输出的 /webcreat/ 地址。
3. 修改后按 RUN.md 顺序运行行为测试、构建和浏览器验收。
4. 在 Pull Request 中说明具体问题、修改后的行为和验证结果。

## 新增文章

```bash
npm run new:post -- my-article-slug
```

命令创建 src/content/posts/my-article-slug.md，不会覆盖已有文件。初始文章为草稿，草稿不进入页面、全文索引、RSS 或 sitemap。

文件示例：

```yaml
---
slug: my-article-slug
title: 一篇清晰的技术手记
summary: 用一两句话说明读者可以获得什么。
date: 2026-09-07
tags:
  - 工程实践
featured: false
draft: true
---
```

在第二个分隔线后写 Markdown 正文；完成后改为 draft: false。标题、摘要、发布日期、slug 和非空标签列表必填。可选 updated 必须为有效日期且不早于发布日期；需要兼容历史文章标识时可设置字符串 id。slug 只能使用小写字母、数字与单个连接短横线，id 和 slug 在全部文章（含草稿）中保持唯一。

文件保存时进行校验。错误日期、重复地址、空正文和类型不正确的字段会阻止构建。阅读时长从清理后的正文估算，不需手写。草稿同样需要通过元数据校验。

不要手工编辑 src/generated/ 或 src/data/posts.ts 来添加正文。src/generated/ 由命令生成，不提交 Git。站点主标题由文章元数据生成，正文使用 ## / ### 建立层级目录；章节定位由构建器生成。

发布后尽量保持 slug 不变，否则已分享的新路径会失效。现有兼容逻辑用于历史 Hash 链接，不是任意文章重命名的重定向表。

## 页面和数据

- 预置项目：src/data/projects.ts；网络数据来自公开 GitHub API。
- 站点地址和作者信息：src/config/site.ts；更改公开地址后必须重建。
- 页面和组件：src/pages、src/components，复用现有 Tailwind 与 Lucide 图标。
- 内部导航：使用 InternalLink、routeHref 或 postHref，避免散落硬编码子路径。
- 内容、路由、搜索、请求：放在 src/lib、scripts 或对应 Hook。为真实故障与边界行为添加回归检查。

## 必须保留的约定

- 静态 HTML 与客户端首次渲染一致，避免加载时丢失正文或出现 hydration 错误。
- 文章 HTML 先清理再进入页面；未知代码语言作为纯文本处理。
- 使用原生链接、按钮和 dialog，支持键盘、页面缩放及减少动态效果。
- 狼首画布用 clearRect 透明清空，保留 1,807 个采样点、粒子半径 1.85、scale 0.54 和 Hero 6:6 布局。
- GitHub 请求可取消且有超时，缓存损坏或限流不能破坏文章与项目回退展示。
- 剪贴板反馈以实际结果为准，失败时提供手动复制提示。
- 不提交凭证、node_modules、dist、src/generated 和临时验收产物。
