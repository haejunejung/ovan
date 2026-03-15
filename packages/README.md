# hoyst

<p align="center">
  <strong>Teleport your overlays.</strong><br/>
  An overlay library for React and React Native.
</p>

---

**hoyst** manages **modals, toasts, and dialogs** on **React** and **React Native** with:

- **Direct imports** — `import { overlay, OverlayProvider } from "hoyst"` and go
- **Slot-based context preservation** — overlays inherit React context from where they're opened
- **close/unmount separation** — exit animations and state preservation built-in
- **Promise-based results** — `await overlay.openAsync(ConfirmDialog)` returns user responses
- **Native layer resolution** — solves React Native JS/native view hierarchy conflicts via `react-native-teleport`

## Install

```bash
# React (web)
pnpm add hoyst

# React Native
pnpm add hoyst react-native-teleport
```

## Usage

```tsx
import { overlay, OverlayProvider, OverlaySlot } from "hoyst"

function Modal({ isOpen, close, unmount }) {
  return (
    <dialog open={isOpen}>
      <p>Hello!</p>
      <button onClick={close}>Close</button>
    </dialog>
  )
}

function App() {
  return (
    <OverlayProvider>
      <OverlaySlot />
      <button onClick={() => overlay.open(Modal)}>Open</button>
    </OverlayProvider>
  )
}
```

## Documentation

Full docs, interactive examples, and API reference: **[hoyst docs](https://hoyst.dev)**

## Credits

Built on the declarative overlay pattern from [**overlay-kit**](https://github.com/toss/overlay-kit) by [Toss](https://toss.im), extended with Slot-based context preservation and React Native native layer resolution.

## License

[MIT](./LICENSE)
