import { Post } from "../types/blog";

export const postsData: Post[] = [
  {
    id: "building-xmu-assistant-engineering-retrospective",
    slug: "building-xmu-assistant-engineering-retrospective",
    title: "从痛点到双端落地：一个校园助手的工程实战与思考",
    summary: "为了解决大学日常中平台分散、通知不及时和课件整理繁琐的困扰，我用 Python/PySide6 与 Kotlin/Jetpack Compose 打造了一款双端校园助手。这是一份关于协议分析、算法求解、移动端架构与开源致谢的真实手记。",
    date: "2026-08-31",
    readTime: "8 min read",
    tags: ["实战复盘", "Kotlin", "Python", "架构设计", "开源思考"],
    featured: true,
    content: `
# 从痛点到双端落地：一个校园助手的工程实战与思考

在大学校园里，教学与教务往往被割裂在多个独立的信息系统中：
- **学习平台（TronClass / LNT）**：签到任务时效性极强，且课件往往分散在各个层级的章节树中；
- **综合教务系统**：课表、成绩核算与期末考试安排分散在另一个入口，日常查询需要反复走统一身份认证。

当这些碎片化的流程成为每天的固定负担时，作为一名开发者，最自然的想法就是：**能否通过工程化的方式，构建一个统一、低侵入、真正高效的双端助手？**

于是，\`xmu_assistant\` 诞生了。

---

## 01. 桌面端：PySide6 打造轻量常驻工作台

最早动工的是 Windows 桌面端。它的定位很明确：**在 PC 上低占用常驻，提供可靠的状态轮询与课件聚合。**

我基于 **Python + PySide6 (Qt)** 进行了模块化架构设计：

### 接口协议梳理与定位算法
通过对平台网络协议的梳理，我们能够获取到当前课程的事件流。其中最有趣的是**雷达签到（地理位置校验）机制**：
平台并未直接下发目标基准坐标，但在提交候选位置时，接口会返回当前位置与目标点的 \`distance\`（距离偏差）。

在局部平面坐标系下，这本质上是一个经典的**几何圆相交（Trilateration）三边测量问题**：
利用两次已知坐标应答返回的偏差距离作为半径，联立求出解集交点，从而精确估算出签到基准中心点。

### 防抖策略与人性化设计
为了避免高频请求对服务器造成压力，桌面端设计了多层防御机制：
- **随机抖动延迟（10–30s）** 与作答门槛；
- **二维码签到仅做系统级弹窗提醒**，不执行自动化，确保合规与合理使用；
- 支持 **PushPlus 微信通知** 与 **QQ 邮箱（SMTP）** 离线兜底。

---

## 02. Android 端：Kotlin + Jetpack Compose 原生体验

桌面端稳定后，日常移动场景对便携性提出了更高要求。为了追求丝滑的响应速度与系统级集成，我选择采用 **100% 原生 Kotlin + Jetpack Compose (Material 3)** 构建 Android 端。

### 架构与并发调度
校园移动网络的特点是弱网切换频繁、易休眠。为此我在 Android 端实现了几项关键支撑：
1. **\`BoundedParallel.kt\`**：限制批量课件下载与接口拉取的并发通道，平滑流量脉冲；
2. **\`SessionHealthProbe\`**：多维度探测会话健康度（识别 401/403、重定向至统一登录域或登录表单特征），实现无感静默恢复；
3. **系统深度集成**：开发了**桌面今日课表 Widget 小组件**、**Quick Settings 控制中心快捷磁贴**，以及考试日程全屏强提醒。

---

## 03. 本地凭据安全与工程权衡

数据安全始终是个人工具类项目的红线：
- **Windows 桌面端**：使用 Windows 原生 **DPAPI (\`win32crypt\`)**，对保存在本地的 Cookie 进行当前用户级硬件密钥加密；
- **Android 原生端**：引入 **\`AndroidX Security (EncryptedSharedPreferences)\`** 保护敏感凭据；
- **免责声明与边界意识**：程序仅查询当前登录账号本人的授权数据，坚决不越界。

---

## 04. 致谢与开源传承 (Acknowledgments)

一个优秀的开源项目从来不是闭门造车的结果。在开发 \`xmu_assistant\` 的过程中，社区前人的探索为我提供了巨大的启发与帮助，在此特别致谢：

- 感谢 **[KrsMt-0113/XMU-Rollcall-Bot](https://github.com/KrsMt-0113/XMU-Rollcall-Bot)** 开源项目，其在签到轮询接口、数字码递归提取以及基于距离估算候选位置的思路，为本作提供了极高价值的参考；
- 感谢 **[KrsMt-0113/XMUFD](https://github.com/KrsMt-0113/XMUFD)** 项目在课件下载机制上的探索；
- 感谢 **requests、PySide6、OkHttp、Jetpack Compose、WorkManager、MockWebServer** 等优秀的开源基础设施。

---

## 05. 结语

从最初为了解决自身课业琐事的脚本，到如今涵盖双端架构、单元测试与发布流程的成熟工具，这个项目不仅是一次技术栈的横跨实践，更让我体会到了**用代码改善身边真实体验**的踏实与乐趣。

项目已基于 Apache-2.0 协议在 GitHub 开源，欢迎交流与指正。
`
  }
];