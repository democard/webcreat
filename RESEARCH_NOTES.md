# 同类项目调研与采用记录

调研日期：2026-09-07。目标是提升现有个人博客的阅读、维护与发布质量。

## 参考资料和对应改进

| 官方项目或文档 | 参考经验 | 在 webcreat 的采用方式 |
| --- | --- | --- |
| [AstroPaper](https://github.com/satnaing/astro-paper) | 成熟博客将内容校验、搜索、草稿、订阅与可访问性作为基础能力 | 引入独立 Markdown、构建校验、草稿、全文检索、RSS 与键盘验收 |
| [Tailwind Next.js Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) | 写作结构、列表检索、元数据和维护入口需要完整配套 | 统一文章元数据与配置，完善列表筛选、文章阅读及贡献文档 |
| [Google JavaScript SEO 基础](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) | 可抓取链接、真实路径与静态/预渲染内容有利于内容发现 | 为每篇文章生成 HTML 和独立 URL，补 canonical、描述和结构化数据 |
| [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) | 构建时验证内容结构可提前发现写作错误 | 在现有 Vite 项目中实现字段、日期、唯一地址与草稿校验 |

这些是设计参考；项目继续使用 React + Vite，没有引入 Astro 或 Next.js 运行时。独立静态文件适配现有 GitHub Pages，也让关闭 JavaScript 的读者可以正常阅读正文。

## 实际设计取舍

- Markdown 清理和代码高亮在构建阶段完成，减少读者浏览器的解析工作。每篇正文与全文搜索索引分别按需加载。
- 原生链接承载导航，原生 dialog 承载搜索；增补焦点循环与快捷键，保留无 JavaScript 阅读路径。
- 首页沿用作者的透明狼首和暗色风格；改进文字对比度、信息层级、项目卡片和移动阅读。
- GitHub 在线数据属于增强功能；本地内容和预置项目构成可靠的初始页面。
- 已经发布的文章保留原始工程叙述；架构变化处增加带日期的维护说明，避免历史代码被误认作当前实现。

## 验证依据

38 项行为测试、8 页静态产物检查和 12 组 Chromium 浏览器验收通过。自动无障碍检查、模拟网络与浏览器范围见 TEST_REPORT.md。

静态页面和元数据是可检查的实现结果；搜索排名、流量增长与第三方分享卡片表现尚无上线数据，未作效果承诺。
