import { defineConfig } from "rolldown"
import { dts } from "rolldown-plugin-dts"

export default defineConfig([
  {
    input: { index: "src/web/index.ts" },
    external: ["react", "react-dom"],
    plugins: [dts()],
    output: {
      dir: "dist/web",
      format: "esm",
    },
  },
  {
    input: { index: "src/native/index.ts" },
    external: ["react", "react-native", "react-native-teleport"],
    plugins: [dts()],
    output: {
      dir: "dist/native",
      format: "esm",
    },
  },
])
