export const site = {
  name: "democard",
  title: "个人技术空间与数字化实验室",
  description: "记录算法研究、系统设计与工程实践，分享开源项目和技术手记。",
  url: "https://democard.github.io/webcreat/",
  author: "democard",
  github: "https://github.com/democard",
  email: "democard666@gmail.com",
};

export const basePath = new URL(site.url).pathname.replace(/\/?$/, "/");
export const assetUrl = (path: string) => `${basePath}${path.replace(/^\//, "")}`;
export const absoluteUrl = (path = "") => new URL(path.replace(/^\//, ""), site.url).href;
