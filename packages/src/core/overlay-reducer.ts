import type { OverlayData, OverlayItem } from "./types"

/**
 * Actions dispatched to the overlay reducer.
 *
 * | Action        | Effect                                                        |
 * |---------------|---------------------------------------------------------------|
 * | `ADD`         | Registers a new overlay item in state.                        |
 * | `OPEN`        | Sets `isOpen: true` for the target overlay.                   |
 * | `CLOSE`       | Sets `isOpen: false` (overlay stays mounted for animations).  |
 * | `REMOVE`      | Fully removes the overlay from state.                         |
 * | `CLOSE_ALL`   | Closes every overlay without removing them.                   |
 * | `REMOVE_ALL`  | Removes all overlays from state.                              |
 */
export type OverlayReducerAction =
  | { type: "ADD"; overlay: OverlayItem }
  | { type: "OPEN"; overlayId: string }
  | { type: "CLOSE"; overlayId: string }
  | { type: "REMOVE"; overlayId: string }
  | { type: "CLOSE_ALL" }
  | { type: "REMOVE_ALL" }

export function determineCurrentOverlayId(
  overlayOrderList: string[],
  overlayData: Record<string, OverlayItem>,
  targetOverlayId: string,
): string | null {
  const openedOverlayOrderList = overlayOrderList.filter(
    (orderedOverlayId) => overlayData[orderedOverlayId].isOpen === true,
  )
  const targetIndexInOpenedList =
    openedOverlayOrderList.indexOf(targetOverlayId)

  return targetIndexInOpenedList === openedOverlayOrderList.length - 1
    ? (openedOverlayOrderList[targetIndexInOpenedList - 1] ?? null)
    : openedOverlayOrderList[openedOverlayOrderList.length - 1]
}

export function overlayReducer(
  state: OverlayData,
  action: OverlayReducerAction,
): OverlayData {
  switch (action.type) {
    case "ADD": {
      const overlayWithSlot: OverlayItem = {
        ...action.overlay,
        slotId: action.overlay.slotId ?? null,
      }
      // Re-open existing closed overlay (same overlayId, was closed).
      // Use current slotId so the overlay is shown in the slot that triggered open (fixes MultiSlot when slot remounts and useId() changes).
      const existing = state.overlayData[overlayWithSlot.id]
      if (existing != null && existing.isOpen === false) {
        return {
          ...state,
          current: overlayWithSlot.id,
          overlayData: {
            ...state.overlayData,
            [overlayWithSlot.id]: {
              ...existing,
              isOpen: true,
              slotId: overlayWithSlot.slotId,
            },
          },
        }
      }

      const isExisted = state.overlayOrderList.includes(overlayWithSlot.id)

      if (isExisted && state.overlayData[overlayWithSlot.id].isOpen === true) {
        throw new Error(
          `You can't open the multiple overlays with the same overlayId(${overlayWithSlot.id}). Please set a different id.`,
        )
      }

      return {
        current: overlayWithSlot.id,
        overlayOrderList: [
          ...state.overlayOrderList.filter(
            (item) => item !== overlayWithSlot.id,
          ),
          overlayWithSlot.id,
        ],
        overlayData: isExisted
          ? state.overlayData
          : {
              ...state.overlayData,
              [overlayWithSlot.id]: overlayWithSlot,
            },
      }
    }
    case "OPEN": {
      const overlay = state.overlayData[action.overlayId]

      if (overlay == null || overlay.isOpen) {
        return state
      }

      return {
        ...state,
        overlayData: {
          ...state.overlayData,
          [action.overlayId]: { ...overlay, isOpen: true, isMounted: true },
        },
      }
    }
    case "CLOSE": {
      // Only set isOpen false; keep overlay in list so it can run exit animation. Use REMOVE (unmount) to take it out of the tree.
      const overlay = state.overlayData[action.overlayId]

      if (overlay == null || !overlay.isOpen) {
        return state
      }

      const currentOverlayId = determineCurrentOverlayId(
        state.overlayOrderList,
        state.overlayData,
        action.overlayId,
      )

      return {
        ...state,
        current: currentOverlayId,
        overlayData: {
          ...state.overlayData,
          [action.overlayId]: {
            ...state.overlayData[action.overlayId],
            isOpen: false,
          },
        },
      }
    }
    case "REMOVE": {
      const overlay = state.overlayData[action.overlayId]

      if (overlay == null) {
        return state
      }

      const remainingOverlays = state.overlayOrderList.filter(
        (item) => item !== action.overlayId,
      )
      if (state.overlayOrderList.length === remainingOverlays.length) {
        return state
      }

      const copiedOverlayData = { ...state.overlayData }
      delete copiedOverlayData[action.overlayId]

      const currentOverlayId = determineCurrentOverlayId(
        state.overlayOrderList,
        state.overlayData,
        action.overlayId,
      )

      return {
        current: currentOverlayId,
        overlayOrderList: remainingOverlays,
        overlayData: copiedOverlayData,
      }
    }
    case "CLOSE_ALL": {
      if (Object.keys(state.overlayData).length === 0) {
        return state
      }

      const nextOverlayData: Record<string, OverlayItem> = {}
      for (const curr of Object.keys(state.overlayData)) {
        nextOverlayData[curr] = {
          ...state.overlayData[curr],
          isOpen: false,
        }
      }

      return {
        ...state,
        current: null,
        overlayData: nextOverlayData,
      }
    }
    case "REMOVE_ALL": {
      return { current: null, overlayOrderList: [], overlayData: {} }
    }
  }
}
