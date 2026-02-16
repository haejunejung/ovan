import type { PropsWithChildren, ReactNode } from "react"
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"
import { createOverlaySafeContext } from "./create-overlay-safe-context"
import { createOverlaySlot } from "./create-overlay-slot"
import {
  createUseOverlayEvent,
  type OverlayEventMap,
} from "./create-use-overlay-event"
import { createOverlay } from "./event"
import { generateRandomId } from "./generate-random-id"
import { ContentOverlayController } from "./overlay-controller-content"
import type { OverlayHostAdapter } from "./overlay-host-adapter"
import { overlayReducer } from "./overlay-reducer"

export type {
  OverlaySlotChildren,
  OverlaySlotHandle,
} from "./create-overlay-slot"

const defaultAdapter: OverlayHostAdapter = {
  wrapOverlay: (node, _key, _isOpen): ReactNode => node,
}

/**
 * Creates overlay provider. All logic lives in core.
 * Pass adapter only to change "where to render" (e.g. Portal in react-native).
 */
/** Context set by each OverlaySlot so descendants get "nearest ancestor slot". Used by useOverlay().open(). */
const SlotIdContext = createContext<string | null>(null)

export const createOverlayProvider = (adapter?: OverlayHostAdapter) => {
  const { renderHost, wrapOverlay } = adapter ?? defaultAdapter
  const overlayId = generateRandomId()
  const overlay = createOverlay(overlayId)
  const useOverlayEvent = createUseOverlayEvent(overlayId)
  const {
    OverlayContextProvider,
    useCurrentOverlay,
    useOverlayData,
    useOverlayState,
  } = createOverlaySafeContext()

  function OverlayProvider({ children }: PropsWithChildren) {
    const [overlayState, overlayDispatch] = useReducer(overlayReducer, {
      current: null,
      overlayOrderList: [],
      overlayData: {},
    })
    const prevOverlayStateRef = useRef(overlayState)
    const slotStackRef = useRef<string[]>([])
    const [activeSlotId, setActiveSlotId] = useState<string | null>(null)

    const registerSlot = useCallback((slotId: string) => {
      slotStackRef.current = [...slotStackRef.current, slotId]
      setActiveSlotId(slotId)
    }, [])

    const unregisterSlot = useCallback((slotId: string) => {
      slotStackRef.current = slotStackRef.current.filter((id) => id !== slotId)
      const next = slotStackRef.current[slotStackRef.current.length - 1] ?? null
      setActiveSlotId(next)
    }, [])

    const open: OverlayEventMap["open"] = useCallback(
      ({ controller, overlayId: id, componentKey, slotId }) => {
        overlayDispatch({
          type: "ADD",
          overlay: {
            id,
            componentKey,
            isOpen: false,
            isMounted: false,
            controller,
            slotId: slotId ?? null,
          },
        })
      },
      [],
    )
    const close: OverlayEventMap["close"] = useCallback((id: string) => {
      overlayDispatch({ type: "CLOSE", overlayId: id })
    }, [])
    const unmount: OverlayEventMap["unmount"] = useCallback((id: string) => {
      overlayDispatch({ type: "REMOVE", overlayId: id })
    }, [])
    const closeAll: OverlayEventMap["closeAll"] = useCallback(() => {
      overlayDispatch({ type: "CLOSE_ALL" })
    }, [])
    const unmountAll: OverlayEventMap["unmountAll"] = useCallback(() => {
      overlayDispatch({ type: "REMOVE_ALL" })
    }, [])

    useOverlayEvent({ open, close, unmount, closeAll, unmountAll })

    // When an overlay is re-opened (same overlayId, was closed), dispatch OPEN after rAF so isMounted/isOpen stay in sync. ContentOverlayController only runs OPEN on initial mount.
    if (prevOverlayStateRef.current !== overlayState) {
      for (const id of overlayState.overlayOrderList) {
        const prevOverlayData = prevOverlayStateRef.current.overlayData
        const currOverlayData = overlayState.overlayData

        if (
          prevOverlayData[id] != null &&
          prevOverlayData[id].isMounted === true
        ) {
          const isPrevOverlayClosed = prevOverlayData[id].isOpen === false
          const isCurrOverlayOpened = currOverlayData[id]?.isOpen === true

          if (isPrevOverlayClosed && isCurrOverlayOpened) {
            requestAnimationFrame(() => {
              overlayDispatch({ type: "OPEN", overlayId: id })
            })
          }
        }
      }

      prevOverlayStateRef.current = overlayState
    }

    useEffect(() => {
      return () => {
        overlayDispatch({ type: "REMOVE_ALL" })
      }
    }, [])

    // Render only overlays with no slot (opened outside any slot). Overlays with a slotId are rendered by that slot so they inherit that slot's React tree (e.g. AContext).
    const overlaysToRender = overlayState.overlayOrderList.filter(
      (id) => overlayState.overlayData[id]?.slotId == null,
    )

    const overlayListContent =
      overlaysToRender.length > 0 &&
      overlaysToRender.map((item) => {
        const {
          id: currentOverlayId,
          componentKey,
          isOpen,
          isMounted,
          controller: Controller,
        } = overlayState.overlayData[item]
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
            {wrapOverlay(node, componentKey, isOpen)}
          </Fragment>
        )
      })

    const hostNode =
      typeof renderHost === "function" ? renderHost(null) : renderHost

    const contextValue = useMemo(
      () => ({
        ...overlayState,
        dispatch: overlayDispatch,
        activeSlotId,
        registerSlot,
        unregisterSlot,
        wrapOverlay,
      }),
      [overlayState, activeSlotId, registerSlot, unregisterSlot],
    )

    return (
      <OverlayContextProvider value={contextValue}>
        {children}
        {/* Host always at provider so overlays render full-screen (e.g. centered modal) regardless of which slot opened them */}
        {hostNode}
        {overlayListContent}
      </OverlayContextProvider>
    )
  }

  function useOverlay() {
    const slotId = useContext(SlotIdContext)
    return useMemo(
      () => ({
        ...overlay,
        open: (
          controller: Parameters<typeof overlay.open>[0],
          options?: Parameters<typeof overlay.open>[1],
        ) => overlay.open(controller, { ...options, slotId: slotId ?? null }),
      }),
      [slotId],
    )
  }

  const OverlaySlot = createOverlaySlot({
    useOverlayState,
    SlotIdContext,
    useOverlay,
    wrapOverlay,
    ContentOverlayController,
  })

  return {
    overlay: { ...overlay, useOverlayEvent },
    OverlayProvider,
    OverlaySlot,
    useOverlay,
    useCurrentOverlay,
    useOverlayData,
    useOverlayState,
  }
}
