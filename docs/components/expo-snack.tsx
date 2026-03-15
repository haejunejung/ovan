"use client"

import { useEffect, useRef } from "react"

interface ExpoSnackProps {
  /** Expo Snack ID (e.g., "@username/snack-name" or a hash). */
  snackId: string
  /** Title shown above the embed. */
  title?: string
  /** Which platform preview to show by default. */
  platform?: "web" | "android" | "ios"
  /** Height of the embed in pixels. */
  height?: number
  /** Whether to show the preview panel. */
  preview?: boolean
  /** Whether the code is editable. */
  theme?: "light" | "dark"
}

export function ExpoSnack({
  snackId,
  title,
  platform = "web",
  height = 600,
  preview = true,
  theme = "dark",
}: ExpoSnackProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Load the Expo Snack embed script if not already loaded
    if (!document.querySelector('script[src*="snack.expo.dev"]')) {
      const script = document.createElement("script")
      script.src = "https://snack.expo.dev/embed.js"
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const params = new URLSearchParams({
    platform,
    preview: String(preview),
    theme,
  })

  return (
    <div className="not-prose my-6">
      {title && (
        <p className="mb-2 text-sm font-medium text-fd-muted-foreground">
          {title}
        </p>
      )}
      <div
        className="overflow-hidden rounded-lg border border-fd-border"
        style={{ height }}
      >
        <iframe
          ref={iframeRef}
          src={`https://snack.expo.dev/embedded/${snackId}?${params.toString()}`}
          title={title ?? "Expo Snack"}
          style={{
            width: "100%",
            height: "100%",
            border: 0,
          }}
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-scripts"
        />
      </div>
    </div>
  )
}
