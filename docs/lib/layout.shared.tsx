import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "hoyst",
    },
    links: [
      {
        text: "GitHub",
        url: "https://github.com/haejunejung/hoyst",
      },
    ],
  }
}
