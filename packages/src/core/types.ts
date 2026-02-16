export interface OverlayControllerProps {
  /** Unique identifier assigned to this overlay instance. */
  overlayId: string
  /** Whether the overlay is currently in the "open" visual state. */
  isOpen: boolean
  /** Triggers the close transition. The overlay remains mounted until {@link unmount} is called. */
  close: () => void
  /** Removes the overlay from the component tree immediately. */
  unmount: () => void
}

export type OverlayAsyncControllerProps<T> = Omit<
  OverlayControllerProps,
  "close"
> & {
  /** Closes the overlay and resolves the pending promise with the given value. */
  close: (param: T) => void
  /** Closes the overlay and rejects the pending promise with the given reason. */
  reject: (reason?: unknown) => void
}

/**
 * A render function that receives {@link OverlayControllerProps} and returns
 * a renderable node.
 *
 * The return type is `unknown` rather than `ReactNode` so the core
 * module stays framework-agnostic.
 */
export type OverlayControllerLike = (props: OverlayControllerProps) => unknown

/**
 * Async variant of {@link OverlayControllerLike}.
 *
 * The controller receives `close(value)` and `reject(reason)` instead of
 * a void `close`, allowing the overlay to settle the promise returned
 * by `openAsync`.
 */
export type OverlayAsyncControllerLike<T> = (
  props: OverlayAsyncControllerProps<T>,
) => unknown

/**
 * Internal representation of a single overlay instance stored in state.
 */
export interface OverlayItem {
  /** Unique identifier for this overlay. */
  id: string
  /** Random key used to force React re-mounts when the same overlayId is reused. */
  componentKey: string
  /** Whether the overlay is in the "open" visual state (controls enter/exit animations). */
  isOpen: boolean
  /** Whether the overlay is currently mounted in the component tree. */
  isMounted: boolean
  /** The render function that produces the overlay's content. */
  controller: OverlayControllerLike
  /**
   * The slot that owns this overlay, determined by the nearest ancestor
   * `<OverlaySlot>` at open time.
   *
   * When `null`, the overlay falls back to the currently active slot (`activeSlotId`).
   */
  slotId: string | null
}

/**
 * Root state shape managed by the overlay reducer.
 */
export interface OverlayData {
  /** The overlayId of the topmost (most recently opened) overlay, or `null` if none are open. */
  current: string | null
  /** Ordered list of overlay ids reflecting their stacking order (oldest → newest). */
  overlayOrderList: string[]
  /** Map from overlayId to its full {@link OverlayItem} record. */
  overlayData: Record<string, OverlayItem>
}
