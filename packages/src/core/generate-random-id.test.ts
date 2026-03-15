import { describe, expect, it } from "vitest"
import { generateRandomId } from "./generate-random-id"

describe("generaterRandomId", () => {
  it("should return a string with hoyst prefix", () => {
    const id = generateRandomId()
    expect(id).toMatch(/^hoyst-[a-z0-9]+$/)
    expect(id.startsWith("hoyst-")).toBe(true)
  })

  it("should return unique ids on each call", () => {
    const ids = new Set<string>()
    for (let i = 0; i < 10000; i++) {
      ids.add(generateRandomId())
    }
    expect(ids.size).toBe(10000)
  })
})
