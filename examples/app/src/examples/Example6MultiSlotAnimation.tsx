import type { OverlayControllerComponent } from "@hoyst/react-native"
import { useState } from "react"
import { Button, Text, View } from "react-native"
import { modalStyles, OverlayModal } from "./common"
import { OverlaySlot, useOverlay } from "./overlay-setup"

const OVERLAY_ID = "ex6-multi-stateful"

const StatefulModal: OverlayControllerComponent = ({
  isOpen,
  close,
  unmount,
}) => {
  const [count, setCount] = useState(0)

  return (
    <OverlayModal isOpen={isOpen}>
      <Text style={modalStyles.hint}>
        Multi-slot: state preserved on Close.
      </Text>
      <Text style={{ marginBottom: 16 }}>
        Count: <Text style={{ fontWeight: "700" }}>{count}</Text>
        <Button title="+1" onPress={() => setCount((c) => c + 1)} />
      </Text>
      <View style={modalStyles.actions}>
        <Button title="Close" onPress={close} />
        <Button title="Unmount" onPress={unmount} />
      </View>
    </OverlayModal>
  )
}

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
      title="Open stateful modal"
      onPress={() => open(StatefulModal, { overlayId: OVERLAY_ID })}
    />
  )
}

export function Example6MultiSlotAnimation() {
  return (
    <>
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <View style={[slotBox, { borderColor: "#ccc" }]}>
          <Text style={{ fontSize: 12, color: "#888" }}>Slot A</Text>
          <OverlaySlot />
        </View>
        <View style={[slotBox, { borderColor: "#22c55e" }]}>
          <Text style={{ fontSize: 12, color: "#22c55e" }}>
            Slot B (nearest ancestor)
          </Text>
          <OverlaySlot>
            <OpenInSlotB />
          </OverlaySlot>
        </View>
      </View>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: "600" }}>
          6. Multiple Slots + animation (state preserved)
        </Text>
        <Text style={{ marginBottom: 8, fontSize: 12, color: "#666" }}>
          Overlay is rendered by the nearest ancestor Slot (Slot B).
        </Text>
      </View>
    </>
  )
}
