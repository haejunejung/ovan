import type { OverlayControllerComponent } from "ovan"
import { useState } from "react"
import { OverlaySlot, useOverlay } from "ovan"
import {
  CLOSE_DURATION_MS,
  getModalTransition,
  modalBackdropStyle,
  modalContentStyle,
} from "./common"

const OVERLAY_ID = "ex7-multi-animate-unmount"

const StatefulAnimatedModal: OverlayControllerComponent = ({
  isOpen,
  close,
  unmount,
}) => {
  const [count, setCount] = useState(0)

  const handleClose = () => {
    close()
    setTimeout(() => unmount(), CLOSE_DURATION_MS)
  }

  return (
    <div
      style={{
        ...modalBackdropStyle,
        ...getModalTransition(isOpen, CLOSE_DURATION_MS),
      }}
    >
      <div style={modalContentStyle}>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666" }}>
          Multi-slot: close → animate → unmount.
        </p>
        <p style={{ margin: "0 0 16px" }}>
          Count: <strong>{count}</strong>{" "}
          <button type="button" onClick={() => setCount((c) => c + 1)}>
            +1
          </button>
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={handleClose}>
            Close (animate then unmount)
          </button>
          <button type="button" onClick={unmount}>
            Unmount now
          </button>
        </div>
      </div>
    </div>
  )
}

function OpenInSlotB() {
  const { open } = useOverlay()
  return (
    <button
      type="button"
      onClick={() => open(StatefulAnimatedModal, { overlayId: OVERLAY_ID })}
    >
      Open modal
    </button>
  )
}

export function Example7MultiSlotAnimationUnmount() {
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
            Slot A
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
            Slot B (nearest ancestor)
          </p>
          <OverlaySlot>
            <OpenInSlotB />
          </OverlaySlot>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <h3 style={{ margin: "0 0 8px" }}>
          7. Multiple Slots + animation + unmount
        </h3>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666" }}>
          Overlay is rendered by the <strong>nearest ancestor Slot</strong>{" "}
          (Slot B).
        </p>
      </div>
    </>
  )
}
