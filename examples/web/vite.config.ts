import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packagesDir = path.resolve(__dirname, "../../packages")

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ovan/core": path.join(packagesDir, "core/src"),
      "@ovan/react": path.join(packagesDir, "react/src"),
    },
  },
  server: {
    port: 5173,
  },
})
