import { useState } from "react"
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
} from "./examples"
import { OverlayDevtoolsPanel } from "./OverlayDevtoolsPanel"
import { OverlayProvider, OverlaySlot, useOverlayState } from "hoyst"

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
    label: "8. Stacking (single slot)",
    Component: Example8StackingSingleSlot,
  },
  {
    id: 9,
    label: "9. Stacking (multi-slot)",
    Component: Example9StackingMultiSlot,
  },
] as const

function LauncherContent() {
  const [current, setCurrent] = useState<number>(1)
  const ex = EXAMPLES.find((e) => e.id === current)
  const Component = ex?.Component ?? Example1CloseUnmount

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ margin: "0 0 8px" }}>Ovan Web Examples</h1>
      <p style={{ margin: "0 0 24px", color: "#666", fontSize: 14 }}>
        Use the devtools panel (bottom-right) to inspect overlay state.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {EXAMPLES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setCurrent(id)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: current === id ? "2px solid #22c55e" : "1px solid #ccc",
              background: current === id ? "#f0fdf4" : "#fff",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <section
        style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}
      >
        <Component />
      </section>
    </div>
  )
}

export default function Launcher() {
  return (
    <OverlayProvider>
      <OverlaySlot />
      <OverlayDevtoolsPanel useOverlayState={useOverlayState} />
      <LauncherContent />
    </OverlayProvider>
  )
}
