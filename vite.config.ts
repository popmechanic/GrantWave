/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// React app + Vitest. convex-test and React Testing Library both run under jsdom;
// per-file `// @vitest-environment` comments can override if a Convex test needs it.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
});
