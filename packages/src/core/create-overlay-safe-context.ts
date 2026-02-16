import type { Dispatch, ReactNode } from "react"
import { createSafeContext } from "./create-safe-context"
import type { OverlayReducerAction } from "./overlay-reducer"
import type { OverlayData } from "./types"

export type OverlayStateContextValue = OverlayData & {
  dispatch: Dispatch<OverlayReducerAction>
  activeSlotId: string | null
  registerSlot: (slotId: string) => void
  unregisterSlot: (slotId: string) => void
  wrapOverlay?: (node: ReactNode, key: string, isOpen?: boolean) => ReactNode
}

export function createOverlaySafeContext() {
  const [OverlayContextProvider, useOverlayContext] =
    createSafeContext<OverlayStateContextValue>("ovan/OverlayContext")

  function useCurrentOverlay() {
    return useOverlayContext().current
  }

  function useOverlayData() {
    const ctx = useOverlayContext()
    return {
      current: ctx.current,
      overlayOrderList: ctx.overlayOrderList,
      overlayData: ctx.overlayData,
    }
  }

  function useOverlayState() {
    return useOverlayContext()
  }

  return {
    OverlayContextProvider,
    useCurrentOverlay,
    useOverlayData,
    useOverlayState,
  }
}
