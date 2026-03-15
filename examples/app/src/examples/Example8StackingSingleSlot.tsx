import type { OverlayControllerComponent } from "@ovan/react-native"
import { createContext, useContext, useRef } from "react"
import { Button, Text, View } from "react-native"
import { modalStyles, OverlayModal } from "./common"
import { OverlaySlot, overlay } from "./overlay-setup"

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
  return (
    <OverlayModal isOpen={isOpen} zIndex={zIndex}>
      <Text style={[modalStyles.title, { fontWeight: "600" }]}>
        Overlay: {overlayId}
      </Text>
      <Text style={modalStyles.hint}>
        Open another from the button below; the new one appears on top (zIndex
        on content root, managed by you via context).
      </Text>
      <View style={modalStyles.actions}>
        <Button
          title="Open another on top"
          onPress={() =>
            overlay.open(StackableModal, { overlayId: `stack-${Date.now()}` })
          }
        />
        <Button title="Close" onPress={close} />
        <Button title="Unmount" onPress={unmount} />
      </View>
    </OverlayModal>
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
        <View>
          <Text style={{ marginBottom: 8, fontWeight: "600" }}>
            8. Overlay on top of overlay (single slot)
          </Text>
          <Text style={{ marginBottom: 12, fontSize: 12, color: "#666" }}>
            Stacking via zIndex on your overlay content root. The library does
            not set zIndex; you manage it (e.g. context + consume() so newest
            has highest zIndex).
          </Text>
          <Button
            title="Open first overlay"
            onPress={() =>
              overlay.open(StackableModal, { overlayId: "stack-first" })
            }
          />
        </View>
      </OverlaySlot>
    </StackingZContext.Provider>
  )
}
