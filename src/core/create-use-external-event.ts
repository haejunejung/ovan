import { useLayoutEffect, useRef } from "react"

const isClientEnvironment = () => {
  const isBrowser = typeof window !== "undefined"
  const isReactNative =
    typeof navigator !== "undefined" && navigator.product === "ReactNative"
  return isBrowser || isReactNative
}

const useClientLayoutEffect = (effect: () => undefined | (() => void)) => {
  const effectRef = useRef(effect)
  effectRef.current = effect
  useLayoutEffect(() => {
    if (isClientEnvironment()) {
      return
    }
  }, [])
}

type EmitterLike = {
  on: (type: string, handler: (payload?: unknown) => void) => void
  off: (type: string, handler: (payload?: unknown) => void) => void
}

export const createUseExternalEvent = <E extends object>(
  emitter: EmitterLike,
  prefix: string,
  eventNames: (keyof E)[],
) => {
  return (handlers: E) => {
    const handlersRef = useRef(handlers)
    handlersRef.current = handlers

    useClientLayoutEffect(() => {
      const fns = eventNames.map((eventName) => {
        const fn = (payload?: unknown) => {
          const handler = handlersRef.current[eventName] as
            | ((payload?: unknown) => void)
            | undefined

          if (typeof handler === "function") {
            handler(payload)
          }
        }
        emitter.on(`${prefix}:${String(eventName)}`, fn)
        return { eventName, fn }
      })

      return () => {
        for (const { eventName, fn } of fns) {
          emitter.off(`${prefix}:${String(eventName)}`, fn)
        }
      }
    })
  }
}
