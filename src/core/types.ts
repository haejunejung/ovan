import type { ComponentType } from "react"

export type OverlayId = string

export type OverlayControllerLike = (props: OverlayControllerProps) => unknown

export type OverlayAsyncControllerLike = <T>(
  props: OverlayAsyncControllerProps<T>,
) => unknown

export interface OverlayOptions {
  overlayId?: OverlayId
  componentKey?: string
  slotId?: string
}

export interface OverlayControllerProps {
  overlayId: string
  isOpen: boolean
  close: () => void
  unmount: () => void
}

export interface OverlayAsyncControllerProps<T>
  extends Omit<OverlayControllerProps, "close"> {
  close: (value: T) => void
  reject: (reason: unknown) => void
}
