# ovan

<p align="center">
  <strong>Teleport your overlays.</strong> An overlay library for React and React Native.
</p>

---

**ovan** is an overlay library for **modals, toasts, and dialogs** on **React** (web) and **React Native**. It provides Slot-based context preservation, close/unmount separation, Promise-based result returns, and fundamentally solves the native layer stacking issues in React Native.

## Credits

ovan's design and much of its implementation are derived from [**overlay-kit**](https://github.com/toss/overlay-kit) by [Toss](https://toss.im). The declarative overlay pattern established by overlay-kit — imperative calls, close/unmount separation, Promise-based results — is the core philosophy of ovan as well. We extended it with Slot-based context preservation, React Native native layer conflict resolution, and platform adapters (web: createPortal, RN: react-native-teleport). Thank you to the overlay-kit authors and contributors.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

See [LICENSE](./LICENSE).