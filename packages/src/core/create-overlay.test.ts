import { describe, expect, it } from "vitest"
import { createOverlay } from "./create-overlay"
import { createOverlayEmitter } from "./overlay-emitter"
import type { OverlayControllerLike } from "./types"

const mockController: OverlayControllerLike = () => null

describe("createOverlay", () => {
  it("should return open, openAsync, close, unmount, closeAll, unmountAll, dispose", () => {
    const emitter = createOverlayEmitter()
    const overlay = createOverlay(emitter)
    expect(overlay.open).toBeDefined()
    expect(overlay.openAsync).toBeDefined()
    expect(overlay.close).toBeDefined()
    expect(overlay.unmount).toBeDefined()
    expect(overlay.closeAll).toBeDefined()
    expect(overlay.unmountAll).toBeDefined()
    expect(overlay.dispose).toBeDefined()
  })

  it("open should return the overlayId", () => {
    const emitter = createOverlayEmitter()
    const overlay = createOverlay(emitter)
    const id = overlay.open(mockController, { overlayId: "my-id" })
    expect(id).toBe("my-id")
  })

  it("open should auto-generate an overlayId when not provided", () => {
    const emitter = createOverlayEmitter()
    const overlay = createOverlay(emitter)
    const id = overlay.open(mockController)
    expect(typeof id).toBe("string")
    expect(id.length).toBeGreaterThan(0)
  })

  it("unmount should reject pending openAsync promise", async () => {
    const emitter = createOverlayEmitter()
    const overlay = createOverlay(emitter)

    const promise = overlay.openAsync<boolean>(
      () => {
        return null
      },
      { overlayId: "async-1" },
    )

    overlay.unmount("async-1")

    await expect(promise).rejects.toThrow(
      'Overlay "async-1" was unmounted before being resolved.',
    )
  })

  it("unmountAll should reject all pending openAsync promises", async () => {
    const emitter = createOverlayEmitter()
    const overlay = createOverlay(emitter)

    const p1 = overlay.openAsync<boolean>(() => null, { overlayId: "a1" })
    const p2 = overlay.openAsync<boolean>(() => null, { overlayId: "a2" })

    overlay.unmountAll()

    await expect(p1).rejects.toThrow("was unmounted before being resolved")
    await expect(p2).rejects.toThrow("was unmounted before being resolved")
  })

  it("dispose should reject all pending openAsync promises", async () => {
    const emitter = createOverlayEmitter()
    const overlay = createOverlay(emitter)

    const promise = overlay.openAsync<string>(() => null, {
      overlayId: "d1",
    })

    overlay.dispose()

    await expect(promise).rejects.toThrow(
      'Overlay "d1" was unmounted before being resolved.',
    )
  })
})
