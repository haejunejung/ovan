import mitt from "mitt"

/**
 * Shared emitter for overlay events
 * React layer subscribes via createUseOverlayEvent(overlayId).
 */
export const overlayEmitter = mitt<Record<string, unknown>>()
