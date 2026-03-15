/**
 * Example app: full-screen host and stacking so newest overlay is on top (iOS/Android).
 * Uses useOverlayState() to derive orderIndex and a custom wrapOverlay; ovan is unchanged.
 */
import {
  createOverlayProvider,
  OVERLAY_HOST_NAME,
  portalAdapter,
} from "@ovan/react-native"
import { StyleSheet, View } from "react-native"
import { PortalHost } from "react-native-teleport"

const hostWrapperStyle = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: "box-none",
  },
  hostFill: StyleSheet.absoluteFillObject,
})

const customAdapter = {
  ...portalAdapter,
  renderHost: (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <PortalHost name={OVERLAY_HOST_NAME} style={hostWrapperStyle.hostFill} />
    </View>
  ),
}

export const {
  overlay,
  OverlayProvider,
  OverlaySlot,
  useCurrentOverlay,
  useOverlay,
  useOverlayData,
  useOverlayState,
} = createOverlayProvider(customAdapter)
