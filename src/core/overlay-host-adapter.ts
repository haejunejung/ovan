import type { ReactNode } from "react"

/**
 * Platform adapter for "where to render" overlays.
 * Core performs all logic; react/react-native only implement this interface.
 *
 * When multiple OverlaySlots exist, each slot must render into its own host so one slot's
 * Portal does not replace another's. Use the function form of renderHost and wrapOverlayList
 * with slotId so each slot gets its own host/portal pair.
 *
 * Use wrapOverlayList to reorder the list per slot, or use multiple createOverlayProvider()
 * instances (multiple Providers) for separate layers.
 */
export interface OverlayHostAdapter {
  /**
   * Host node, or function (slotId) => node. slotId is null when provider renders host
   * (no slot mounted); otherwise the slot's id. Use function when you have multiple slots
   * so each slot gets its own host (e.g. own createTeleporter() per slotId).
   */
  renderHost?: ReactNode | ((slotId: string | null) => ReactNode)
  /**
   * Wrap each overlay node (e.g. in Portal). Key is componentKey.
   * Optional isOpen is passed for custom adapters; the controller should handle
   * accessibility (e.g. aria-hidden, accessibilityElementsHidden) and pointer-events
   * based on isOpen so the library does not impose a11y behavior.
   */
  wrapOverlay: (node: ReactNode, key: string, isOpen?: boolean) => ReactNode
  /**
   * Optional. When set, the slot calls (slotId, list) => Node so each slot gets its own
   * Portal into its own host; otherwise one Portal would replace another's content.
   * Use to reorder the list per slot.
   */
  wrapOverlayList?: (slotId: string, list: ReactNode[]) => ReactNode
}
