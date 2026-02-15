import { describe, expect, it } from "vitest"
import { generateRandomId } from "./generate-random-id"

describe("generateRandomId", () => {
  it("should generate a random id that starts with 'ovan-'", () => {
    const id = generateRandomId()
    expect(id).toBeDefined()
    expect(id).toMatch(/ovan-\w+/)
  })

  it("should generate a random id that is unique", () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      const id = generateRandomId()
      ids.add(id)
    }
    expect(ids.size).toBe(100)
  })
})
