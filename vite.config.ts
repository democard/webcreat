import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { basePath } from "./src/config/site";
import { generateContent } from "./scripts/content";

export default defineConfig({
  plugins: [react(), {
    name: "article-content",
    configureServer(server) {
      let pending: ReturnType<typeof setTimeout>;
      const update = (file: string) => {
        if (!file.replace(/\\/g, "/").includes("/src/content/posts/")) return;
        clearTimeout(pending);
        pending = setTimeout(() => {
          generateContent().then(() => server.ws.send({ type: "full-reload" }))
            .catch((error) => {
              server.config.logger.error(String(error));
              server.ws.send({ type: "error", err: { message: String(error), stack: "", plugin: "article-content" } });
            });
        }, 100);
      };
      server.watcher.on("add", update).on("change", update).on("unlink", update);
      server.httpServer?.once("close", () => { clearTimeout(pending); server.watcher.off("add", update).off("change", update).off("unlink", update); });
    },
  }],
  base: basePath,
  build: { manifest: true },
  server: {
    port: 5173,
    host: true
  }
});
