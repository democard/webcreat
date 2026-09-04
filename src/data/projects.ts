import { Project } from "../types/blog";

// 本地离线与兜底数据：包含核心开源项目完整元数据
export const projectsData: Project[] = [
  {
    id: "webcreat",
    title: "webcreat",
    description: "极简、现代化、高性能的开源个人博客与技术作品集",
    tags: ["TypeScript", "React", "TailwindCSS"],
    githubUrl: "https://github.com/democard/webcreat",
    demoUrl: "https://democard.github.io/webcreat/",
    stars: 0,
    forks: 0,
    updatedAt: "2026-08-31",
    featured: true,
  },
  {
    id: "xmu_assistant",
    title: "xmu_assistant",
    description: "厦门大学 LNT / TronClass 双端助手 —— Windows 桌面端 + Android 原生端，签到、课件、课表、成绩、考试安排一站搞定。",
    tags: ["Kotlin", "Jetpack Compose", "PySide6", "Python"],
    githubUrl: "https://github.com/democard/xmu_assistant",
    stars: 0,
    forks: 0,
    updatedAt: "2026-08-29",
    featured: true,
  }
];