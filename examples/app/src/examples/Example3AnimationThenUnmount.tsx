import type { OverlayControllerComponent } from "@hoyst/react-native"
import { Button, Text, View } from "react-native"
import { CLOSE_DURATION_MS, modalStyles, OverlayModal } from "./common"
import { OverlaySlot, overlay } from "./overlay-setup"

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
    <OverlayModal isOpen={isOpen}>
      <Text style={modalStyles.hint}>
        Close runs exit animation, then unmount after {CLOSE_DURATION_MS}ms.
      </Text>
      <View style={modalStyles.actions}>
        <Button title="Close (animate then unmount)" onPress={handleClose} />
        <Button title="Unmount immediately" onPress={unmount} />
      </View>
    </OverlayModal>
  )
}

export function Example3AnimationThenUnmount() {
  return (
    <OverlaySlot>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: "600" }}>
          3. Animation on close, then unmount
        </Text>
        <Button
          title="Open animated modal"
          onPress={() => overlay.open(AnimatedModal, { overlayId: OVERLAY_ID })}
        />
      </View>
    </OverlaySlot>
  )
}
