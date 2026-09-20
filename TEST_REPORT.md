# webcreat 验收记录

最近复验：2026-09-19。项目：D:/webcreat。本报告对应当前本地源码和生产构建。

## 依赖安装

使用 npm 锁文件完成依赖安装，Node.js 24.18.0。`npm audit` 未发现已知漏洞。marked、dompurify、highlight.js 已从 dependencies 移至 devDependencies（仅构建期使用，不在客户端 bundle 中）。

Chromium 已在本机安装，浏览器验收通过 playwright-chromium 执行。CI 配置为 Node.js 22，先 npm ci，再安装 Chromium 与所需系统依赖。

## 服务启动

生产浏览器检查自动启动绑定 127.0.0.1 的临时静态 HTTP 服务，以 /webcreat/ 提供 dist。每轮结束关闭浏览器、上下文及服务。没有为本轮验收保留后台服务。

本地开发使用 npm run dev；生产预览使用 npm run preview。静态文章直接请求和刷新均返回完整页面，无 JavaScript 场景也完成导航。

## 功能验证

| 检查 | 结果 |
| --- | --- |
| npm test | 7 个测试文件，40 项通过 |
| npm run build | TypeScript、Vite、静态渲染及产物校验通过 |
| 静态页面 | 8 页通过标题、链接、资源和元数据检查 |
| npm run test:browser | 12/12 组通过 |
| 浏览器运行时 | 未捕获页面异常或 React hydration 错误 |
| axe 自动规则 | 6 个受检页面/弹窗状态均无违规项 |
| npm audit | 0 漏洞 |
| 产物体积预算 | 主 JS gzip 67,946 bytes ≤ 80,000 bytes |
| 测试覆盖率 | statements 56.17% / branches 66.82% / functions 74.14% / lines 54.45% |

行为测试覆盖内容格式和有效日期、草稿字段、阅读时长、路由、全文搜索、复制成功/失败、Markdown 内容清理、缓存和请求生命周期、动画调度、GitHub API 成功路径与降级。构建会额外执行地址唯一性校验并排除草稿，静态产物逐篇核对生成正文、og:image 绝对 URL、.nojekyll 存在性和 gzip 体积预算。

12 组浏览器验收：
1. 桌面首页布局和狼首画布透明性。
2. 首页自动无障碍检查。
3. 原生搜索弹窗 Tab 循环、关闭焦点恢复、正文关键词搜索和 Enter 打开。
4. 文章直接访问与刷新、目录焦点、文章链接和代码复制。
5. 文章自动无障碍检查。
6. 旧 Hash 链接迁移、相邻文章和浏览器后退。
7. 文章标签筛选在刷新后恢复，以及清除筛选。
8. GitHub 不可用时的项目回退、搜索空状态、仓库链接。
9. 真实 404 响应、页面提示和 noindex 元数据。
10. 手机尺寸各路由无整页横向溢出，搜索及阅读布局可用。
11. 关闭 JavaScript 时文章列表仍可进入，三篇正文完整可读且相邻链接可用。
12. 检查捕获的运行时与 hydration 错误列表为空。

视口：桌面 1440×1000；手机模拟 390×844、像素比 2。axe 使用 wcag2a、wcag2aa、wcag21aa 标签。

## 性能优化记录（2026-09-19 本轮）

### 产物体积

| chunk | raw | gzip | 用途 |
| --- | --- | --- | --- |
| index-C0izskWc.js | 212,758 B | 67,946 B | 主入口（React + 路由 + 组件） |
| emblem-data-Be8EHu4f.js | 63,091 B | 6,811 B | 狼首粒子数据（长效缓存） |
| PostDetail-VcBt0mBd.js | 8,891 B | 3,574 B | 文章阅读组件（懒加载） |
| search-B-3wZ5EA.js | 10,289 B | 6,252 B | 搜索索引（懒加载） |
| index-BTF0Kmjx.css | 34,272 B | 7,261 B | Tailwind 样式 |
| PostDetail-BEHUn5zE.css | 1,316 B | 617 B | 文章阅读样式 |

文章专属 chunk（按需加载，不计入主 bundle 预算）：

