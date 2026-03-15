import { PortalProvider } from "@ovan/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Launcher from "./Launcher"
import { OverlayDevtoolsPanel } from "./OverlayDevtoolsPanel"
import { OverlayProvider, OverlaySlot, useOverlayState } from "./overlay-setup"

export default function App() {
  return (
    <SafeAreaProvider>
      <PortalProvider>
        <OverlayProvider>
          <OverlayDevtoolsPanel useOverlayState={useOverlayState} />
          <OverlaySlot />
          <Launcher />
        </OverlayProvider>
      </PortalProvider>
    </SafeAreaProvider>
  )
}
