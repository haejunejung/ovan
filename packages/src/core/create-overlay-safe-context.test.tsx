import { renderHook } from "@testing-library/react"
import type { Dispatch } from "react"
import { describe, expect, it } from "vitest"
import { createOverlaySafeContext } from "./create-overlay-safe-context"
import type { OverlayReducerAction } from "./overlay-reducer"

const mockDispatch: Dispatch<OverlayReducerAction> = () => {}

describe("createOverlaySafeContext", () => {
  it("useCurrentOverlay returns current from context", () => {
    const { useCurrentOverlay, OverlayContextProvider } =
      createOverlaySafeContext()

    const { result } = renderHook(() => useCurrentOverlay(), {
      wrapper: ({ children }) => (
        <OverlayContextProvider
          value={{
            current: "overlay-1",
            overlayOrderList: ["overlay-1"],
            overlayData: {},
            dispatch: mockDispatch,
            activeSlotId: null,
            registerSlot: () => {},
            unregisterSlot: () => {},
          }}
        >
          {children}
        </OverlayContextProvider>
      ),
    })

    expect(result.current).toBe("overlay-1")
  })

  it("useOverlayData returns current, overlayOrderList, overlayData", () => {
    const { useOverlayData, OverlayContextProvider } =
      createOverlaySafeContext()

    const overlayData = { "id-1": {} as never }
    const { result } = renderHook(() => useOverlayData(), {
      wrapper: ({ children }) => (
        <OverlayContextProvider
          value={{
            current: "id-1",
            overlayOrderList: ["id-1"],
            overlayData,
            dispatch: mockDispatch,
            activeSlotId: null,
            registerSlot: () => {},
            unregisterSlot: () => {},
          }}
        >
          {children}
        </OverlayContextProvider>
      ),
    })

    expect(result.current).toEqual({
      current: "id-1",
      overlayOrderList: ["id-1"],
      overlayData,
    })
  })

  it("useOverlayState returns full context value", () => {
    const { useOverlayState, OverlayContextProvider } =
      createOverlaySafeContext()
    const registerSlot = () => {}
    const unregisterSlot = () => {}

    const { result } = renderHook(() => useOverlayState(), {
      wrapper: ({ children }) => (
        <OverlayContextProvider
          value={{
            current: null,
            overlayOrderList: [],
            overlayData: {},
            dispatch: mockDispatch,
            activeSlotId: "slot-1",
            registerSlot,
            unregisterSlot,
          }}
        >
          {children}
        </OverlayContextProvider>
      ),
    })

    expect(result.current.activeSlotId).toBe("slot-1")
    expect(result.current.registerSlot).toBe(registerSlot)
    expect(result.current.unregisterSlot).toBe(unregisterSlot)
  })
})
