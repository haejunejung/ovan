import { useLayoutEffect, useRef } from "react"

interface EmitterLike {
  on: (type: string, handler: (payload?: unknown) => void) => void
  off: (type: string, handler: (payload?: unknown) => void) => void
}

function isClientEnvironment() {
  const isBrowser = typeof document !== "undefined"
  const isReactNative =
    typeof navigator !== "undefined" && navigator.product === "ReactNative"
  return isBrowser || isReactNative
}

function useClientLayoutEffect(effect: () => undefined | (() => void)) {
  const effectRef = useRef(effect)
  effectRef.current = effect
  useLayoutEffect(() => {
    if (!isClientEnvironment()) {
      return
    }
    return effectRef.current()
  }, [])
}

export function createUseExternalEvent<E extends object>(
  emitter: EmitterLike,
  prefix: string,
  eventNames: (keyof E)[],
) {
  function useExternalEvent(handlers: E) {
    const handlersRef = useRef(handlers)
    handlersRef.current = handlers

    useClientLayoutEffect(() => {
      const fns = eventNames.map((name) => {
        const fn = (payload?: unknown) => {
          const handler = handlersRef.current[name] as
            | ((payload?: unknown) => void)
            | undefined
          if (typeof handler === "function") {
            handler(payload)
          }
        }
        emitter.on(`${prefix}:${String(name)}`, fn)
        return { name, fn }
      })

      return () => {
        for (const { name, fn } of fns) {
          emitter.off(`${prefix}:${String(name)}`, fn)
        }
      }
    })
  }

  return useExternalEvent
}
