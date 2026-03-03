import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // biome-ignore lint/suspicious/noExplicitAny: vite version mismatch between vitest and @vitejs/plugin-react
  plugins: [react() as any],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test-setup.ts"],
  },
});
