import type { ComponentType, Context, ReactNode } from "react"
import {
  Fragment,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
} from "react"
import type { OverlayStateContextValue } from "./create-overlay-safe-context"
import type { OverlayHostAdapter } from "./overlay-host-adapter"
import type { OverlayReducerAction } from "./overlay-reducer"
import type { OverlayControllerLike } from "./types"

/** Ref handle for OverlaySlot. User must call unregister() when appropriate (e.g. after exit animation). */
export interface OverlaySlotHandle {
  unregister: () => void
}

export interface CreateOverlaySlotDeps<T = unknown> {
  useOverlayState: () => OverlayStateContextValue
  SlotIdContext: Context<string | null>
  useOverlay: () => T
  wrapOverlay: NonNullable<OverlayHostAdapter["wrapOverlay"]>
  ContentOverlayController: ComponentType<{
    isOpen: boolean
    isMounted: boolean
    controller: OverlayControllerLike
    overlayId: string
    overlayDispatch: React.Dispatch<OverlayReducerAction>
  }>
}

export type OverlaySlotChildren<T> = ReactNode | ((overlay: T) => ReactNode)

/**
 * Creates the OverlaySlot component that consumes overlay state via the given hook.
 * Used by createOverlayProvider to keep the slot in a separate file.
 * Overlays belonging to this slot are rendered here (under the slot's React tree) and wrapped with wrapOverlay (e.g. Portal), so they inherit ancestor context (e.g. AContext) while still rendering into the host DOM.
 * Children may be ReactNode or (overlay) => ReactNode; the render-prop receives the slot-scoped overlay API so open() uses this slot's context without calling useOverlay() in a child.
 */
export function createOverlaySlot<T = unknown>(deps: CreateOverlaySlotDeps<T>) {
  const {
    useOverlayState,
    SlotIdContext,
    useOverlay,
    wrapOverlay,
    ContentOverlayController,
  } = deps

  function SlotContent({ children }: { children: OverlaySlotChildren<T> }) {
    const overlay = useOverlay()
    return typeof children === "function" ? children(overlay) : children
  }

  function SlotOverlayList() {
    const slotId = useContext(SlotIdContext)
    const {
      overlayOrderList,
      overlayData,
      dispatch: overlayDispatch,
      wrapOverlay: wrap,
    } = useOverlayState()
    const wrapNode = wrap ?? wrapOverlay
    const list =
      slotId == null
        ? []
        : overlayOrderList.filter((id) => overlayData[id]?.slotId === slotId)
    if (list.length === 0) {
      return null
    }
    return (
      <>
        {list.map((item) => {
          const data = overlayData[item]
          if (!data) {
            return <Fragment key={item} />
          }
          const {
            id: currentOverlayId,
            componentKey,
            isOpen,
            isMounted,
            controller: Controller,
          } = data
          const node = (
            <ContentOverlayController
              isOpen={isOpen}
              isMounted={isMounted}
              controller={Controller}
              overlayId={currentOverlayId}
              overlayDispatch={overlayDispatch}
            />
          )
          return (
            <Fragment key={componentKey}>
              {wrapNode(node, componentKey, isOpen)}
            </Fragment>
          )
        })}
      </>
    )
  }

  return ({
    ref,
    children,
  }: {
    ref?: React.RefObject<OverlaySlotHandle | null>
    children?: OverlaySlotChildren<T>
  }) => {
    const slotId = useId()
    const { registerSlot, unregisterSlot } = useOverlayState()

    useEffect(() => {
      registerSlot(slotId)
      return () => unregisterSlot(slotId)
    }, [slotId, registerSlot, unregisterSlot])

    useImperativeHandle(
      ref,
      () => ({ unregister: () => unregisterSlot(slotId) }),
      [unregisterSlot, slotId],
    )

    return (
      <SlotIdContext.Provider value={slotId}>
        <SlotContent>{children}</SlotContent>
        <SlotOverlayList />
      </SlotIdContext.Provider>
    )
  }
}
