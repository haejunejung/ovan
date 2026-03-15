import type { OverlayControllerComponent } from "hoyst"
import { OverlaySlot, useOverlay } from "hoyst"
import {
  CLOSE_DURATION_MS,
  getModalTransition,
  modalBackdropStyle,
  modalContentStyle,
} from "./common"

const Modal: OverlayControllerComponent = ({
  overlayId,
  isOpen,
  close,
  unmount,
}) => (
  <div
    style={{
      ...modalBackdropStyle,
      ...getModalTransition(isOpen, CLOSE_DURATION_MS),
    }}
  >
    <div style={modalContentStyle}>
      <p style={{ margin: "0 0 12px" }}>
        Overlay: {overlayId}. Rendered in the{" "}
        <strong>nearest ancestor Slot</strong> (Slot B).
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={close}>
          Close
        </button>
        <button type="button" onClick={unmount}>
          Unmount
        </button>
      </div>
    </div>
  </div>
)

function OpenInSlotB() {
  const { open } = useOverlay()
  return (
    <button
      type="button"
      onClick={() => open(Modal, { overlayId: "ex5-multi" })}
    >
      Open modal
    </button>
  )
}

export function Example5MultiSlotRecentWins() {
  return (
    <>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div
          style={{
            flex: "1 1 200px",
            minHeight: 120,
            border: "2px dashed #ccc",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#888" }}>
            Slot A (first)
          </p>
          <OverlaySlot />
        </div>
        <div
          style={{
            flex: "1 1 200px",
            minHeight: 120,
            border: "2px dashed #22c55e",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#22c55e" }}>
            Slot B – open from here (nearest ancestor)
          </p>
          <OverlaySlot>
            <OpenInSlotB />
          </OverlaySlot>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <h3 style={{ margin: "0 0 8px" }}>
          5. Multiple Slots – nearest ancestor
        </h3>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666" }}>
          Overlay is rendered by the <strong>nearest ancestor Slot</strong> of
          the open() call. Button is inside Slot B, so overlay appears in Slot
          B.
        </p>
      </div>
    </>
  )
}
