import { generateRandomId } from "./generate-random-id"
import type { OverlayEmitter } from "./overlay-emitter"
import type {
  OverlayAsyncControllerLike,
  OverlayControllerLike,
  OverlayControllerProps,
} from "./types"

export interface OpenOverlayOptions {
  overlayId?: string
  slotId?: string | null
}

export interface OverlayAPI {
  /**
   * Opens an overlay by dispatching an "open" event with the given controller.
   *
   * A unique `overlayId` and `componentKey` are auto-generated unless
   * explicitly provided via `options`.
   *
   * @returns The resolved `overlayId` (either user-provided or auto-generated).
   */
  open: (
    controller: OverlayControllerLike,
    options?: OpenOverlayOptions,
  ) => string
  /**
   * Opens an overlay and returns a `Promise` that resolves when the overlay
   * is closed via `close(value)`, or rejects when dismissed via `reject(reason)`.
   *
   * This is useful for confirmation dialogs, form modals, or any overlay
   * where you need to `await` a user's response.
   *
   * The Promise is also rejected if the overlay is force-unmounted
   * (via `unmount` or `unmountAll`) before the user settles it.
   */
  openAsync: <T>(
    controller: OverlayAsyncControllerLike<T>,
    options?: OpenOverlayOptions,
  ) => Promise<T>
  /**
   * Triggers the close animation for a specific overlay.
   *
   * The overlay remains mounted in the tree after closing,
   * allowing exit animations to complete. Call {@link unmount} to fully remove it.
   */
  close: (overlayId: string) => void
  /**
   * Removes a specific overlay from the component tree entirely.
   *
   * Unlike {@link close}, this immediately destroys the overlay instance
   * without waiting for exit animations.
   *
   * If the overlay was opened via `openAsync` and has not been settled,
   * the pending Promise is rejected.
   */
  unmount: (overlayId: string) => void
  /**
   * Closes all currently open overlays.
   *
   * Each overlay will go through its normal close flow (exit animations, etc.).
   */
  closeAll: () => void
  /**
   * Unmounts all overlays from the component tree immediately.
   *
   * Any pending `openAsync` Promises are rejected.
   */
  unmountAll: () => void
}

/**
 * Creates the imperative overlay API that communicates with a Provider
 * via the given per-provider emitter.
 *
 * Also returns a `dispose` method for the Provider to call during cleanup
 * so that any unsettled `openAsync` Promises are rejected.
 */
export function createOverlay(
  emitter: OverlayEmitter,
): OverlayAPI & { dispose: () => void } {
  const PREFIX = "hoyst"

  /**
   * Pending `openAsync` rejecters keyed by overlayId.
   * Entries are removed when the promise settles (close/reject) or
   * when the overlay is force-unmounted.
   */
  const pendingAsync = new Map<string, (reason?: unknown) => void>()

  const dispatch = (event: string, payload?: unknown) => {
    emitter.emit(`${PREFIX}:${event}`, payload)
  }

  const open = (
    controller: OverlayControllerLike,
    options?: OpenOverlayOptions,
  ): string => {
    const overlayId = options?.overlayId ?? generateRandomId()
    const componentKey = generateRandomId()
    const slotId = options?.slotId ?? null
    dispatch("open", { controller, overlayId, componentKey, slotId })
    return overlayId
  }

  const openAsync = async <T>(
    controller: OverlayAsyncControllerLike<T>,
    options?: OpenOverlayOptions,
  ): Promise<T> => {
    return new Promise<T>((_resolve, _reject) => {
      let settled = false
      const settle = (id: string) => {
        settled = true
        pendingAsync.delete(id)
      }

      const wrapper: OverlayControllerLike = (
        overlayProps: OverlayControllerProps,
      ) => {
        const close = (param: T) => {
          if (!settled) {
            settle(resolvedId)
            _resolve(param)
          }
          overlayProps.close()
        }
        const reject = (reason?: unknown) => {
          if (!settled) {
            settle(resolvedId)
            _reject(reason)
          }
          overlayProps.close()
        }
        return controller({
          ...overlayProps,
          close,
          reject,
        })
      }

      const resolvedId = open(wrapper, options)

      pendingAsync.set(resolvedId, (reason) => {
        if (!settled) {
          settle(resolvedId)
          _reject(
            reason ??
              new Error(
                `Overlay "${resolvedId}" was unmounted before being resolved.`,
              ),
          )
        }
      })
    })
  }

  const close = (overlayId: string) => dispatch("close", overlayId)

  const unmount = (overlayId: string) => {
    const rejecter = pendingAsync.get(overlayId)
    if (rejecter) {
      rejecter()
    }
    dispatch("unmount", overlayId)
  }

  const closeAll = () => dispatch("closeAll")

  const unmountAll = () => {
    for (const [, rejecter] of pendingAsync) {
      rejecter()
    }
    pendingAsync.clear()
    dispatch("unmountAll")
  }

  /** Reject all pending `openAsync` Promises. Called by Provider on unmount. */
  const dispose = () => {
    for (const [, rejecter] of pendingAsync) {
      rejecter()
    }
    pendingAsync.clear()
  }

  return {
    open,
    openAsync,
    close,
    unmount,
    closeAll,
    unmountAll,
    dispose,
  }
}
