"use client"

interface ExpoSnackProps {
  /** Expo Snack ID (e.g., "@username/hoyst-demo"). */
  snackId: string
  /** Title shown above the embed. */
  title?: string
  /** Which platform preview to show by default. */
  platform?: "web" | "android" | "ios"
  /** Height of the embed in pixels. */
  height?: number
  /** Whether to show the preview panel. */
  preview?: boolean
  /** Theme of the editor. */
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
          src={`https://snack.expo.dev/embedded/${snackId}?${params.toString()}`}
          title={title ?? "Expo Snack"}
          style={{
            width: "100%",
            height: "100%",
            border: 0,
          }}
          // eslint-disable-next-line react/iframe-missing-sandbox -- Expo Snack requires both allow-scripts and allow-same-origin
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    </div>
  )
}
