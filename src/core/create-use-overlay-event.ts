import { createUseExternalEvent } from "./create-use-external-event"
import { eventEmitter } from "./event-emitter"
import { getPrefix } from "./get-prefix"
import type { OverlayControllerLike, OverlayId } from "./types"

type OverlayEventMap = {
  open: (args: {
    controller: OverlayControllerLike
    overlayId: OverlayId
    componentKey: string
    slotId: string | null
  }) => void
  close: (overlayId: OverlayId) => void
  unmount: (overlayId: OverlayId) => void
  closeAll: () => void
  unmountAll: () => void
}

const OVERLAY_EVENT_NAMES = [
  "open",
  "close",
  "unmount",
  "closeAll",
  "unmountAll",
] as const satisfies (keyof OverlayEventMap)[]

export const createUseOverlayEvent = (overlayId: OverlayId) => {
  const prefix = getPrefix(overlayId)

  return createUseExternalEvent<OverlayEventMap>(
    eventEmitter,
    prefix,
    OVERLAY_EVENT_NAMES,
  )
}
