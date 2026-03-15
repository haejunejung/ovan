import type { OverlayControllerComponent } from "@hoyst/react-native"
import { Button, Text, View } from "react-native"
import { modalStyles, OverlayModal } from "./common"
import { OverlaySlot, overlay } from "./overlay-setup"

const ModalContent: OverlayControllerComponent = ({
  overlayId,
  isOpen,
  close,
  unmount,
}) => {
  console.log("isOpen", isOpen)
  return (
    <OverlayModal isOpen={isOpen}>
      <Text style={modalStyles.title}>Overlay: {overlayId}</Text>
      <Text style={modalStyles.hint}>Close = hide. Unmount = remove.</Text>
      <View style={modalStyles.actions}>
        <Button title="Close" onPress={close} />
        <Button title="Unmount" onPress={unmount} />
      </View>
    </OverlayModal>
  )
}

export function Example1CloseUnmount() {
  return (
    <OverlaySlot>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: "600" }}>
          1. Simple close vs unmount
        </Text>
        <Button
          title="Open modal"
          onPress={() => overlay.open(ModalContent, { overlayId: "ex1-modal" })}
        />
      </View>
    </OverlaySlot>
  )
}
