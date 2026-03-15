import { useState } from "react"

/** Minimal state shape (from useOverlayState). */
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

const panelStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 12,
  right: 12,
  width: 320,
  maxHeight: 360,
  backgroundColor: "#1e1e1e",
  color: "#eee",
  fontFamily: "ui-monospace, monospace",
  fontSize: 11,
  borderRadius: 8,
  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  zIndex: 2147483647,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
}

const headerStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #333",
  cursor: "pointer",
  userSelect: "none",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}

const bodyStyle: React.CSSProperties = {
  padding: 8,
  overflow: "auto",
  flex: 1,
}

const rowStyle: React.CSSProperties = {
  padding: "4px 6px",
  marginBottom: 4,
  borderRadius: 4,
  backgroundColor: "#2d2d2d",
}

const badge = (open: boolean): React.CSSProperties =>
  open
    ? {
        backgroundColor: "#22c55e",
        color: "#fff",
        padding: "0 4px",
        borderRadius: 4,
      }
    : {
        backgroundColor: "#64748b",
        color: "#fff",
        padding: "0 4px",
        borderRadius: 4,
      }

export function OverlayDevtoolsPanel({
  useOverlayState,
  defaultOpen = true,
}: OverlayDevtoolsPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const state = useOverlayState()
  const { overlayOrderList, overlayData, current, activeSlotId } = state

  return (
    <div style={panelStyle}>
      <div style={headerStyle} onClick={() => setOpen((o) => !o)} role="button">
        <span style={{ fontWeight: 600 }}>Ovan Overlays</span>
        <span style={{ color: "#888", fontSize: 10 }}>
          {open ? "▼" : "▶"} {overlayOrderList.length} overlay(s)
        </span>
      </div>
      {open && (
        <div style={bodyStyle}>
          <div style={{ marginBottom: 8, color: "#888" }}>
            activeSlotId: {activeSlotId ?? "—"} · current: {current ?? "—"}
          </div>
          {overlayOrderList.length === 0 ? (
            <div style={{ color: "#666" }}>No overlays</div>
          ) : (
            overlayOrderList.map((id) => {
              const item = overlayData[id]
              if (!item) {
                return null
              }
              return (
                <div key={item.id} style={rowStyle}>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{item.id}</span>
                    <span style={badge(item.isOpen)}>
                      {item.isOpen ? "open" : "closed"}
                    </span>
                    {item.isMounted && (
                      <span style={{ color: "#94a3b8", fontSize: 10 }}>
                        mounted
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>
                    key: {item.componentKey}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
