import mitt from "mitt"

export const eventEmitter = mitt<Record<string, unknown>>()
