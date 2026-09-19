# democard.dev 项目交接

最近复验：2026-09-19。源码和当前验收结果是事实依据。

## 项目定位

个人技术博客与开源作品集，工作目录 D:/webcreat。保留 React 18 / TypeScript / Vite / Tailwind 和 GitHub Pages；透明狼首、星尘背景与暗色视觉延续原设计。

本轮引入构建时内容处理与页面预渲染：静态托管即可提供完整正文、独立文章地址和元数据，浏览器加载后增强搜索、复制、筛选、动态项目及画布。

## 内容和构建

1. src/content/posts/*.md 保存正文和 YAML 元数据。
2. scripts/content.ts 验证字段、日期、slug/id 唯一性，排除草稿，使用 Marked、DOMPurify、highlight.js 与 JSDOM 生成安全 HTML、目录、阅读时长和全文索引。
3. src/generated/index.json 保存文章元数据；posts/*.json 保存正文；search.json 保存全文。均为忽略提交的生成产物。
4. src/data/posts.ts 导出元数据；src/lib/content.ts 按需加载正文和搜索索引。
5. Vite 构建浏览器资源；scripts/prerender.ts 通过 src/entry-server.tsx 渲染 8 个静态页面，并生成 feed.xml、sitemap.xml、.nojekyll。
6. scripts/check-build.ts 检查静态标题、元数据、结构化数据、内部链接/资源、文章内容、目录、404 和订阅文件。

浏览器不再承担 Markdown 解析、安全清理和代码高亮。直接访问文章时，main.tsx 复用静态正文并加载阅读组件后 hydrateRoot；客户端跳转按需加载正文。解析器仍是构建和测试依赖，不能随意删除。

开发服务监听 Markdown 变更，重新生成内容；无效内容显示错误。不要并行启动会写入 src/generated 的命令。

## 路由与元数据

统一配置在 src/config/site.ts，当前地址 https://democard.github.io/webcreat/，对应资源前缀 /webcreat/。

- 首页：/webcreat/
- 文章列表：/webcreat/blog/
- 项目：/webcreat/projects/
- 关于：/webcreat/about/
- 文章：/webcreat/posts/<slug>/

src/lib/routes.ts 解析路径、提供导航与链接，继续识别旧 #/ 路由和文章 id。App 启动后把历史 id 解析为 canonical slug，再将旧链接 replaceState 为可刷新的新路径。普通章节 #article-section-* 保留目录含义，目录点击同步更新章节锚点。真实锚链接支持无 JavaScript 导航和新标签页；客户端通过 pushState、popstate 与 app:navigate 同步。

src/lib/metadata.ts 统一标题、描述、canonical、Open Graph、Twitter 和文章 JSON-LD；静态构建与客户端导航复用。404 使用 noindex。分享图复用现有 logo.png；第三方平台的实际卡片展示尚未实测。

目前的静态页面数是 8，随已发布文章数量变化。更换域名或子路径需要重建；浏览器验收从构建首页读取对应服务前缀。

## 搜索、阅读和列表

全局 SearchModal 使用原生 dialog。打开后才加载全文索引；标题、标签、摘要、正文参与排序，支持多词匹配、摘要片段、关键词高亮和键盘选择。索引加载失败时仍能搜索元数据。关闭弹窗恢复焦点和页面滚动。

PostDetail 提供桌面侧栏目录、手机折叠目录、阅读进度、章节焦点定位、复制/分享、相邻文章和加载重试。代码语言支持范围由 src/lib/markdown.ts 的显式导入决定；未知语言安全显示为纯文本。正文 16px，表格和代码块允许横向滚动，整页不应溢出。

BlogList 支持文本与标签筛选，状态写入查询参数并可刷新恢复；提供 RSS 入口。Projects 提供文本、项目类型和排序筛选、空状态及主动刷新。共用 ProjectCard 使用独立仓库/演示链接，避免嵌套锚点。

## GitHub 数据

读取最近 30 个公开仓库并过滤 fork。先显示仓库字段，再以最多 4 个并发请求补充根目录 README.md；使用 API 返回的 default_branch。

每个请求含响应体读取最长 8 秒，卸载时中止。缓存按用户名隔离，有效期 30 分钟；有效空列表也缓存。过期缓存可在网络失败时继续显示，localStorage 不可用和损坏缓存安全降级。手动刷新绕过有效缓存。

SSR 与客户端首次渲染都使用预置项目，挂载后应用缓存/网络结果以保持一致。项目页显示加载和数据来源。其他 README 文件名/位置使用仓库原始描述回退。

## 视觉与动画

狼首保持 clearRect 透明，禁止 fillRect 背景。1,807 个采样点、粒子半径 1.85、scale 0.54、Hero 6:6 栅格不变。ResizeObserver 响应容器变化，触摸结束/取消复位。

两张画布在页面后台暂停，狼首屏外暂停；遵循 prefers-reduced-motion。关闭 JavaScript 时显示静态图腾。提高灰色小字对比度，统一项目卡片、文章列表、搜索与阅读页间距。

## 验证与发布

本轮 7 个文件中的 38 项行为测试、生产构建与 8 页静态校验、12 组 Chromium 浏览器验收通过。浏览器覆盖 1440×1000 桌面和 390×844 手机模拟视口；检查页面溢出、搜索焦点、刷新、旧链接、目录、复制、筛选、404、无 JavaScript 列表与阅读及 React 运行时错误。

6 个页面/弹窗状态通过所选 axe 规则检查。不是完整无障碍认证，也未覆盖实体手机、Safari/Firefox、真实慢网性能或第三方分享卡片。

GitHub API 在浏览器验收中模拟 503，验证回退；Google Fonts 用空样式响应保证截图稳定。详见 TEST_REPORT.md。CI 已配置同样的检查流程，但尚未远程执行。

本轮没有提交、推送或部署。后续维护入口：RUN.md、CONTRIBUTING.md、tests/、RESEARCH_NOTES.md。
