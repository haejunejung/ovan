import { defineConfig } from "vitest/config"

export default defineConfig({
  root: __dirname,
  resolve: {
    preserveSymlinks: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
