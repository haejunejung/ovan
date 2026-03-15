import defaultMdxComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"
import { SandpackDemo } from "./sandpack-demo"
import { ExpoSnack } from "./expo-snack"

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    SandpackDemo,
    ExpoSnack,
    ...components,
  }
}
