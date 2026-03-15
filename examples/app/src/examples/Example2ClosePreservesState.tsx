import type { OverlayControllerComponent } from "@ovan/react-native"
import { useState } from "react"
import { Button, Text, TextInput, View } from "react-native"
import { modalStyles, OverlayModal } from "./common"
import { OverlaySlot, overlay } from "./overlay-setup"

const OVERLAY_ID = "ex2-stateful"

const StatefulModal: OverlayControllerComponent = ({
  isOpen,
  close,
  unmount,
}) => {
  const [count, setCount] = useState(0)
  const [text, setText] = useState("")

  return (
    <OverlayModal isOpen={isOpen}>
      <Text style={modalStyles.hint}>Close = keep state. Unmount = reset.</Text>
      <Text style={{ marginBottom: 8 }}>
        Count: <Text style={{ fontWeight: "700" }}>{count}</Text>
        <Button title="+1" onPress={() => setCount((c) => c + 1)} />
      </Text>
      <Text style={{ marginBottom: 8 }}>Text:</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Preserved on Close"
        style={{ borderWidth: 1, padding: 8, marginBottom: 16 }}
      />
      <View style={modalStyles.actions}>
        <Button title="Close" onPress={close} />
        <Button title="Unmount" onPress={unmount} />
      </View>
    </OverlayModal>
  )
}

export function Example2ClosePreservesState() {
  return (
    <OverlaySlot>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: "600" }}>
          2. Close preserves state (count++)
        </Text>
        <Button
          title="Open stateful modal"
          onPress={() => overlay.open(StatefulModal, { overlayId: OVERLAY_ID })}
        />
      </View>
    </OverlaySlot>
  )
}
