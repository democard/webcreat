# 贡献指南 (Contributing to DevPulse)

非常感谢你对 DevPulse 的关注与贡献！

## 开发流程

1. **Fork** 本仓库并 Clone 到本地。
2. 创建一个特性分支：`git checkout -b feature/awesome-tool`
3. 启动开发服务器：`npm run dev`
4. 添加你的新工具：
   - 在 `src/tools/` 目录下创建新组件
   - 在 `src/tools/index.ts` 注册该工具
5. 运行构建测试：`npm run build` 确保无 TypeScript 或样式报错。
6. 提交修改并推送到你的分支，在 GitHub 上发起 Pull Request。

## 代码风格
- 使用 TypeScript 严格模式进行类型标注。
- 使用 Tailwind CSS 编写高内聚的组件样式。
- 确保所有敏感运算在纯客户端执行，不发起未经用户许可的网络请求。
