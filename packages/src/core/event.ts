import { generateRandomId } from "./generate-random-id"
import { overlayEmitter } from "./overlay-emitter"
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
   */
  open: (
    controller: OverlayControllerLike,
    options?: OpenOverlayOptions,
  ) => void
  /**
   * Opens an overlay and returns a `Promise` that resolves when the overlay
   * is closed via `close(value)`, or rejects when dismissed via `reject(reason)`.
   *
   * This is useful for confirmation dialogs, form modals, or any overlay
   * where you need to `await` a user's response.
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
   */
  unmountAll: () => void
}

export function createOverlay(overlayId: string): OverlayAPI {
  const prefix = `${overlayId}/ovan`

  const dispatch = (event: string, payload?: unknown) => {
    overlayEmitter.emit(`${prefix}:${event}`, payload)
  }

  const open = (
    controller: OverlayControllerLike,
    options?: OpenOverlayOptions,
  ) => {
    const overlayId = options?.overlayId ?? generateRandomId()
    const componentKey = generateRandomId()
    const slotId = options?.slotId ?? null
    dispatch("open", { controller, overlayId, componentKey, slotId })
  }

  const openAsync = async <T>(
    controller: OverlayAsyncControllerLike<T>,
    options?: OpenOverlayOptions,
  ): Promise<T> => {
    return new Promise<T>((_resolve, _reject) => {
      const wrapper: OverlayControllerLike = (
        overlayProps: OverlayControllerProps,
      ) => {
        const close = (param: T) => {
          _resolve(param)
          overlayProps.close()
        }
        const reject = (reason?: unknown) => {
          _reject(reason)
          overlayProps.close()
        }
        return controller({
          ...overlayProps,
          close,
          reject,
        })
      }
      open(wrapper, options)
    })
  }

  const close = (overlayId: string) => dispatch("close", overlayId)
  const unmount = (overlayId: string) => dispatch("unmount", overlayId)
  const closeAll = () => dispatch("closeAll")
  const unmountAll = () => dispatch("unmountAll")

  return {
    open,
    openAsync,
    close,
    unmount,
    closeAll,
    unmountAll,
  }
}
