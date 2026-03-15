import mitt from "mitt"

/**
 * Per-provider emitter factory.
 *
 * Each `createOverlayProvider()` call creates its own emitter so that
 * multiple overlay trees are fully isolated — no shared global state,
 * no cross-test leakage, and no risk of SSR interference.
 */
export type OverlayEmitter = ReturnType<typeof createOverlayEmitter>

export function createOverlayEmitter() {
  return mitt<Record<string, unknown>>()
}
