import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ContentOverlayController } from "./overlay-controller-content"
import type { OverlayControllerProps } from "./types"

describe("ContentOverlayController", () => {
  it("should render controller and dispatch OPEN on mount", async () => {
    const dispatch = vi.fn()
    const Controller = (props: OverlayControllerProps) => (
      <span data-testid="controller">open: {String(props.isOpen)}</span>
    )

    render(
      <ContentOverlayController
        isOpen={false}
        isMounted={false}
        overlayId="test-id"
        overlayDispatch={dispatch}
        controller={Controller}
      />,
    )

    expect(screen.getByTestId("controller")).not.toBeNull()
    expect(screen.getByText(/open: false/)).toBeDefined()

    await vi.waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: "OPEN",
        overlayId: "test-id",
      })
    })
  })

  it("should not dispatch OPEN on mount when isMounted is true (remount after close)", async () => {
    const dispatch = vi.fn()
    const Controller = (props: OverlayControllerProps) => (
      <span data-testid="controller">open: {String(props.isOpen)}</span>
    )

    render(
      <ContentOverlayController
        isOpen={false}
        isMounted={true}
        overlayId="remount-id"
        overlayDispatch={dispatch}
        controller={Controller}
      />,
    )

    expect(screen.getByTestId("controller")).not.toBeNull()
    await vi.waitFor(() => {
      expect(dispatch).not.toHaveBeenCalledWith({
        type: "OPEN",
        overlayId: "remount-id",
      })
    })
  })

  it("should render controller with overlayId, isOpen, close, unmount", () => {
    const dispatch = vi.fn()
    const Controller = (props: OverlayControllerProps) => (
      <div>
        <span data-testid="overlay-id">{props.overlayId}</span>
        <span data-testid="is-open">{String(props.isOpen)}</span>
        <button type="button" onClick={props.close} data-testid="close">
          close
        </button>
        <button type="button" onClick={props.unmount} data-testid="unmount">
          unmount
        </button>
      </div>
    )

    render(
      <ContentOverlayController
        isOpen={true}
        isMounted={true}
        overlayId="my-overlay"
        overlayDispatch={dispatch}
        controller={Controller}
      />,
    )

    expect(screen.getByTestId("overlay-id")).not.toBeNull()
    expect(screen.getByTestId("is-open")).not.toBeNull()

    screen.getByTestId("close").click()
    expect(dispatch).toHaveBeenCalledWith({
      type: "CLOSE",
      overlayId: "my-overlay",
    })

    screen.getByTestId("unmount").click()
    expect(dispatch).toHaveBeenCalledWith({
      type: "REMOVE",
      overlayId: "my-overlay",
    })
  })
})
