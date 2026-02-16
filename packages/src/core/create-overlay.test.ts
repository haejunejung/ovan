import { describe, expect, it } from "vitest"
import { createOverlay } from "./create-overlay"
import type { OverlayControllerLike } from "./types"

const mockController: OverlayControllerLike = () => null

describe("createOverlay", () => {
  it("should return open, openAsync, close, unmount, closeAll, unmountAll", () => {
    const overlay = createOverlay("test-prefix")
    expect(overlay.open).toBeDefined()
    expect(overlay.openAsync).toBeDefined()
    expect(overlay.close).toBeDefined()
    expect(overlay.unmount).toBeDefined()
    expect(overlay.closeAll).toBeDefined()
    expect(overlay.unmountAll).toBeDefined()
  })
})
