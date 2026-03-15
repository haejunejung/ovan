import type { OverlayControllerComponent } from "hoyst"
import { createContext, useContext } from "react"
import { OverlaySlot } from "hoyst"
import {
  CLOSE_DURATION_MS,
  getModalTransition,
  modalBackdropStyle,
  modalContentStyle,
} from "./common"

export const AContext = createContext<{ label: string }>({ label: "default" })

const ContextAwareModal: OverlayControllerComponent = ({
  isOpen,
  close,
  unmount,
}) => {
  const { label } = useContext(AContext)
  console.log("ContextAwareModal", { isOpen, close, unmount, label })

  return (
    <div
      style={{
        ...modalBackdropStyle,
        ...getModalTransition(isOpen, CLOSE_DURATION_MS),
      }}
    >
      <div style={modalContentStyle}>
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#e0f2fe",
            border: "2px solid #0284c7",
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 11, color: "#0369a1", marginBottom: 4 }}>
            AContext (visible in UI)
          </div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            This overlay reads <strong>AContext.label</strong> = &quot;{label}
            &quot;
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#666" }}>
            Slot is under AProvider, so the overlay component has access to the
            same context.
          </p>
        </div>
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

function PageContextDisplay() {
  const { label } = useContext(AContext)
  return (
    <div
      style={{
        marginBottom: 12,
        padding: 8,
        background: "#f0fdf4",
        border: "1px solid #22c55e",
        borderRadius: 6,
        fontSize: 12,
      }}
    >
      <strong>Current AContext on this page:</strong> label = &quot;{label}
      &quot;
    </div>
  )
}

export function Example4TeleportWithContext() {
  return (
    <AContext.Provider value={{ label: "from AProvider" }}>
      <OverlaySlot>
        {(overlay) => (
          <div>
            <h3 style={{ margin: "0 0 8px" }}>
              4. Teleport + context (OverlayProvider → AProvider → Slot)
            </h3>
            <PageContextDisplay />
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666" }}>
              Slot is under AProvider; open the modal to see the same context
              value in the overlay.
            </p>
            <button
              type="button"
              onClick={() =>
                overlay.open(ContextAwareModal, { overlayId: "ex4-context" })
              }
            >
              Open modal (uses context)
            </button>
          </div>
        )}
      </OverlaySlot>
    </AContext.Provider>
  )
}
