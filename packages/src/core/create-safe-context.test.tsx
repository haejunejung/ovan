import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { createSafeContext } from "./create-safe-context"

describe("createSafeContext", () => {
  it("should throw when useSafeContext is used without Provider", () => {
    const [Provider, useSafeContext] = createSafeContext<{ value: number }>()

    expect(Provider).toBeDefined()

    expect(() =>
      renderHook(() => useSafeContext(), {
        wrapper: ({ children }) => <>{children}</>,
      }),
    ).toThrow(/Provider not found/)
  })

  it("should return value when used inside Provider", () => {
    const [Provider, useSafeContext] = createSafeContext<{ value: number }>(
      "TestContext",
    )

    const { result } = renderHook(() => useSafeContext(), {
      wrapper: ({ children }) => (
        <Provider value={{ value: 42 }}>{children}</Provider>
      ),
    })

    expect(result.current).toEqual({ value: 42 })
  })
})
