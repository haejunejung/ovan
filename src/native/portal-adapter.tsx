import type { ReactNode } from "react"
import { Portal, PortalHost, PortalProvider } from "react-native-teleport"
import type { OverlayHostAdapter } from "../core/overlay-host-adapter"

/** Re-export so app code can place PortalProvider where they want (e.g. above OverlayProvider for flexibility). */
export { Portal, PortalHost, PortalProvider }

/** Host name for overlay Portal. Export so apps can wrap the host (e.g. full-screen) and pass a custom adapter. */
export const OVERLAY_HOST_NAME = "overlay"

/** Adapter: PortalHost + Portal via react-native-teleport. No styles applied. */
export const portalAdapter: OverlayHostAdapter = {
  renderHost: <PortalHost name={OVERLAY_HOST_NAME} />,
  wrapOverlay: (node: ReactNode, key: string) => (
    <Portal key={key} hostName={OVERLAY_HOST_NAME} name={key}>
      {node}
    </Portal>
  ),
}
