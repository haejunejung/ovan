import type { OverlayControllerComponent } from "@hoyst/react-native"
import { createContext, useContext } from "react"
import { Button, StyleSheet, Text, View } from "react-native"
import { modalStyles, OverlayModal } from "./common"
import { OverlaySlot } from "./overlay-setup"

export const AContext = createContext<{ label: string }>({ label: "default" })

const ContextAwareModal: OverlayControllerComponent = ({
  isOpen,
  close,
  unmount,
}) => {
  const { label } = useContext(AContext)

  return (
    <OverlayModal isOpen={isOpen}>
      <View style={contextBoxStyles.box}>
        <Text style={contextBoxStyles.label}>AContext (visible in UI)</Text>
        <Text style={contextBoxStyles.value}>
          This overlay reads AContext.label = &quot;{label}&quot;
        </Text>
        <Text style={contextBoxStyles.hint}>
          Slot is under AProvider, so the overlay has access to the same
          context.
        </Text>
      </View>
      <View style={modalStyles.actions}>
        <Button title="Close" onPress={close} />
        <Button title="Unmount" onPress={unmount} />
      </View>
    </OverlayModal>
  )
}

const contextBoxStyles = StyleSheet.create({
  box: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#e0f2fe",
    borderWidth: 2,
    borderColor: "#0284c7",
    borderRadius: 8,
  },
  label: { fontSize: 11, color: "#0369a1", marginBottom: 4 },
  value: { fontWeight: "600", fontSize: 14 },
  hint: { marginTop: 8, fontSize: 12, color: "#666" },
})

function PageContextDisplay() {
  const { label } = useContext(AContext)
  return (
    <View style={pageContextStyles.box}>
      <Text style={pageContextStyles.text}>
        <Text style={{ fontWeight: "700" }}>
          Current AContext on this page:
        </Text>{" "}
        label = &quot;{label}&quot;
      </Text>
    </View>
  )
}

const pageContextStyles = StyleSheet.create({
  box: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#22c55e",
    borderRadius: 6,
  },
  text: { fontSize: 12 },
})

export function Example4TeleportWithContext() {
  return (
    <AContext.Provider value={{ label: "from AProvider" }}>
      <OverlaySlot>
        {(overlay) => (
          <View>
            <Text style={{ marginBottom: 8, fontWeight: "600" }}>
              4. Teleport + context (AProvider → Slot)
            </Text>
            <PageContextDisplay />
            <Text style={{ marginBottom: 8, fontSize: 12, color: "#666" }}>
              Open the modal to see the same context value in the overlay.
            </Text>
            <Button
              title="Open modal (uses context)"
              onPress={() =>
                overlay.open(ContextAwareModal, { overlayId: "ex4-context" })
              }
            />
          </View>
        )}
      </OverlaySlot>
    </AContext.Provider>
  )
}
