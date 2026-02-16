import { eventEmitter } from "./event-emitter"
import { generateRandomId } from "./generate-random-id"
import { getPrefix } from "./get-prefix"
import type {
  OverlayAsyncControllerLike,
  OverlayControllerLike,
  OverlayId,
  OverlayOptions,
} from "./types"

type OverlayCommandMap = {
  open: (controller: OverlayControllerLike, options: OverlayOptions) => void
  openAsync: <T>(
    controller: OverlayAsyncControllerLike,
    options: OverlayOptions,
  ) => Promise<T>
  close: (overlayId: OverlayId) => void
  unmount: (overlayId: OverlayId) => void
  closeAll: () => void
  unmountAll: () => void
}

export function createOverlay(overlayId: OverlayId): OverlayCommandMap {
  const prefix = getPrefix(overlayId)

  const dispatch = (event: string, payload?: unknown) => {
    eventEmitter.emit(`${prefix}:${event}`, payload)
  }

  const open = (controller: OverlayControllerLike, options: OverlayOptions) => {
    const overlayId = options.overlayId ?? generateRandomId()
    const componentKey = options.componentKey ?? generateRandomId()
    const slotId = options.slotId ?? null

    dispatch("open", {
      controller,
      overlayId,
      componentKey,
      slotId,
    })
  }

  const openAsync = async <T>(
    controller: OverlayAsyncControllerLike,
    options: OverlayOptions,
  ) => {
    return new Promise<T>((_resolve, _reject) => {
      const wrapper: OverlayControllerLike = (props) => {
        const resolve = (value: T) => {
          _resolve(value)
          props.close()
        }

        const reject = (reason: unknown) => {
          _reject(reason)
          props.close()
        }

        return controller({ ...props, close: resolve, reject })
      }

      open(wrapper, options)
    })
  }

  const close = (overlayId: OverlayId) => {
    dispatch("close", overlayId)
  }

  const unmount = (overlayId: OverlayId) => {
    dispatch("unmount", overlayId)
  }

  const closeAll = () => {
    dispatch("closeAll")
  }

  const unmountAll = () => {
    dispatch("unmountAll")
  }

  return {
    open,
    openAsync,
    close,
    unmount,
    closeAll,
    unmountAll,
  }
}
