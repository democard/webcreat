import React from "react";
import { routeHref } from "../../lib/routes";

export class ErrorBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="mx-auto max-w-xl space-y-4 p-8 text-slate-200">
      <h1 className="text-2xl font-bold">页面暂时没能加载</h1>
      <p className="text-slate-400">可以刷新重试，或回到首页继续浏览。</p>
      <div className="flex gap-4"><button onClick={() => window.location.reload()} className="rounded-lg bg-cyan-400 px-4 py-2 text-slate-950">刷新重试</button>
        <a href={routeHref({ tab: "home" })} className="px-4 py-2 underline">返回首页</a></div>
    </main>;
    return this.props.children;
  }
}
