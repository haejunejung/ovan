# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**hoyst** is an overlay library (modals, toasts, dialogs) for **React** (web) and **React Native**. It extends the declarative overlay pattern from [overlay-kit](https://github.com/toss/overlay-kit) with Slot-based context preservation and native layer conflict resolution via `react-native-teleport`.

## Repository Structure

Monorepo using **pnpm workspaces** with three workspace members:

- `packages/` — the `hoyst` library (published as `hoyst` on npm)
- `examples/web/` — Vite-based React web example app
- `examples/app/` — Expo React Native example app
- `docs/` — Fumadocs documentation site (Next.js)

## Commands

All commands run from the repo root unless noted.

```bash
# Install dependencies
pnpm install

# Build the library (rolldown, outputs to packages/dist/)
cd packages && pnpm build

# Run tests (vitest, jsdom environment)
cd packages && pnpm test

# Run a single test file
cd packages && pnpm exec vitest run src/core/overlay-reducer.test.ts

# Watch mode for tests
cd packages && pnpm dev

# Lint (oxlint, auto-fix)
cd packages && pnpm lint

# Format (oxfmt, auto-fix)
cd packages && pnpm format

# Check only (no write) — useful for CI
cd packages && pnpm lint:check
cd packages && pnpm format:check
```

## Code Style & Tooling

- **oxlint** for linting (configured in `.oxlintrc.json` at root) — correctness errors, suspicious warnings, with typescript/react/import plugins
- **oxfmt** for formatting (configured in `.oxfmtrc.json` at root) — indent 2 spaces, line width 80, double quotes, no semicolons (ASI), trailing commas everywhere
- **TypeScript** with strict mode, target ES2020, `moduleResolution: "bundler"`, JSX react-jsx
- **Lefthook** pre-commit hook runs oxfmt + oxlint on staged files
- ESM only (`"type": "module"` in both root and packages)

## Architecture

### Core / Platform Split

The library uses a **core + adapter** pattern:

- `packages/src/core/` — Platform-agnostic logic: overlay state management, event emitter (mitt-based), reducer, context, slot system. This is the bulk of the code.
- `packages/src/web/` — Web adapter using `ReactDOM.createPortal` + a custom `createTeleporter` for slot-to-host teleportation.
- `packages/src/native/` — React Native adapter using `react-native-teleport` for native-level portal support.

Both `web/index.ts` and `native/index.ts` re-export everything from `core/` plus their platform-specific adapter.

### Key Modules in Core

- **`create-overlay-provider.tsx`** — Factory function `createOverlayProvider(adapter?)` that creates the entire overlay API: `OverlayProvider`, `OverlaySlot`, `useOverlay`, `overlay` object, and context hooks. Each call creates an isolated overlay tree.
- **`create-overlay.ts`** — Creates the imperative `overlay` API (`open`, `openAsync`, `close`, `unmount`, `closeAll`, `unmountAll`) that communicates with the Provider via a mitt event emitter.
- **`overlay-reducer.ts`** — Pure reducer managing `OverlayData` state (ADD, OPEN, CLOSE, REMOVE actions).
- **`create-overlay-slot.tsx`** — Implements `OverlaySlot` which renders slot-owned overlays within the slot's React tree for context inheritance, then teleports them to the host.
- **`overlay-controller-content.tsx`** — Bridges the reducer state to the overlay controller component props (`isOpen`, `close`, `unmount`).
- **`types.ts`** — Core type definitions: `OverlayControllerProps`, `OverlayAsyncControllerProps<T>`, `OverlayItem`, `OverlayData`.

### Build Output

Rolldown produces two entrypoints in `packages/dist/`:
- `dist/web/index.js` + `.d.ts` — for `hoyst/web` (or bare `hoyst` import)
- `dist/native/index.js` + `.d.ts` — for `hoyst/native` (also auto-selected via `react-native` exports condition)

### Testing

- **Vitest** with **jsdom** environment and `@testing-library/react`
- Tests are co-located with source files (`*.test.ts` / `*.test.tsx` in `packages/src/`)
- Setup file: `packages/vitest.setup.ts` (imports `@testing-library/jest-dom/vitest`)
