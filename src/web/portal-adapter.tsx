import type { ReactNode } from "react"
import type { OverlayHostAdapter } from "../core/overlay-host-adapter"
import { createTeleporter } from "./create-teleporter"

/** Host name for overlay (web: single host). Export so API matches react-native. */
export const OVERLAY_HOST_NAME = "overlay"

export const { Portal, PortalHost } = createTeleporter()

/**
 * Adapter for React DOM: PortalHost + Portal via createTeleporter (reactive host store).
 * Overlays are portaled into the host; host ref is synced so overlays re-render when host
 * changes (e.g. after navigation), matching react-native's PortalHost + Portal pattern.
 */
export const portalAdapter: OverlayHostAdapter = {
  renderHost: <PortalHost data-testid="overlay-host" />,
  wrapOverlay: (node: ReactNode, key: string) => (
    <Portal key={key}>{node}</Portal>
  ),
}
