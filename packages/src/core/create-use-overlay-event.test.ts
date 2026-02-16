import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { createUseOverlayEvent } from "./create-use-overlay-event"
import { createOverlay } from "./event"
import type { OverlayControllerLike } from "./types"

const mockController: OverlayControllerLike = () => null

describe("createUseOverlayEvent", () => {
  it("should subscribe to overlay events and receive open payload", () => {
    const overlay = createOverlay("test-id")
    const useOverlayEvent = createUseOverlayEvent("test-id")
    const openHandler = vi.fn()

    renderHook(() =>
      useOverlayEvent({
        open: openHandler,
        close: vi.fn(),
        unmount: vi.fn(),
        closeAll: vi.fn(),
        unmountAll: vi.fn(),
      }),
    )

    overlay.open(mockController, { overlayId: "custom-id" })

    expect(openHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        controller: mockController,
        overlayId: "custom-id",
        componentKey: expect.any(String),
      }),
    )
  })

  it("should receive close and unmount events", () => {
    const overlay = createOverlay("prefix-e2")
    const useOverlayEvent = createUseOverlayEvent("prefix-e2")
    const closeHandler = vi.fn()
    const unmountHandler = vi.fn()

    renderHook(() =>
      useOverlayEvent({
        open: vi.fn(),
        close: closeHandler,
        unmount: unmountHandler,
        closeAll: vi.fn(),
        unmountAll: vi.fn(),
      }),
    )

    overlay.close("id-1")
    expect(closeHandler).toHaveBeenCalledWith("id-1")

    overlay.unmount("id-2")
    expect(unmountHandler).toHaveBeenCalledWith("id-2")
  })
})
