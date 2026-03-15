import type { OverlayControllerComponent } from "hoyst"
import { useState } from "react"
import { OverlaySlot, overlay } from "hoyst"
import {
  CLOSE_DURATION_MS,
  getModalTransition,
  modalBackdropStyle,
  modalContentStyle,
} from "./common"

const OVERLAY_ID = "ex2-stateful"

const StatefulModal: OverlayControllerComponent = ({
  isOpen,
  close,
  unmount,
}) => {
  const [count, setCount] = useState(0)
  const [text, setText] = useState("")

  return (
    <div
      style={{
        ...modalBackdropStyle,
        ...getModalTransition(isOpen, CLOSE_DURATION_MS),
      }}
    >
      <div style={modalContentStyle}>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666" }}>
          Close = hide but keep state. Unmount = remove and reset.
        </p>
        <p style={{ margin: "0 0 8px" }}>
          Count: <strong>{count}</strong>{" "}
          <button type="button" onClick={() => setCount((c) => c + 1)}>
            +1
          </button>
        </p>
        <p style={{ margin: "0 0 16px" }}>
          Text:{" "}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Preserved on Close"
            style={{ padding: 6, width: 200 }}
          />
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
}

export function Example2ClosePreservesState() {
  return (
    <OverlaySlot>
      <div>
        <h3 style={{ margin: "0 0 8px" }}>
          2. Close preserves state (count++)
        </h3>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666" }}>
          Open → change count/text → Close → Open again: state is still there.
          Unmount clears it.
        </p>
        <button
          type="button"
          onClick={() => overlay.open(StatefulModal, { overlayId: OVERLAY_ID })}
        >
          Open stateful modal
        </button>
      </div>
    </OverlaySlot>
  )
}
