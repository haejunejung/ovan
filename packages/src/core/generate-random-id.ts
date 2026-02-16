/**
 * Generate ovan prefixed random id
 */
export function generateRandomId() {
  return `ovan-${Math.random().toString(36).slice(2, 11)}`
}
