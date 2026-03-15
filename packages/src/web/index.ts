export * from "../core"
export { createTeleporter } from "./create-teleporter"
export { portalAdapter } from "./portal-adapter"

// Default singleton — pre-configured with the web portal adapter.
// Use these for the common case (one overlay tree per app).
// For multiple isolated trees or advanced usage, use createOverlayProvider() directly.
import { createOverlayProvider } from "../core"
import { portalAdapter } from "./portal-adapter"

const defaultProvider = createOverlayProvider(portalAdapter)

export const overlay = defaultProvider.overlay
export const OverlayProvider = defaultProvider.OverlayProvider
export const OverlaySlot = defaultProvider.OverlaySlot
export const useOverlay = defaultProvider.useOverlay
export const useCurrentOverlay = defaultProvider.useCurrentOverlay
export const useOverlayData = defaultProvider.useOverlayData
export const useOverlayState = defaultProvider.useOverlayState
