import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**", "src/hooks/**", "src/components/**", "scripts/content.ts"],
      exclude: ["src/data/emblemPoints*", "src/generated/**", "**/*.d.ts"],
      thresholds: {
        statements: 50,
        branches: 60,
        functions: 65,
        lines: 45,
      },
    },
  },
});
