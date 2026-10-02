# 文档导航

项目首页见 [README](../README.md)。下列命令指南都以**仓库根目录**为工作目录。

| 需要做什么 | 入口 |
| --- | --- |
| 安装、开发、检查、预览与部署 | [运行指南](RUN.md) |
| 写文章、修改页面与提交改动 | [贡献指南](../CONTRIBUTING.md) |
| 理解内容生成、路由与静态渲染 | [架构与交接记录](PROJECT_HANDOVER.md) |
| 查阅此前采用方案的理由 | [调研记录](RESEARCH_NOTES.md) |
| 查阅此前测试结果和验证边界 | [历史验收记录](TEST_REPORT.md) |

## 目录职责

- `src/`：网站源码和 Markdown 文章；自动生成的 `src/generated/` 不提交。
- `public/`：需要随网站发布的静态资源，图片可以正常加入版本管理。
- `scripts/`：内容处理、预渲染与产物校验脚本。
- `tests/`：行为测试和浏览器验收。
- `docs/`：项目文档；根目录保留 README、贡献指南和许可证。
- `.github/workflows/`：拉取请求检查和 GitHub Pages 发布流程。

`node_modules/`、`dist/`、`test-results/`、`coverage/` 均为本地依赖或生成产物，不提交。生成新覆盖率报告使用 `npm run test:coverage`，输出为 `test-results/coverage/index.html`。以前提交的覆盖率快照保留在 Git 历史中。

架构、调研和验收文档包含历史日期、旧测试数量与当时的提交状态；这些记录不代表当前提交已测试或已部署。判断当前状态时，结合源码、当前检查结果和 [GitHub Actions](https://github.com/democard/webcreat/actions)。
