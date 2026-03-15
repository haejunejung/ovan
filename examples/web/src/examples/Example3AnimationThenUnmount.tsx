import type { OverlayControllerComponent } from "ovan"
import { OverlaySlot, overlay } from "ovan"
import {
  CLOSE_DURATION_MS,
  getModalTransition,
  modalBackdropStyle,
  modalContentStyle,
} from "./common"

const OVERLAY_ID = "ex3-animate-unmount"

const AnimatedModal: OverlayControllerComponent = ({
  isOpen,
  close,
  unmount,
}) => {
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
        <p style={{ margin: "0 0 12px" }}>
          Close runs exit animation, then unmount after {CLOSE_DURATION_MS}ms.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={handleClose}>
            Close (animate then unmount)
          </button>
          <button type="button" onClick={unmount}>
            Unmount immediately
          </button>
        </div>
      </div>
    </div>
  )
}

export function Example3AnimationThenUnmount() {
  return (
    <OverlaySlot>
      <div>
        <h3 style={{ margin: "0 0 8px" }}>
          3. Animation on close, then unmount
        </h3>
        <button
          type="button"
          onClick={() => overlay.open(AnimatedModal, { overlayId: OVERLAY_ID })}
        >
          Open animated modal
        </button>
      </div>
    </OverlaySlot>
  )
}
