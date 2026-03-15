import type { OverlayControllerComponent } from "ovan"
import { createContext, useContext, useRef } from "react"
import { OverlaySlot, overlay } from "ovan"
import {
  CLOSE_DURATION_MS,
  getModalTransition,
  modalBackdropStyle,
  modalContentStyle,
} from "./common"

/** User-managed z-index for stacking (library does not set z-index). Each modal consumes the next on mount. */
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
  const { consume } = useContext(StackingZContext)
  const zRef = useRef<number | null>(null)
  if (zRef.current === null) {
    zRef.current = consume()
  }
  const zIndex = zRef.current
  // Outer layer: z-index only (no transform) so stacking order is clear. Inner layer: backdrop + animation (transform creates its own stacking context).
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
            This overlay is on top of the stack. Open another from the button
            below to see overlay-on-overlay; the new one will appear above this.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              onClick={() =>
                overlay.open(StackableModal, {
                  overlayId: `stack-${Date.now()}`,
                })
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

export function Example8StackingSingleSlot() {
  const nextZRef = useRef(Z_BASE)
  const consume = () => {
    const z = nextZRef.current
    nextZRef.current += 1
    return z
  }
  return (
    <StackingZContext.Provider value={{ consume }}>
      <OverlaySlot>
        <div>
          <h3 style={{ margin: "0 0 8px" }}>
            8. Overlay on top of overlay (single slot)
          </h3>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#666" }}>
            Open the first overlay, then use &quot;Open another on top&quot;
            inside it. <strong>z-index is user-managed</strong> (this example
            uses a context to assign 1000, 1001, … so the latest is on top).
          </p>
          <button
            type="button"
            onClick={() =>
              overlay.open(StackableModal, { overlayId: "stack-first" })
            }
          >
            Open first overlay
          </button>
        </div>
      </OverlaySlot>
    </StackingZContext.Provider>
  )
}
