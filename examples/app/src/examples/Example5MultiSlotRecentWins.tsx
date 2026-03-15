import type { OverlayControllerComponent } from "@ovan/react-native"
import { Button, Text, View } from "react-native"
import { modalStyles, OverlayModal } from "./common"
import { OverlaySlot, useOverlay } from "./overlay-setup"

const ModalContent: OverlayControllerComponent = ({
  overlayId,
  isOpen,
  close,
  unmount,
}) => (
  <OverlayModal isOpen={isOpen}>
    <Text style={modalStyles.hint}>
      Overlay: {overlayId}. Rendered in the most recent Slot (right box).
    </Text>
    <View style={modalStyles.actions}>
      <Button title="Close" onPress={close} />
      <Button title="Unmount" onPress={unmount} />
    </View>
  </OverlayModal>
)

const slotBox = {
  flex: 1,
  minHeight: 100,
  borderWidth: 2,
  borderRadius: 8,
  padding: 12,
  marginHorizontal: 4,
} as const

function OpenInSlotB() {
  const { open } = useOverlay()
  return (
    <Button
      title="Open modal"
      onPress={() => open(ModalContent, { overlayId: "ex5-multi" })}
    />
  )
}

export function Example5MultiSlotRecentWins() {
  return (
    <>
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <View style={[slotBox, { borderColor: "#ccc" }]}>
          <Text style={{ fontSize: 12, color: "#888" }}>Slot A (first)</Text>
          <OverlaySlot />
        </View>
        <View style={[slotBox, { borderColor: "#22c55e" }]}>
          <Text style={{ fontSize: 12, color: "#22c55e" }}>
            Slot B – open from here (nearest ancestor)
          </Text>
          <OverlaySlot>
            <OpenInSlotB />
          </OverlaySlot>
        </View>
      </View>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: "600" }}>
          5. Multiple Slots – nearest ancestor
        </Text>
        <Text style={{ marginBottom: 8, fontSize: 12, color: "#666" }}>
          Overlay is rendered by the nearest ancestor Slot (Slot B).
        </Text>
      </View>
    </>
  )
}
