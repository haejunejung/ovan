import type { OverlayControllerComponent } from "ovan"
import { OverlaySlot, overlay } from "ovan"
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
      <p style={{ margin: "0 0 16px" }}>Overlay: {overlayId}</p>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#666" }}>
        Close = hide. Unmount = remove from tree.
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

export function Example1CloseUnmount() {
  return (
    <OverlaySlot>
      <div>
        <h3 style={{ margin: "0 0 8px" }}>1. Simple close vs unmount</h3>
        <button
          type="button"
          onClick={() => overlay.open(Modal, { overlayId: "ex1-modal" })}
        >
          Open modal
        </button>
      </div>
    </OverlaySlot>
  )
}
