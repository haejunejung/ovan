/**
 * Generate hoyst prefixed random id
 */
export function generateRandomId() {
  return `hoyst-${Math.random().toString(36).slice(2, 11)}`
}
