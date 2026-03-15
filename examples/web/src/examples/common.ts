import type { CSSProperties } from "react"

/** Shared styles and duration for web examples */
export const CLOSE_DURATION_MS = 220

export const modalBackdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
  pointerEvents: "auto",
}

export const modalContentStyle: CSSProperties = {
  background: "white",
  padding: 24,
  borderRadius: 8,
  minWidth: 280,
}

export function getModalTransition(isOpen: boolean, durationMs: number) {
  return {
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? "scale(1)" : "scale(0.96)",
    transition: `opacity ${durationMs}ms ease-out, transform ${durationMs}ms ease-out`,
    pointerEvents: isOpen ? undefined : ("none" as const),
  }
}
