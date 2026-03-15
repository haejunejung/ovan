import type { OverlayControllerComponent } from "hoyst"
import { createContext, useContext, useRef } from "react"
import { OverlaySlot, useOverlay } from "hoyst"
import {
  CLOSE_DURATION_MS,
  getModalTransition,
  modalBackdropStyle,
  modalContentStyle,
} from "./common"

const Z_BASE = 1000
const StackingZContext = createContext<{ consume: () => number }>({
  consume: () => Z_BASE,
})

const StackableModal: OverlayControllerComponent = ({
  overlayId,
  isOpen,
  close,
  unmount,
}) => {
  const { open } = useOverlay()
  const { consume } = useContext(StackingZContext)
  const zRef = useRef<number | null>(null)
  if (zRef.current === null) {
    zRef.current = consume()
  }
  const zIndex = zRef.current
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      <div
        style={{
          ...modalBackdropStyle,
          ...getModalTransition(isOpen, CLOSE_DURATION_MS),
        }}
      >
        <div style={modalContentStyle}>
          <p style={{ margin: "0 0 12px", fontWeight: 600 }}>
            Overlay: {overlayId}
          </p>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#666" }}>
            In this slot. Use &quot;Open another on top&quot; to stack another
            overlay above this one (same slot).
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              onClick={() =>
                open(StackableModal, { overlayId: `stack-${Date.now()}` })
              }
            >
              Open another on top
            </button>
            <button type="button" onClick={close}>
              Close
            </button>
            <button type="button" onClick={unmount}>
              Unmount
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SlotAButtons() {
  const { open } = useOverlay()
  return (
    <button
      type="button"
      onClick={() => open(StackableModal, { overlayId: "slot-a-first" })}
    >
      Open first overlay (Slot A)
    </button>
  )
}

function SlotBButtons() {
  const { open } = useOverlay()
  return (
    <button
      type="button"
      onClick={() => open(StackableModal, { overlayId: "slot-b-first" })}
    >
      Open first overlay (Slot B)
    </button>
  )
}

export function Example9StackingMultiSlot() {
  const nextZRef = useRef(Z_BASE)
  const consume = () => {
    const z = nextZRef.current
    nextZRef.current += 1
    return z
  }
  return (
    <StackingZContext.Provider value={{ consume }}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div
          style={{
            flex: "1 1 200px",
            border: "2px dashed #94a3b8",
            borderRadius: 8,
            padding: 12,
            background: "#f8fafc",
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
            Slot A
          </p>
          <OverlaySlot>
            <SlotAButtons />
          </OverlaySlot>
        </div>
        <div
          style={{
            flex: "1 1 200px",
            border: "2px dashed #22c55e",
            borderRadius: 8,
            padding: 12,
            background: "#f0fdf4",
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#22c55e" }}>
            Slot B
          </p>
          <OverlaySlot>
            <SlotBButtons />
          </OverlaySlot>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <h3 style={{ margin: "0 0 8px" }}>
          9. Overlay on top of overlay (multi-slot)
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
          Open an overlay in Slot A or B, then use &quot;Open another on
          top&quot; inside it. z-index is user-managed (this example uses a
          context so the latest is on top).
        </p>
      </div>
    </StackingZContext.Provider>
  )
}
