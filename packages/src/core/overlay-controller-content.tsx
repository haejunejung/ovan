import type { ComponentType, FC } from "react"
import { memo, useEffect } from "react"
import type { OverlayReducerAction } from "./overlay-reducer"
import type {
  OverlayAsyncControllerProps,
  OverlayControllerLike,
  OverlayControllerProps,
} from "./types"

export type {
  OverlayAsyncControllerProps,
  OverlayControllerProps,
} from "./types"

export type OverlayControllerComponent = FC<OverlayControllerProps>
export type OverlayAsyncControllerComponent<T> = FC<
  OverlayAsyncControllerProps<T>
>

interface ContentOverlayControllerProps {
  isOpen: boolean
  isMounted: boolean
  overlayId: string
  overlayDispatch: React.Dispatch<OverlayReducerAction>
  controller: OverlayControllerLike
}

export const ContentOverlayController = memo(
  ({
    isOpen,
    isMounted,
    overlayId,
    overlayDispatch,
    controller: Controller,
  }: ContentOverlayControllerProps) => {
    // Dispatch OPEN once on first mount so the overlay becomes visible.
    // Do not dispatch when remounting (e.g. after navigating to another slot and back) so closed overlays stay closed.
    useEffect(() => {
      if (isMounted) {
        return
      }
      requestAnimationFrame(() => {
        overlayDispatch({ type: "OPEN", overlayId })
      })
    }, [overlayDispatch, overlayId, isMounted])

    const Component = Controller as ComponentType<OverlayControllerProps>
    return (
      <Component
        isOpen={isOpen}
        overlayId={overlayId}
        close={() => overlayDispatch({ type: "CLOSE", overlayId })}
        unmount={() => overlayDispatch({ type: "REMOVE", overlayId })}
      />
    )
  },
)
