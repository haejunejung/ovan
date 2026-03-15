import { useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export interface OverlayDevtoolsState {
  current: string | null
  overlayOrderList: string[]
  overlayData: Record<
    string,
    { id: string; componentKey: string; isOpen: boolean; isMounted: boolean }
  >
  activeSlotId: string | null
}

export interface OverlayDevtoolsPanelProps {
  useOverlayState: () => OverlayDevtoolsState
  defaultOpen?: boolean
}

export function OverlayDevtoolsPanel({
  useOverlayState,
  defaultOpen = true,
}: OverlayDevtoolsPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const insets = useSafeAreaInsets()
  const state = useOverlayState()
  const { overlayOrderList, overlayData, current, activeSlotId } = state

  return (
    <View style={[styles.panel, { bottom: 12 + insets.bottom }]}>
      <Pressable style={styles.header} onPress={() => setOpen((o) => !o)}>
        <Text style={styles.headerTitle}>Ovan Overlays</Text>
        <Text style={styles.headerMeta}>
          {open ? "▼" : "▶"} {overlayOrderList.length} overlay(s)
        </Text>
      </Pressable>
      {open && (
        <ScrollView style={styles.body} nestedScrollEnabled>
          <Text style={styles.meta}>
            activeSlotId: {activeSlotId ?? "—"} · current: {current ?? "—"}
          </Text>
          {overlayOrderList.length === 0 ? (
            <Text style={styles.empty}>No overlays</Text>
          ) : (
            overlayOrderList.map((id) => {
              const item = overlayData[id]
              if (!item) {
                return null
              }
              return (
                <View key={item.id} style={styles.row}>
                  <View style={styles.rowTop}>
                    <Text style={styles.rowId}>{item.id}</Text>
                    <View
                      style={[
                        styles.badge,
                        item.isOpen ? styles.badgeOpen : styles.badgeClosed,
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {item.isOpen ? "open" : "closed"}
                      </Text>
                    </View>
                    {item.isMounted && (
                      <Text style={styles.mounted}>mounted</Text>
                    )}
                  </View>
                  <Text style={styles.rowKey}>key: {item.componentKey}</Text>
                </View>
              )
            })
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    bottom: 12,
    right: 12,
    left: 12,
    maxHeight: 280,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    overflow: "hidden",
    zIndex: 9999,
    elevation: 9999,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: { color: "#eee", fontWeight: "600", fontSize: 12 },
  headerMeta: { color: "#888", fontSize: 10 },
  body: { padding: 8, maxHeight: 220 },
  meta: { color: "#888", fontSize: 10, marginBottom: 8 },
  empty: { color: "#666", fontSize: 11 },
  row: {
    backgroundColor: "#2d2d2d",
    borderRadius: 4,
    padding: 6,
    marginBottom: 4,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  rowId: { color: "#eee", fontWeight: "500", fontSize: 11 },
  rowKey: { color: "#64748b", fontSize: 10, marginTop: 2 },
  badge: { paddingHorizontal: 4, borderRadius: 4 },
  badgeOpen: { backgroundColor: "#22c55e" },
  badgeClosed: { backgroundColor: "#64748b" },
  badgeText: { color: "#fff", fontSize: 10 },
  mounted: { color: "#94a3b8", fontSize: 10 },
})
