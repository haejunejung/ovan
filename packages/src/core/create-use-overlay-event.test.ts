import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { createOverlay } from "./create-overlay"
import { createUseOverlayEvent } from "./create-use-overlay-event"
import { createOverlayEmitter } from "./overlay-emitter"
import type { OverlayControllerLike } from "./types"

const mockController: OverlayControllerLike = () => null

describe("createUseOverlayEvent", () => {
  it("should subscribe to overlay events and receive open payload", () => {
    const emitter = createOverlayEmitter()
    const overlay = createOverlay(emitter)
    const useOverlayEvent = createUseOverlayEvent(emitter)
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
    const emitter = createOverlayEmitter()
    const overlay = createOverlay(emitter)
    const useOverlayEvent = createUseOverlayEvent(emitter)
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

  it("separate emitters should not interfere", () => {
    const emitterA = createOverlayEmitter()
    const emitterB = createOverlayEmitter()
    const overlayA = createOverlay(emitterA)
    const useOverlayEventB = createUseOverlayEvent(emitterB)
    const handler = vi.fn()

    renderHook(() =>
      useOverlayEventB({
        open: handler,
        close: vi.fn(),
        unmount: vi.fn(),
        closeAll: vi.fn(),
        unmountAll: vi.fn(),
      }),
    )

    overlayA.open(mockController)
    expect(handler).not.toHaveBeenCalled()
  })
})
