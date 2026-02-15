# ovan

<p align="center">
  <strong>Teleport your overlays.</strong> An overlay library for React and React Native.
</p>

> **🚧 Work in Progress** — ovan is currently under active development and has not been published to npm yet. The API described below is subject to change. Star or watch this repo to get notified when the first release is available.

---

**ovan** is an overlay library for **modals, toasts, and dialogs** on **React** (web) and **React Native**. It provides Slot-based context preservation, close/unmount separation, Promise-based result returns, and fundamentally solves the native layer stacking issues in React Native.

This document explains why ovan exists, what problems it solves, how to install and use it, and how it works under the hood.

---

## Table of contents

- [Why ovan?](#why-ovan)
- [What ovan solves](#what-ovan-solves)
- [Installation](#installation)
- [Usage](#usage)
- [API reference](#api-reference)
- [open vs openAsync](#open-vs-openasync)
- [close vs unmount](#close-vs-unmount)
- [OverlaySlot and useOverlay](#overlayslot-and-useoverlay)
- [Multiple overlay trees](#multiple-overlay-trees)
- [Credits](#credits)
- [License](#license)

---

## Why ovan?

### The problem with traditional overlay management

Apps need **overlays** — modals, dialogs, toasts, and other UI that appears "on top" of the main screen. But implementing them properly in React leads to recurring pain points.

**1. State management complexity**

You had to manage overlay open/close state manually with `useState` or global state. State logic and UI logic became entangled, making code complex and hard to read.

```tsx
// 😩 This pattern repeats for every overlay
const [isModalOpen, setIsModalOpen] = useState(false)
const [isConfirmOpen, setIsConfirmOpen] = useState(false)
const [isToastOpen, setIsToastOpen] = useState(false)
```

**2. Repetitive event handling**

Open, close, and result-return logic had to be written repeatedly for each overlay. This led to duplicated code and a degraded developer experience.

**3. Poor reusability**

Returning values from an overlay required callbacks that tightly coupled UI and logic, making components difficult to reuse.

```tsx
// 😩 Callbacks tightly couple UI and logic
<ConfirmModal
  isOpen={isOpen}
  onConfirm={(value) => {
    setResult(value)
    setIsOpen(false)
  }}
  onCancel={() => setIsOpen(false)}
/>
```

### How overlay-kit solved this

[**overlay-kit**](https://github.com/toss/overlay-kit) by [Toss](https://toss.im) introduced a Declarative Overlay Pattern built on React's philosophy, solving these problems.

The core ideas of overlay-kit are:

- **Imperative call, declarative management** — You call `overlay.open(Component)` imperatively, but the overlay's lifecycle (open, close, remove) is managed declaratively by the library.
- **No state management needed** — No more `useState` for each overlay's visibility. The library tracks overlay state internally.
- **Promise-based results** — `openAsync` lets you `await` user responses without callbacks, decoupling UI from logic.
- **close vs unmount separation** — Distinguishing "hide (animate out)" from "remove (free memory)" makes exit animations and state preservation natural.

overlay-kit made overlay management in React significantly cleaner.

### So why ovan?

overlay-kit solves the "call site ≠ render location" problem simply by placing OverlayProvider at the top of the app. This works well for most cases. However, there are challenges that overlay-kit alone cannot address.

**1. Context preservation**

In overlay-kit, overlays render at the top-level Provider position. This works in most cases, but becomes a problem when overlays need **React context** (theme, router, i18n, etc.) from the branch that opened them. Since the Provider is at the root of the tree, context from intermediate levels is inaccessible to overlays. Previously, the workarounds were hoisting all providers to the root or manually re-propagating context inside overlays, but each had significant limitations (see the detailed comparison in [OverlaySlot and useOverlay](#overlayslot-and-useoverlay)).

ovan solves this fundamentally with **Slots**. Overlays opened via a Slot's render-prop or `useOverlay()` hook are **rendered within that Slot's React tree** — inheriting its context naturally — then **teleported** into the host (web: `createPortal`, RN: `react-native-teleport`) to appear on top. No need to hoist providers or manually re-propagate context.

**2. Native layer conflicts in React Native**

React Native has no built-in `createPortal` equivalent ([react-native#36273](https://github.com/facebook/react-native/issues/36273)). Existing JS-based portal solutions (`@gorhom/react-native-portal`, `react-native-paper`'s Portal, etc.) **break React context** — custom contexts like navigation or app state become unavailable inside portaled content.

The more fundamental issue is **the conflict between JS-layer and native-layer overlays**. Overlay implementations in React Native fall into two categories:

- **JS-layer overlays** — overlay-kit's modals, custom modal components, etc. Rendered as `View`s within the React tree, positioned with `z-index` and `position: absolute`.
- **Native-layer overlays** — RN's built-in `Modal`, `createNativeStackNavigator`'s modal screens, `@gorhom/bottom-sheet`'s `BottomSheetModal`, etc. These render in a separate native view hierarchy (iOS UIWindow, Android Window/Activity).

These two layers exist in **different view hierarchies**, making `z-index` useless for controlling stacking order. For example, when using `@gorhom/bottom-sheet` with overlay-kit:

- Opening an overlay-kit modal while a BottomSheet is active may render the modal **behind** the BottomSheet, depending on the Provider's position.
- Attempting to display a JS-based overlay above a `createNativeStackNavigator` modal screen fails because the native modal exists in a separate window layer.
- No amount of `z-index` fixes this — it's an issue between different native view hierarchies.

> Related issues: [gorhom/react-native-bottom-sheet#1644](https://github.com/gorhom/react-native-bottom-sheet/issues/1644), [gorhom/react-native-bottom-sheet#1378](https://github.com/gorhom/react-native-bottom-sheet/issues/1378), [gorhom/react-native-bottom-sheet Discussion#2081](https://github.com/gorhom/react-native-bottom-sheet/discussions/2081)

ovan solves this using [**react-native-teleport**](https://github.com/kirillzyusko/react-native-teleport). Unlike JS-based portals, react-native-teleport **repositions views at the native level** (Fabric's `ReactNativeFabricUIManager.createPortal`, Paper's `UIManager.createPortal`). This preserves React context while placing overlays exactly where needed in the native view hierarchy, fundamentally resolving JS/native layer conflicts.

### In summary

ovan builds on the declarative overlay pattern established by overlay-kit, adding **Slot-based context preservation** and **native layer conflict resolution** (`react-native-teleport`). It inherits overlay-kit's core values (imperative calls, close/unmount separation, Promise-based results) while supporting both web and React Native.

---

## What ovan solves

| Need | How ovan helps |
| --- | --- |
| **Open a modal from anywhere** | Call `overlay.open(Modal)` (global, no slot) or use **`useOverlay()`** / **OverlaySlot render-prop** to tie the overlay to a specific slot, inheriting its React context. Events connect the call to the provider — no need to pass callbacks down. |
| **Render on top (web & RN)** | **OverlayProvider** renders a single **host**. Slot-owned overlays render in that Slot's React tree (inheriting context) then **teleport** into the host, escaping overflow/z-index. Global `overlay` (no slot) renders at the Provider. |
| **Close with animation, keep state** | Use `close()`. The overlay's `isOpen` becomes `false` but the node stays mounted. Run exit animations and preserve state; reopen with the same `overlayId` to show the same instance. |
| **Remove and free memory** | Use `unmount()`. Removes the overlay from the list and the tree. Call it when you don't need animation, or after the close animation finishes (e.g. in `onExited` or a `useEffect` cleanup). |
| **Get a result from the user** | Use `overlay.openAsync(ConfirmModal)`. The Promise resolves when the overlay calls `close(value)` and rejects when it calls `reject(reason)`. |
| **Support both web and RN** | Import from `ovan/web` for web or `ovan/native` for React Native. Only the entrypoint and internal rendering strategy (adapter) differ. |

---

## Installation

ovan is published as a **single package** (`ovan`) with separate entrypoints for web (`ovan/web`) and native (`ovan/native`), built via tsup. Import from the entrypoint that matches your platform.

### React (web)

Requires **React 18+** and **react-dom**.

```bash
# pnpm
pnpm add ovan react react-dom

# npm
npm install ovan react react-dom

# yarn
yarn add ovan react react-dom

# bun
bun add ovan react react-dom
```

### React Native

Requires **React**, **React Native**, and **react-native-teleport** (for rendering overlays at the root of the native view hierarchy while preserving React context).

```bash
# pnpm
pnpm add ovan react react-native react-native-teleport

# npm
npm install ovan react react-native react-native-teleport

# yarn
yarn add ovan react react-native react-native-teleport

# bun
bun add ovan react react-native react-native-teleport
```

> **Note:** See the [react-native-teleport](https://github.com/kirillzyusko/react-native-teleport) documentation for setup and compatibility (e.g. New Architecture).

### Package structure

```
ovan
├── ovan/web       # React (web) entrypoint — createPortal-based
└── ovan/native    # React Native entrypoint — react-native-teleport-based
```

Both entrypoints expose the same public API. Only the internal rendering strategy (adapter) differs per platform.

---

## Usage

### Step 1: Create a setup module

ovan doesn't expose `OverlayProvider` or `overlay` for direct import. First call **`createOverlayProvider()`** to create your overlay API, then use the returned components and methods throughout your app.

**React (web):**

```tsx
// overlay-setup.tsx
import { createOverlayProvider } from 'ovan/web'

export const {
  overlay,
  OverlayProvider,
  OverlaySlot,
  useCurrentOverlay,
  useOverlay,
  useOverlayData,
  useOverlayState,
} = createOverlayProvider()
```

**React Native:**

```tsx
// overlay-setup.tsx
import { createOverlayProvider } from 'ovan/native'

export const {
  overlay,
  OverlayProvider,
  OverlaySlot,
  useOverlay,
  useOverlayState,
  // ...
} = createOverlayProvider()
```

When called without arguments, the platform's default adapter (web: `createPortal`, RN: `react-native-teleport`) is applied automatically.

If you need to control the `PortalHost` position or layout in React Native, you can pass a **custom adapter**:

```tsx
// overlay-setup.tsx — custom adapter
import { createOverlayProvider } from 'ovan/native'

export const { overlay, OverlayProvider, OverlaySlot, useOverlay } =
  createOverlayProvider({
    renderHost: () => <MyCustomPortalHost />,
  })
```

### Step 2: Import from your setup module

In your app, always import **from the setup module**, not from `ovan/web` or `ovan/native` directly.

```tsx
// ✅ Correct
import { OverlayProvider, OverlaySlot, overlay } from './overlay-setup'

// ❌ Incorrect
import { OverlayProvider } from 'ovan/web'
```

### Step 3: Place Provider and Slot

Wrap your app (or the part that uses overlays) with **OverlayProvider**. The Provider renders a single **host**; all overlay DOM/native nodes are teleported there.

**OverlaySlot** acts as the "owner" of overlays. Overlays opened from a Slot render in that Slot's React tree (inheriting context) then teleport to the host.

```tsx
import { OverlayProvider, OverlaySlot, overlay } from './overlay-setup'
import type { OverlayControllerComponent } from 'ovan/web'

const MyModal: OverlayControllerComponent = ({ isOpen, close }) => (
  <div className="modal" role="dialog" aria-hidden={!isOpen}>
    <p>Hello</p>
    <button type="button" onClick={close}>
      Close
    </button>
  </div>
)

function App() {
  return (
    <OverlayProvider>
      <OverlaySlot />
      <button onClick={() => overlay.open(MyModal, { overlayId: 'demo' })}>
        Open modal
      </button>
    </OverlayProvider>
  )
}
```

### Where overlays render

- **Global `overlay`** — `overlay.open(Modal)` renders at the Provider with no Slot context.
- **From a Slot** — Via `useOverlay()` or the Slot's render-prop, the overlay renders in that Slot's React tree (inheriting context) then teleports to the host.

### Opening an overlay

```tsx
overlay.open(Controller, options?)
```

- **First argument**: A **controller component** that receives `{ overlayId, isOpen, close, unmount }` as props.
- **Second argument** (optional): e.g. `{ overlayId: 'my-modal' }`. Using the same `overlayId` reuses the same instance (state preserved when closed and reopened).

### Props received by the overlay component

| Prop | Description |
| --- | --- |
| **`overlayId`** | The id passed in options (or auto-generated). |
| **`isOpen`** | Becomes `false` after `close()`. Use for visibility control and accessibility (e.g. `aria-hidden={!isOpen}`). |
| **`close()`** | Sets `isOpen` to `false`. The overlay stays mounted, allowing exit animations. Call `unmount()` when the animation finishes. |
| **`unmount()`** | Removes the overlay from the tree entirely. Use when no animation is needed, or after the close animation completes. |

### React Native: PortalProvider setup

On React Native, overlays render via **react-native-teleport**. You must wrap your app with **`PortalProvider`**.

```tsx
import { PortalProvider } from 'ovan/native'
import { OverlayProvider, OverlaySlot } from './overlay-setup'

function App() {
  return (
    <PortalProvider>
      <OverlayProvider>
        <YourContent />
        <OverlaySlot />
      </OverlayProvider>
    </PortalProvider>
  )
}
```

Place `PortalProvider` at the root or only around the screens that use overlays — whatever matches your app structure.

---

## API reference

### Package exports (`ovan/web` or `ovan/native`)

| Export | Description |
| --- | --- |
| **`createOverlayProvider(adapter?)`** | **Call this first** (e.g. in `overlay-setup.tsx`). Returns `{ overlay, OverlayProvider, OverlaySlot, useOverlay, useCurrentOverlay, useOverlayData, useOverlayState }`. When called without arguments, the platform's default adapter is used. Pass a custom adapter to control `PortalHost` positioning in RN. |
| **`PortalProvider`** | **(React Native only)** Wrap your tree for overlay teleportation. |

### Returned by `createOverlayProvider(adapter?)`

| Member | Description |
| --- | --- |
| **`overlay`** | Object with `open`, `close`, `unmount`, `openAsync`, etc. Use for global overlay opening (no Slot; renders at Provider, no Slot context). |
| **`OverlayProvider`** | Provider component. Wrap your app (or the part that uses overlays). |
| **`OverlaySlot`** | Declares a slot. Children: **ReactNode** or **(overlay) => ReactNode** (render-prop). Slot-owned overlays render in this Slot's tree then teleport to the host. |
| **`useOverlay()`** | Returns an overlay object bound to the **nearest ancestor OverlaySlot**. Must be called **inside** a Slot. Same API as `overlay`. |
| **`useCurrentOverlay()`** | Reads the current overlay id (and related info) inside the provider. |
| **`useOverlayData()`** | Reads overlay data (e.g. list, state) inside the provider. |
| **`useOverlayState()`** | Returns the full overlay state (for devtools or advanced use). |

### TypeScript types

Import from `ovan/web` or `ovan/native`.

| Type | Description |
| --- | --- |
| **`OverlayControllerComponent`** | Standard overlay controller component type. Receives `{ overlayId, isOpen, close, unmount }` as props. |
| **`OverlayAsyncControllerComponent<T>`** | Async overlay controller component type. Resolves with `close(value: T)`, rejects with `reject(reason)`. |
| **`OverlayControllerProps`** | Props type for controller components. |
| **`OverlayAsyncControllerProps<T>`** | Props type for async controller components. |
| **`OverlaySlotHandle`** | Slot handle type (for ref usage). |
| **`OverlaySlotChildren`** | Slot children type (`ReactNode | (overlay) => ReactNode`). |

---

## open vs openAsync

ovan provides two ways to open overlays. **`open`** simply displays an overlay, while **`openAsync`** returns a **Promise** that resolves with a value from the overlay.

### `overlay.open(Controller, options?)`

Opens an overlay and returns immediately. Use for simple notifications, toasts, or modals that don't need to return a result.

```tsx
const InfoModal: OverlayControllerComponent = ({ isOpen, close, unmount }) => (
  <div className="modal" role="dialog" aria-hidden={!isOpen}>
    <p>Task completed.</p>
    <button type="button" onClick={() => { close(); /* unmount after animation */ }}>
      OK
    </button>
  </div>
)

// Call
overlay.open(InfoModal, { overlayId: 'info' })
```

### `overlay.openAsync(Controller, options?)`

Opens an overlay and returns a **Promise**. Use when you need to wait for a user's choice or input.

- Calling **`close(value)`** inside the overlay **resolves** the Promise.
- Calling **`reject(reason)`** **rejects** the Promise.

The controller component receives `close` and `reject` as additional props. In TypeScript, use **`OverlayAsyncControllerComponent<T>`** to specify the resolve type.

```tsx
import type { OverlayAsyncControllerComponent } from 'ovan/web'

const ConfirmDialog: OverlayAsyncControllerComponent<boolean> = ({
  isOpen,
  close,
  reject,
}) => (
  <div className="modal" role="dialog" aria-hidden={!isOpen}>
    <p>Are you sure you want to delete?</p>
    <button type="button" onClick={() => close(true)}>
      Yes
    </button>
    <button type="button" onClick={() => close(false)}>
      No
    </button>
    <button type="button" onClick={() => reject(new Error('Cancelled'))}>
      Cancel
    </button>
  </div>
)

// Call
async function handleDelete() {
  try {
    const confirmed = await overlay.openAsync(ConfirmDialog)
    if (confirmed) {
      // perform deletion
    }
  } catch (e) {
    // user cancelled
  }
}
```

### When to use which?

| Scenario | Method |
| --- | --- |
| Notifications, toasts, simple modals (no result needed) | `overlay.open()` |
| Confirm dialogs (Yes/No) | `overlay.openAsync()` |
| Modals that need to capture form input | `overlay.openAsync()` |
| Modals where the user must pick from options | `overlay.openAsync()` |

> **Tip:** If the user can dismiss without choosing (e.g. backdrop tap), call `reject(...)` so the caller can handle the cancellation.

---

## close vs unmount

ovan clearly separates "closing" and "removing" an overlay. This distinction is key to animation and state management.

### `close(overlayId?)`

- Sets the overlay's **`isOpen`** to `false`.
- The overlay **stays in the tree**. You can run exit animations and internal state (e.g. form input) is preserved.
- Reopening with the same `overlayId` shows the **same instance** (state preserved).
- Call **`unmount()`** after the animation finishes to free memory.

### `unmount(overlayId?)`

- **Removes** the overlay from the list and the **React tree**.
- Disappears immediately with no exit animation.
- Use when no animation is needed, or **after `close()`** once the animation has finished.

### Common pattern

```tsx
const AnimatedModal: OverlayControllerComponent = ({ isOpen, close, unmount }) => {
  return (
    <AnimatePresence onExitComplete={unmount}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p>Modal content</p>
          <button onClick={close}>Close</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

The flow in this pattern:

1. User clicks "Close" → `close()` called → `isOpen` becomes `false`
2. `AnimatePresence` runs the exit animation
3. Animation complete → `onExitComplete` calls `unmount()`
4. Overlay removed from the tree, memory freed

### Summary

| Behavior | `close()` | `unmount()` |
| --- | --- | --- |
| `isOpen` change | Set to `false` | N/A (node itself is removed) |
| Stays in tree | ✅ Yes | ❌ Removed |
| Exit animation | Possible | Not possible (removed immediately) |
| State preservation | ✅ Preserved | ❌ Lost |
| Reuse (same id) | ✅ Same instance | ❌ New instance required |

---

## OverlaySlot and useOverlay

### Why Slots? — The context preservation problem and existing alternatives

React Native has no built-in equivalent to web's `createPortal` ([react-native#36273](https://github.com/facebook/react-native/issues/36273)). On the web, `ReactDOM.createPortal` moves the DOM position while preserving the React tree, so context is automatically maintained. In React Native, rendering overlays in a different location breaks context. Existing alternatives and their limitations:

**Alternative 1: Provider Hoisting**

The simplest approach: hoist all context providers that overlays need to the app root. overlay-kit uses this strategy, and it's the default pattern in most apps.

However, context that exists below the root (e.g. local context of a specific screen, nested navigation route params) becomes inaccessible to overlays. Hoisting everything to the root is often impractical.

**Alternative 2: Manual Context Re-propagation**

Manually re-wrapping needed context providers inside the overlay. [Tamagui](https://tamagui.dev) v1 used this strategy, and [react-native-paper](https://github.com/callstack/react-native-paper) Portal users commonly applied this workaround.

```tsx
// Manually re-providing context inside the overlay
<Portal>
  <ThemeProvider theme={currentTheme}>
    <NavigationContext.Provider value={navigation}>
      <MyOverlayContent />
    </NavigationContext.Provider>
  </ThemeProvider>
</Portal>
```

This approach is verbose and error-prone. Every time a new context is added, the re-propagation code must be updated — miss one and it breaks at runtime. Tamagui auto-propagated its own contexts (theme, config) but required users to manually handle custom contexts (navigation, app state). They even provided a `needsPortalRepropagation()` helper, acknowledging the severity of the problem. Tamagui v2 ultimately moved to native portals via `react-native-teleport`.

> References: [Tamagui Portal docs — Context re-propagation](https://tamagui.dev/ui/portal), [Tamagui v2 blog — Native portal transition](https://tamagui.dev/blog/version-two), [react-native-paper#3880](https://github.com/callstack/react-native-paper/issues/3880), [gorhom/react-native-portal#34](https://github.com/gorhom/react-native-portal/issues/34)

**ovan's approach: Slot + native teleport**

ovan introduces **OverlaySlot** to fundamentally solve this problem. Overlays opened from a Slot render within that Slot's React tree — inheriting context naturally — then teleport to the host to appear on top. No need to hoist providers or manually re-propagate context.

### What is OverlaySlot?

**OverlaySlot** is a component that marks an overlay "owner" in the tree. Overlays opened from a Slot have two advantages:

1. **Context inheritance** — The overlay renders within the Slot's React tree, naturally inheriting all context at that position (theme, router, i18n, etc.).
2. **Physical teleport** — After rendering, it teleports to the Provider's host, unaffected by parent `overflow: hidden` or `z-index`, appearing on top of everything.

### Two ways to open from a Slot

#### Method 1: Render-prop

Pass a function as the Slot's children to receive an `overlay` object bound to that Slot. No hook needed.

```tsx
<OverlaySlot>
  {(overlay) => (
    <div>
      <h1>Section A</h1>
      <button onClick={() => overlay.open(MyModal, { overlayId: 'a-modal' })}>
        Open modal
      </button>
    </div>
  )}
</OverlaySlot>
```

This is most convenient when the trigger is a direct child of the Slot.

#### Method 2: useOverlay() hook

`useOverlay()` returns an overlay object bound to the **nearest ancestor OverlaySlot**. Useful when you need to open an overlay from deep within the Slot's subtree.

```tsx
function DeepChild() {
  const overlay = useOverlay()

  return (
    <button onClick={() => overlay.open(MyModal, { overlayId: 'deep-modal' })}>
      Open modal
    </button>
  )
}

// Inside a Slot
<OverlaySlot>
  <SomeWrapper>
    <DeepChild /> {/* useOverlay() binds to the nearest OverlaySlot */}
  </SomeWrapper>
</OverlaySlot>
```

> **Note:** `useOverlay()` must be called within a **descendant** of an OverlaySlot. Calling it outside a Slot will throw an error.

### Global overlay vs Slot overlay

| | Global `overlay` | Slot's `overlay` / `useOverlay()` |
| --- | --- | --- |
| Context inheritance | ❌ Only Provider-level context | ✅ All context at the Slot's position |
| Render location | Directly at Provider | Renders in Slot tree → teleports to host |
| When to use | Simple overlays that don't need context | Overlays that need theme, router, etc. |

### Multiple Slots

You can place separate Slots per tab or section. Each Slot's overlays inherit that Slot's context.

```tsx
<OverlayProvider>
  {/* Tab A's Slot */}
  <OverlaySlot>
    {(overlay) => <TabA overlay={overlay} />}
  </OverlaySlot>

  {/* Tab B's Slot */}
  <OverlaySlot>
    {(overlay) => <TabB overlay={overlay} />}
  </OverlaySlot>
</OverlayProvider>
```

All overlay nodes teleport to a single host, so stacking (z-index, order) is managed by your app. Set z-index on your overlay content's root node.

---

## Multiple overlay trees

If you need **separate overlay trees** (e.g. per section or feature), call **`createOverlayProvider()`** again. It returns a new `{ overlay, OverlayProvider, OverlaySlot, useOverlay, ... }`.

```tsx
// feature-a-overlay.tsx
import { createOverlayProvider } from 'ovan/web'

export const {
  overlay: featureAOverlay,
  OverlayProvider: FeatureAOverlayProvider,
  OverlaySlot: FeatureAOverlaySlot,
  useOverlay: useFeatureAOverlay,
} = createOverlayProvider()

// feature-b-overlay.tsx
import { createOverlayProvider } from 'ovan/web'

export const {
  overlay: featureBOverlay,
  OverlayProvider: FeatureBOverlayProvider,
  OverlaySlot: FeatureBOverlaySlot,
  useOverlay: useFeatureBOverlay,
} = createOverlayProvider()
```

Each Provider has its own host and manages overlays independently. A single `createOverlayProvider` is sufficient for a typical app-wide overlay stack; this feature is only needed for special cases.

---

## Credits

ovan's design and much of its implementation are derived from [**overlay-kit**](https://github.com/toss/overlay-kit) by [Toss](https://toss.im). The declarative overlay pattern established by overlay-kit — imperative calls, close/unmount separation, Promise-based results — is the core philosophy of ovan as well. We extended it with Slot-based context preservation, React Native native layer conflict resolution, and platform adapters (web: createPortal, RN: react-native-teleport). Thank you to the overlay-kit authors and contributors.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

See [LICENSE](./LICENSE).