| chunk | raw | gzip |
| --- | --- | --- |
| building-xmu-assistant-engineering-retrospective-20-fPQNo.js | 6,131 B | 3,129 B |
| canvas-fluid-emblem-physics-and-dark-ui-Dp6C7mbB.js | 5,618 B | 2,680 B |
| zero-bloat-modern-frontend-architecture-DfCXofre.js | 5,424 B | 2,616 B |

主 JS gzip 从 76,839 bytes 降至 67,946 bytes（↓11.6%），通过 manualChunks 将 emblemPoints 拆为独立长效缓存 chunk。

### 体积预算门禁

`scripts/check-build.ts` 新增 gzip 体积断言：主入口 JS ≤ 80,000 bytes。超限则构建失败，防止未来回退。

### 评估后跳过的项目

| 项 | 理由 |
| --- | --- |
| emblemPoints 动态 import | gzip 仅 ~7 KB，收益不足以抵消视觉契约路径改动风险 |
| emblemPoints 字典编码 | 复杂度高，收益 ~5 KB gzip |
| ESLint / Prettier | TS strict 已覆盖，项目规模小，新增工具链收益不明确 |
| 自托管字体 | 改动面大，影响视觉呈现，Google Fonts 当前工作正常 |
| Lighthouse CI | GitHub Pages 环境分数波动大，易误阻断 |
| Firefox / WebKit 自动化 | CI 时间翻倍，需 ~400 MB 额外下载 |
| GitHub API 真实调用测试 | Rate limit 风险，已有 mock 覆盖成功/降级路径 |
| logo.png 压缩/转 WebP | 第三方 OG 图 WebP 支持不一致 |
| Service Worker / PWA | 纯静态站无离线需求 |
| GitHub API SWR 改造 | 现有 30min TTL + stale-on-error 实现已完善 |

## 修复记录

本轮修复并复验了搜索弹窗 Tab 边界、灰色小字对比度、无 JavaScript 图腾资源路径，以及静态 HTML 与客户端初始化一致性相关问题。产物校验改为核对实际生成正文，支持没有章节目录的短文；浏览器验收自动读取部署前缀。完成 Markdown 文件迁移和静态路径升级，保留旧链接兼容。

2026-09-19 复查继续修复了四个边界：历史文章 id 统一迁移到可刷新的 canonical slug；搜索结果跳转后焦点保留在新页面正文；无 JavaScript 的文章列表不再被交互样式隐藏；目录点击会写入可分享的章节锚点。404 页面不再输出 WebSite JSON-LD。TypeScript 已启用未使用局部变量和参数检查，并清理失效回调与两个未使用依赖。

阅读器解析、清理和高亮移到构建阶段。

2026-09-19 增量优化轮：manualChunks 拆分 emblemPoints（主 JS gzip ↓11.6%）；构建期依赖分类修正（marked/dompurify/highlight.js → devDependencies）；check-build 扩展（体积预算 + og:image + .nojekyll 断言）；vitest 覆盖率配置与阈值（statements ≥50 / branches ≥60 / functions ≥65 / lines ≥45）；prerender 补充 twitter:image；GitHub API 成功路径测试 +2 项；文档口径与 Git 事实对齐；CONTRIBUTING 追加代码风格约定；RUN.md 追加跨浏览器抽查清单。

截图与详细浏览器 JSON 默认由验收命令写入 test-results/。

## 已知问题

- 验收使用 Chromium 手机模拟，未进行实体手机、Safari 或 Firefox 验收。RUN.md 已追加手动抽查清单。
- GitHub API 在浏览器验收中固定返回 503，以覆盖预置数据回退；网络成功和缓存边界另由行为测试验证（本轮新增 2 项成功路径用例），未据此声称在线 API 可用性。
- 为稳定截图，浏览器验收屏蔽外部字体样式，使用系统回退字体；未做外部字体真实加载和慢网性能量测。
- 分享文本、地址和元数据已验证（og:title/description/image/url/type/locale + twitter:card/title/description/image 全部完整），第三方平台的实际分享卡片展示尚未实测。
- 自动规则不能覆盖全部无障碍需求，也不构成完整 WCAG 认证。
- 本轮收尾修改（Phase 1–4）尚在工作区未提交；上一轮改动已提交（commit d25cb78）并推送至 origin/main。GitHub Actions deploy.yml 已触发部署流程。
