import { defineConfig } from "tsup"

export default defineConfig([
  {
    entry: { "web/index": "src/web/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    external: ["react", "react-dom"],
    outDir: "dist",
    clean: true,
  },
  {
    entry: { "native/index": "src/native/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    external: ["react", "react-native", "react-native-teleport"],
    outDir: "dist",
  },
])
