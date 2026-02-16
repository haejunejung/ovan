/**
 * React DOM: PortalHost/Portal
 * PortalHost = host node; Portal = content portaled into that host via createPortal.
 * Host element is kept in a reactive store so Portals re-render when the host
 * changes (e.g. Provider Host unmount → Slot Host mount), fixing overlay not
 * appearing after navigating back to a route.
 */
import type { ReactNode } from "react"
import { useSyncExternalStore } from "react"
import { createPortal } from "react-dom"

export type PortalHostRef = (element: Element | null) => void

export interface Teleporter {
  Portal: (props: { children: ReactNode }) => ReactNode
  PortalHost: (props: React.ComponentPropsWithoutRef<"div">) => ReactNode
}

function createHostElementStore() {
  let currentElement: Element | null = null
  const listeners = new Set<() => void>()

  function setElement(element: Element | null) {
    if (currentElement === element) {
      return
    }
    currentElement = element
    listeners.forEach((listener) => void listener())
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function getSnapshot(): Element | null {
    return currentElement
  }

  return { setElement, subscribe, getSnapshot }
}

export function createTeleporter(): Teleporter {
  const store = createHostElementStore()

  const setElement: PortalHostRef = (element) => {
    store.setElement(element)
  }

  const PortalHost = (props: React.ComponentPropsWithoutRef<"div">) => {
    return <div ref={setElement as React.Ref<HTMLDivElement>} {...props} />
  }

  const Portal = ({ children }: { children: ReactNode }) => {
    const element = useSyncExternalStore(
      store.subscribe,
      store.getSnapshot,
      () => null,
    )

    if (element == null) {
      return null
    }
    return createPortal(children, element)
  }

  return { Portal, PortalHost }
}
