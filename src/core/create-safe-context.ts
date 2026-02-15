import type { Provider } from "react"
import { createContext, useContext } from "react"

type NullSymbolType = typeof NullSymbol
const NullSymbol = Symbol("Null")

export type CreateContextReturn<T> = [Provider<T>, () => T]

export function createSafeContext<T>(
  displayName?: string,
): CreateContextReturn<T> {
  const Context = createContext<T | NullSymbolType>(NullSymbol)
  Context.displayName = displayName ?? "SafeContext"

  function useSafeContext() {
    const ctx = useContext(Context)

    if (ctx === NullSymbol) {
      const error = new Error(`[${Context.displayName}]: Provider not found.`)
      error.name = "[Error] Context"
      throw error
    }

    return ctx
  }

  return [Context.Provider as Provider<T>, useSafeContext]
}
