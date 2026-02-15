export function generateRandomId() {
  return `ovan-${Math.random().toString(36).substring(2, 15)}`
}
