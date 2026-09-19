# 本地运行与发布

## 环境

在项目根目录操作；本机项目位于 D:/webcreat。使用 Node.js 22.22.2+（22.x）或 24.15+（24.x）和 npm。本轮实测 Node.js 24.18.0；依赖由 package-lock.json 锁定。

## 安装和开发

```powershell
npm ci
npm run dev
```

默认开发地址为 http://localhost:5173/webcreat/。端口占用时以终端输出为准。开发启动先校验并生成文章内容；编辑 src/content/posts/*.md 后自动更新。元数据无效时会报告出错文件和字段。

公开 GitHub 数据无需密钥。网络不可用时，本地文章和预置项目仍可浏览。

## 回归检查和生产构建

按顺序运行，避免同时写入自动生成的文章目录：

```powershell
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

- npm test：内容、路由、搜索、阅读、Markdown 清理、GitHub 缓存/请求和动画生命周期。
- npm run build：生成文章 → TypeScript 检查 → Vite 构建 → 静态页面、RSS、sitemap → 检查内部链接、资源和页面元数据。
- npm run test:browser：使用刚构建的 dist，自动启停临时服务，执行桌面和手机尺寸的 Chromium 检查；报告与截图位于 test-results/。
- npm run test:watch：持续运行行为测试。修改 Markdown 后建议重新启动测试命令以生成内容。

Linux 的浏览器系统依赖可用 npx playwright install --with-deps chromium 安装。
浏览器检查需要 Chromium 已安装；普通开发和构建不需要启动浏览器。可通过 WEBCREAT_ARTIFACT_DIR 指定验收产物位置。
浏览器验收从构建后首页的 canonical 地址读取服务前缀，自动适配站点配置。

## 生产预览

```powershell
npm run preview
```

默认地址 http://localhost:4173/webcreat/，以输出为准。按 Ctrl+C 停止。
使用 HTTP 服务预览，直接双击 dist/index.html 无法正确验证资源路径与路由。
内容或配置修改后重新构建，再查看生产预览。

## 发布配置

统一站点配置位于 src/config/site.ts。site.url 应为带结尾斜杠的完整公开地址；目前是 https://democard.github.io/webcreat/。它决定资源前缀、文章地址、canonical、RSS 和 sitemap。

GitHub Pages 仓库站点沿用 /webcreat/ 子路径。构建会输出 blog/index.html、projects/index.html、about/index.html、posts/<slug>/index.html 和 404.html，无需依赖 404 跳转脚本来显示正常文章。旧 Hash 文章链接在浏览器启动后迁移到新路径。

推送到 main/master 或手动运行现有工作流会触发检查和部署。Pages 使用 GitHub Actions 作为发布来源，只有检查成功才上传 dist。更换为自定义域名时，修改 site.url、配置 Pages 域名和 DNS，并按托管要求维护 public/CNAME；之后重新构建。

RSS 地址为站点前缀下的 feed.xml，站点地图为 sitemap.xml。仓库子路径部署不生成无效的子目录 robots.txt；根路径部署时生成 robots.txt。

本轮代码已完成本地验收，尚未提交或推送；远程 GitHub Actions 与线上发布效果未在本轮执行。
