import type { ReactNode } from "react"
import { Platform, StyleSheet, View } from "react-native"

export const CLOSE_DURATION_MS = 220

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 8,
    minWidth: 280,
  },
  title: { marginBottom: 16, fontSize: 16 },
  actions: { flexDirection: "row", gap: 8 },
  hint: { marginBottom: 8, fontSize: 12, color: "#666" },
})

const overlayRootStyle = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
})

/**
 * View-based overlay (no RN Modal). Use when stacking multiple overlays (e.g. Example 8, 9).
 */
export function OverlayModal({
  isOpen,
  children,
  zIndex = 0,
}: {
  isOpen: boolean
  children: ReactNode
  zIndex?: number
}) {
  return (
    <View
      collapsable={false}
      style={[
        overlayRootStyle.root,
        {
          zIndex,
          // Android uses elevation for stacking; zIndex alone is ignored for siblings.
          ...(Platform.OS === "android" ? { elevation: zIndex } : {}),
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        },
      ]}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.box}>{children}</View>
      </View>
    </View>
  )
}
