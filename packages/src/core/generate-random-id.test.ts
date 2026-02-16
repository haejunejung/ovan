import { describe, expect, it } from "vitest"
import { generateRandomId } from "./generate-random-id"

describe("generaterRandomId", () => {
  it("should return a string with ovan prefix", () => {
    const id = generateRandomId()
    expect(id).toMatch(/^ovan-[a-z0-9]+$/)
    expect(id.startsWith("ovan-")).toBe(true)
  })

  it("should return unique ids on each call", () => {
    const ids = new Set<string>()
    for (let i = 0; i < 10000; i++) {
      ids.add(generateRandomId())
    }
    expect(ids.size).toBe(10000)
  })
})
