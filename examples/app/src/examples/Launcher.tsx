import { useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  Example1CloseUnmount,
  Example2ClosePreservesState,
  Example3AnimationThenUnmount,
  Example4TeleportWithContext,
  Example5MultiSlotRecentWins,
  Example6MultiSlotAnimation,
  Example7MultiSlotAnimationUnmount,
  Example8StackingSingleSlot,
  Example9StackingMultiSlot,
} from "."

const EXAMPLES = [
  { id: 1, label: "1. Close vs Unmount", Component: Example1CloseUnmount },
  {
    id: 2,
    label: "2. Close preserves state",
    Component: Example2ClosePreservesState,
  },
  {
    id: 3,
    label: "3. Animation then unmount",
    Component: Example3AnimationThenUnmount,
  },
  {
    id: 4,
    label: "4. Teleport + context",
    Component: Example4TeleportWithContext,
  },
  {
    id: 5,
    label: "5. Multi-slot (recent wins)",
    Component: Example5MultiSlotRecentWins,
  },
  {
    id: 6,
    label: "6. Multi-slot + animation",
    Component: Example6MultiSlotAnimation,
  },
  {
    id: 7,
    label: "7. Multi-slot + animation + unmount",
    Component: Example7MultiSlotAnimationUnmount,
  },
  {
    id: 8,
    label: "8. Overlay on overlay (single slot)",
    Component: Example8StackingSingleSlot,
  },
  {
    id: 9,
    label: "9. Overlay on overlay (multi-slot)",
    Component: Example9StackingMultiSlot,
  },
] as const

function LauncherContent() {
  const [current, setCurrent] = useState<number>(1)
  const insets = useSafeAreaInsets()
  const ex = EXAMPLES.find((e) => e.id === current)
  const Component = ex?.Component ?? Example1CloseUnmount

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: 120 + insets.bottom },
      ]}
    >
      <Text style={styles.title}>Ovan RN Examples</Text>
      <Text style={styles.subtitle}>
        Use the devtools panel (bottom) to inspect overlay state.
      </Text>
      <View style={styles.buttons}>
        {EXAMPLES.map(({ id, label }) => (
          <Pressable
            key={id}
            style={[styles.btn, current === id && styles.btnActive]}
            onPress={() => setCurrent(id)}
          >
            <Text style={styles.btnText}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.section}>
        <Component />
      </View>
    </ScrollView>
  )
}

export default function Launcher() {
  return <LauncherContent />
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 24 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#666", fontSize: 14, marginBottom: 24 },
  buttons: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    fontSize: 12,
  },
  btnActive: {
    borderColor: "#22c55e",
    borderWidth: 2,
    backgroundColor: "#f0fdf4",
  },
  btnText: { fontSize: 12 },
  section: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 16,
  },
})
