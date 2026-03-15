import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "ovan",
    },
    links: [
      {
        text: "GitHub",
        url: "https://github.com/haejunejung/ovan",
      },
    ],
  }
}
