import type { OverlayControllerComponent } from "@hoyst/react-native"
import { createContext, useContext, useRef } from "react"
import { Button, Text, View } from "react-native"
import { modalStyles, OverlayModal } from "./common"
import { OverlaySlot, useOverlay } from "./overlay-setup"

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
    <OverlayModal isOpen={isOpen} zIndex={zIndex}>
      <Text style={[modalStyles.title, { fontWeight: "600" }]}>
        Overlay: {overlayId}
      </Text>
      <Text style={modalStyles.hint}>
        In this slot. Use &quot;Open another on top&quot; to stack another
        overlay above this one (same slot).
      </Text>
      <View style={modalStyles.actions}>
        <Button
          title="Open another on top"
          onPress={() =>
            open(StackableModal, { overlayId: `stack-${Date.now()}` })
          }
        />
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

function SlotAButtons() {
  const { open } = useOverlay()
  return (
    <Button
      title="Open first overlay (Slot A)"
      onPress={() => open(StackableModal, { overlayId: "slot-a-first" })}
    />
  )
}

function SlotBButtons() {
  const { open } = useOverlay()
  return (
    <Button
      title="Open first overlay (Slot B)"
      onPress={() => open(StackableModal, { overlayId: "slot-b-first" })}
    />
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
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <View
          style={[
            slotBox,
            { borderColor: "#94a3b8", backgroundColor: "#f8fafc" },
          ]}
        >
          <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
            Slot A
          </Text>
          <OverlaySlot>
            <SlotAButtons />
          </OverlaySlot>
        </View>
        <View
          style={[
            slotBox,
            { borderColor: "#22c55e", backgroundColor: "#f0fdf4" },
          ]}
        >
          <Text style={{ fontSize: 12, color: "#22c55e", marginBottom: 8 }}>
            Slot B
          </Text>
          <OverlaySlot>
            <SlotBButtons />
          </OverlaySlot>
        </View>
      </View>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: "600" }}>
          9. Overlay on top of overlay (multi-slot)
        </Text>
        <Text style={{ fontSize: 12, color: "#666" }}>
          Open an overlay in Slot A or B, then use &quot;Open another on
          top&quot; inside it. z-index is user-managed.
        </Text>
      </View>
    </StackingZContext.Provider>
  )
}
