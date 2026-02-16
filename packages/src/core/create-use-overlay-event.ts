import { createUseExternalEvent } from "./create-use-external-event"
import { overlayEmitter } from "./overlay-emitter"
import type { OverlayControllerLike } from "./types"

export interface OverlayEventMap {
  /**
   * Fired when a new overlay should be added and opened.
   */
  open: (args: {
    controller: OverlayControllerLike
    overlayId: string
    componentKey: string
    slotId: string | null
  }) => void
  /** Fired to trigger the close transition for a specific overlay. */
  close: (overlayId: string) => void
  /** Fired to fully remove a specific overlay from the tree. */
  unmount: (overlayId: string) => void
  /** Fired to close every currently open overlay. */
  closeAll: () => void
  /** Fired to remove all overlays from the tree. */
  unmountAll: () => void
}

const OVERLAY_EVENT_NAMES = [
  "open",
  "close",
  "unmount",
  "closeAll",
  "unmountAll",
] as const satisfies (keyof OverlayEventMap)[]

export function createUseOverlayEvent(overlayId: string) {
  const prefix = `ovan-${overlayId}`
  return createUseExternalEvent<OverlayEventMap>(
    overlayEmitter,
    prefix,
    OVERLAY_EVENT_NAMES,
  )
}
