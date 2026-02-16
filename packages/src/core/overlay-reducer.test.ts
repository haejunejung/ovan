import { describe, expect, it } from "vitest"
import { determineCurrentOverlayId, overlayReducer } from "./overlay-reducer"
import type { OverlayControllerLike, OverlayData } from "./types"

describe("overlayReducer", () => {
  const initialState: OverlayData = {
    current: null,
    overlayOrderList: [],
    overlayData: {},
  }

  const mockController = (() => null) as unknown as OverlayControllerLike

  describe("ADD action", () => {
    it("should add a new overlay", () => {
      const overlay = {
        id: "test-id",
        componentKey: "test-key",
        isOpen: true,
        isMounted: false,
        controller: mockController,
        slotId: null as string | null,
      }

      const result = overlayReducer(initialState, { type: "ADD", overlay })

      expect(result).toEqual({
        current: "test-id",
        overlayOrderList: ["test-id"],
        overlayData: {
          "test-id": overlay,
        },
      })
    })

    it("should re-open existing closed overlay with current slotId", () => {
      const stateWithClosedOverlay: OverlayData = {
        current: null,
        overlayOrderList: ["ex1"],
        overlayData: {
          ex1: {
            id: "ex1",
            componentKey: "key1",
            isOpen: false,
            isMounted: true,
            controller: mockController,
            slotId: "old-slot-id",
          },
        },
      }
      const result = overlayReducer(stateWithClosedOverlay, {
        type: "ADD",
        overlay: {
          id: "ex1",
          componentKey: "key1",
          isOpen: false,
          isMounted: false,
          controller: mockController,
          slotId: "new-slot-id",
        },
      })
      expect(result.overlayData.ex1.isOpen).toBe(true)
      expect(result.overlayData.ex1.slotId).toBe("new-slot-id")
    })

    it("should throw when adding same overlayId that is already open", () => {
      const existingOverlay = {
        id: "test-id",
        componentKey: "test-key",
        isOpen: true,
        isMounted: false,
        controller: mockController,
        slotId: null as string | null,
      }

      const stateWithOpenOverlay: OverlayData = {
        current: "test-id",
        overlayOrderList: ["test-id"],
        overlayData: { "test-id": existingOverlay },
      }

      expect(() => {
        overlayReducer(stateWithOpenOverlay, {
          type: "ADD",
          overlay: existingOverlay,
        })
      }).toThrow("You can't open the multiple overlays with the same overlayId")
    })
  })

  describe("OPEN action", () => {
    it("should open an existing closed overlay", () => {
      const stateWithClosedOverlay: OverlayData = {
        current: null,
        overlayOrderList: ["test-id"],
        overlayData: {
          "test-id": {
            id: "test-id",
            componentKey: "test-key",
            isOpen: false,
            isMounted: false,
            controller: mockController,
            slotId: null,
          },
        },
      }

      const result = overlayReducer(stateWithClosedOverlay, {
        type: "OPEN",
        overlayId: "test-id",
      })

      expect(result.overlayData["test-id"].isOpen).toBe(true)
    })
  })

  describe("CLOSE action", () => {
    it("should close an open overlay", () => {
      const stateWithOpenOverlay: OverlayData = {
        current: "test-id",
        overlayOrderList: ["test-id"],
        overlayData: {
          "test-id": {
            id: "test-id",
            componentKey: "test-key",
            isOpen: true,
            isMounted: false,
            controller: mockController,
            slotId: null,
          },
        },
      }

      const result = overlayReducer(stateWithOpenOverlay, {
        type: "CLOSE",
        overlayId: "test-id",
      })

      expect(result.overlayData["test-id"].isOpen).toBe(false)
      expect(result.current).toBe(null)
    })
  })

  describe("REMOVE_ALL action", () => {
    it("should remove all overlays", () => {
      const stateWithMultipleOverlays: OverlayData = {
        current: "test-id-2",
        overlayOrderList: ["test-id-1", "test-id-2"],
        overlayData: {
          "test-id-1": {
            id: "test-id-1",
            componentKey: "key-1",
            isOpen: true,
            isMounted: false,
            controller: mockController,
            slotId: null,
          },
          "test-id-2": {
            id: "test-id-2",
            componentKey: "key-2",
            isOpen: true,
            isMounted: false,
            controller: mockController,
            slotId: null,
          },
        },
      }

      const result = overlayReducer(stateWithMultipleOverlays, {
        type: "REMOVE_ALL",
      })

      expect(result).toEqual({
        current: null,
        overlayOrderList: [],
        overlayData: {},
      })
    })
  })
})

describe("determineCurrentOverlayId", () => {
  const mockController = () => null

  it("should return the previous overlay when closing the last overlay", () => {
    const overlayOrderList = ["id1", "id2", "id3"]
    const overlayData = {
      id1: {
        id: "id1",
        componentKey: "key1",
        isOpen: true,
        isMounted: false,
        controller: mockController,
        slotId: null,
      },
      id2: {
        id: "id2",
        componentKey: "key2",
        isOpen: true,
        isMounted: false,
        controller: mockController,
        slotId: null,
      },
      id3: {
        id: "id3",
        componentKey: "key3",
        isOpen: true,
        isMounted: false,
        controller: mockController,
        slotId: null,
      },
    }

    const result = determineCurrentOverlayId(
      overlayOrderList,
      overlayData,
      "id3",
    )

    expect(result).toBe("id2")
  })
})
