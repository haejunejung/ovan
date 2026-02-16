import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { createUseExternalEvent } from "./create-use-external-event"

function createMockEmitter() {
  const listeners: Record<string, Array<(payload?: unknown) => void>> = {}
  return {
    on(type: string, handler: (payload?: unknown) => void) {
      if (!listeners[type]) {
        listeners[type] = []
      }
      listeners[type].push(handler)
    },
    off(type: string, handler: (payload?: unknown) => void) {
      if (!listeners[type]) {
        return
      }
      listeners[type] = listeners[type].filter((h) => h !== handler)
    },
    emit(type: string, payload?: unknown) {
      ;(listeners[type] ?? []).forEach((h) => void h(payload))
    },
  }
}

describe("createUseExternalEvent", () => {
  it("should subscribe to events and receive payloads", () => {
    const emitter = createMockEmitter()
    const useExternalEvent = createUseExternalEvent<{
      foo: (x: number) => void
      bar: (x: string) => void
    }>(emitter, "my-prefix", ["foo", "bar"])

    const fooHandler = vi.fn()
    const barHandler = vi.fn()

    renderHook(() =>
      useExternalEvent({
        foo: fooHandler,
        bar: barHandler,
      }),
    )

    emitter.emit("my-prefix:foo", 42)
    expect(fooHandler).toHaveBeenCalledWith(42)

    emitter.emit("my-prefix:bar", "hello")
    expect(barHandler).toHaveBeenCalledWith("hello")
  })

  it("should unsubscribe on unmount", () => {
    const emitter = createMockEmitter()
    const useExternalEvent = createUseExternalEvent<{
      ping: (x: number) => void
    }>(emitter, "p", ["ping"])
    const handler = vi.fn()

    const { unmount } = renderHook(() => useExternalEvent({ ping: handler }))
    emitter.emit("p:ping", 1)
    expect(handler).toHaveBeenCalledTimes(1)

    unmount()
    emitter.emit("p:ping", 2)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("should use latest handlers when handlers reference is updated", () => {
    const emitter = createMockEmitter()
    const useExternalEvent = createUseExternalEvent<{
      tick: (n: number) => void
    }>(emitter, "t", ["tick"])
    const first = vi.fn()
    const second = vi.fn()

    const { rerender } = renderHook(
      ({ handlers }) => useExternalEvent(handlers),
      {
        initialProps: { handlers: { tick: first } },
      },
    )
    emitter.emit("t:tick", 1)
    expect(first).toHaveBeenCalledWith(1)
    expect(second).not.toHaveBeenCalled()

    rerender({ handlers: { tick: second } })
    emitter.emit("t:tick", 2)
    expect(second).toHaveBeenCalledWith(2)
    expect(first).toHaveBeenCalledTimes(1)
  })

  it("should not subscribe to wrong prefix", () => {
    const emitter = createMockEmitter()
    const useExternalEvent = createUseExternalEvent<{ a: () => void }>(
      emitter,
      "only",
      ["a"],
    )
    const handler = vi.fn()
    renderHook(() => useExternalEvent({ a: handler }))

    emitter.emit("other:a")
    expect(handler).not.toHaveBeenCalled()

    emitter.emit("only:a")
    expect(handler).toHaveBeenCalled()
  })
})
