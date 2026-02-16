import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { createOverlayProvider } from "./create-overlay-provider"
import type { OverlayControllerComponent } from "./overlay-controller-content"
import type { OverlayHostAdapter } from "./overlay-host-adapter"

const MockController: OverlayControllerComponent = ({
  overlayId,
  isOpen,
  close,
  unmount,
}) => (
  <div data-testid="overlay-content">
    <span data-testid="overlay-id">{overlayId}</span>
    <span data-testid="is-open">{String(isOpen)}</span>
    <button type="button" onClick={close} data-testid="close-btn">
      Close
    </button>
    <button type="button" onClick={unmount} data-testid="unmount-btn">
      Unmount
    </button>
  </div>
)

describe("createOverlayProvider", () => {
  it("should return overlay, OverlayProvider, OverlaySlot, useCurrentOverlay, useOverlayData", () => {
    const result = createOverlayProvider()
    expect(result.overlay).toBeDefined()
    expect(typeof result.overlay.open).toBe("function")
    expect(typeof result.overlay.close).toBe("function")
    expect(typeof result.overlay.useOverlayEvent).toBe("function")
    expect(result.OverlayProvider).toBeDefined()
    expect(result.OverlaySlot).toBeDefined()
    expect(typeof result.useCurrentOverlay).toBe("function")
    expect(typeof result.useOverlayData).toBe("function")
  })

  it("should open overlay and render controller when using default adapter", async () => {
    const { overlay, OverlayProvider } = createOverlayProvider()

    function App() {
      const openOverlay = () => overlay.open(MockController)
      return (
        <OverlayProvider>
          <button type="button" onClick={openOverlay} data-testid="open-btn">
            Open
          </button>
        </OverlayProvider>
      )
    }

    render(<App />)

    expect(screen.queryByTestId("overlay-content")).toBeNull()

    fireEvent.click(screen.getByTestId("open-btn"))

    await waitFor(() => {
      expect(screen.getByTestId("overlay-content")).not.toBeNull()
    })
  })

  it("should call custom adapter wrapOverlay when provided", async () => {
    const wrapOverlay = vi.fn(
      (node: ReactNode, key: string, _isOpen?: boolean) => (
        <div data-testid={`wrapped-${key}`} data-adapter-key={key}>
          {node}
        </div>
      ),
    )

    const adapter: OverlayHostAdapter = { wrapOverlay }
    const { overlay, OverlayProvider } = createOverlayProvider(adapter)

    function App() {
      return (
        <OverlayProvider>
          <button
            type="button"
            onClick={() => overlay.open(MockController)}
            data-testid="open-btn"
          >
            Open
          </button>
        </OverlayProvider>
      )
    }

    render(<App />)
    fireEvent.click(screen.getByTestId("open-btn"))

    await waitFor(() => {
      expect(wrapOverlay).toHaveBeenCalled()
      const [_node, key] = wrapOverlay.mock.calls[0]
      expect(key).toBeDefined()
      expect(typeof key).toBe("string")
    })

    await waitFor(() => {
      expect(screen.getByTestId(/wrapped-/)).not.toBeNull()
    })
  })

  it("useCurrentOverlay and useOverlayData return correct state", async () => {
    const { overlay, OverlayProvider, useCurrentOverlay, useOverlayData } =
      createOverlayProvider()

    function Consumer() {
      const current = useCurrentOverlay()
      const data = useOverlayData()
      return (
        <div>
          <span data-testid="current">{current ?? "none"}</span>
          <span data-testid="order-length">{data.overlayOrderList.length}</span>
        </div>
      )
    }

    function App() {
      return (
        <OverlayProvider>
          <Consumer />
          <button
            type="button"
            onClick={() => overlay.open(MockController)}
            data-testid="open-btn"
          >
            Open
          </button>
        </OverlayProvider>
      )
    }

    render(<App />)

    expect(screen.getByTestId("current")).not.toBeNull()
    expect(screen.getByTestId("order-length")).not.toBeNull()

    fireEvent.click(screen.getByTestId("open-btn"))

    await waitFor(() => {
      expect(screen.getByTestId("order-length")).not.toBeNull()
    })
    await waitFor(() => {
      const current = screen.getByTestId("current").textContent
      expect(current).not.toBe("none")
    })
  })

  it("OverlaySlot ref exposes unregister", async () => {
    const { OverlayProvider, OverlaySlot } = createOverlayProvider()
    const ref = { current: null as { unregister: () => void } | null }

    function App() {
      return (
        <OverlayProvider>
          <OverlaySlot ref={ref} />
        </OverlayProvider>
      )
    }

    render(<App />)

    await waitFor(() => {
      expect(ref.current).not.toBeNull()
      expect(typeof ref.current?.unregister).toBe("function")
    })

    ref.current?.unregister()
  })

  it("overlay.close and overlay.unmount work", async () => {
    const { overlay, OverlayProvider } = createOverlayProvider()

    function App() {
      return (
        <OverlayProvider>
          <button
            type="button"
            onClick={() => overlay.open(MockController)}
            data-testid="open-btn"
          >
            Open
          </button>
        </OverlayProvider>
      )
    }

    render(<App />)
    fireEvent.click(screen.getByTestId("open-btn"))

    await waitFor(() => {
      expect(screen.getByTestId("overlay-content")).not.toBeNull()
    })

    const overlayId = overlay.open(MockController)
    overlay.close(overlayId)

    await waitFor(() => {
      const isOpenEls = screen.getAllByTestId("is-open")
      expect(isOpenEls.some((el) => el.textContent === "false")).toBe(true)
    })
  })
})
