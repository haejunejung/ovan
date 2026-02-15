# ovan

<p align="center">
  <strong>Teleport your overlays.</strong> React와 React Native를 위한 단일 오버레이 API.
</p>

> **🚧 Work in Progress** — ovan은 현재 개발 중이며 아직 npm에 배포되지 않았습니다. 아래 API는 변경될 수 있습니다. Star 또는 Watch를 눌러두시면 첫 릴리스 시 알림을 받을 수 있습니다.

---

**ovan**은 **React**(웹)과 **React Native**에서 **모달, 토스트, 다이얼로그** 등의 오버레이를 관리하는 라이브러리입니다. Slot 기반의 context 보존, close/unmount 분리, Promise 기반 결과 반환 등 선언적 오버레이 패턴을 제공하며, React Native의 네이티브 레이어 문제를 근본적으로 해결합니다.

이 문서는 ovan이 왜 필요한지, 어떤 문제를 해결하는지, 설치·사용 방법, 그리고 내부 동작 원리를 설명합니다.

---

## 목차

- [Why ovan?](#why-ovan)
- [What ovan solves?](#what-ovan-solves)
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

### 기존 오버레이 관리의 문제점

앱을 만들다 보면 **오버레이**(모달, 다이얼로그, 토스트 등)가 반드시 필요합니다. 하지만 React에서 오버레이를 직접 구현하면 매번 비슷한 문제에 부딪힙니다.

**1. 상태 관리의 복잡성**

`useState`나 전역 상태를 사용해 직접 오버레이의 열림/닫힘을 관리해야 했습니다. 상태 관리와 UI 로직이 뒤섞여 코드가 복잡해지고 가독성이 떨어졌습니다.

```tsx
// 😩 오버레이마다 이런 상태 관리가 반복됩니다
const [isModalOpen, setIsModalOpen] = useState(false)
const [isConfirmOpen, setIsConfirmOpen] = useState(false)
const [isToastOpen, setIsToastOpen] = useState(false)
```

**2. 이벤트 핸들링의 반복**

열기, 닫기, 결과 반환 같은 이벤트 핸들링 코드를 매번 반복해서 작성해야 했습니다. 이는 중복 코드를 유발하고 개발 경험을 저하시키는 주요 원인이었습니다.

**3. 재사용성 부족**

오버레이에서 값을 반환하려면 callback 함수 등으로 UI와 로직이 강하게 결합되었습니다. 이로 인해 컴포넌트를 재사용하기 어려웠습니다.

```tsx
// 😩 callback이 UI와 강하게 결합됩니다
<ConfirmModal
  isOpen={isOpen}
  onConfirm={(value) => {
    setResult(value)
    setIsOpen(false)
  }}
  onCancel={() => setIsOpen(false)}
/>
```

### overlay-kit의 등장

[Toss](https://toss.im)의 [**overlay-kit**](https://github.com/toss/overlay-kit)은 React 철학을 기반으로 이러한 문제들을 해결한 선언적 오버레이 패턴(Declarative Overlay Pattern)을 제시했습니다.

overlay-kit의 핵심 아이디어는 다음과 같습니다.

- **명령형 호출, 선언형 관리** — `overlay.open(Component)`처럼 명령형으로 호출하되, 오버레이의 생명주기(열기, 닫기, 제거)는 라이브러리가 선언적으로 관리합니다.
- **상태 관리 불필요** — `useState`로 일일이 열림/닫힘을 관리할 필요가 없습니다. 오버레이의 상태는 라이브러리가 추적합니다.
- **Promise 기반 결과 반환** — `openAsync`를 통해 callback 없이 `await`로 사용자의 응답을 받을 수 있습니다. UI와 로직의 결합이 느슨해집니다.
- **close와 unmount의 분리** — "숨기기(애니메이션)"와 "제거(메모리 해제)"를 구분하여, 종료 애니메이션과 상태 보존을 자연스럽게 처리합니다.

overlay-kit 덕분에 React에서의 오버레이 관리는 훨씬 깔끔해졌습니다.

### 그렇다면 ovan은 왜 필요한가?

overlay-kit은 OverlayProvider를 앱 최상단에 배치하는 것만으로 "호출 위치 ≠ 렌더링 위치" 문제를 깔끔하게 해결했습니다. 하지만 실제 제품 개발에서는 overlay-kit만으로는 풀리지 않는 과제가 남아 있었습니다.

**1. Context 보존 문제**

overlay-kit에서 오버레이는 최상단 Provider 위치에서 렌더링됩니다. 이는 대부분의 경우 잘 동작하지만, 오버레이가 자신을 연 위치의 **React context**(테마, 라우터, i18n 등)를 필요로 할 때 문제가 됩니다. Provider는 트리의 루트에 있으므로, 중간에 있는 context는 오버레이에서 접근할 수 없습니다. 기존에는 모든 Provider를 루트로 끌어올리거나, 오버레이 내부에서 context를 수동으로 재전파하는 workaround가 사용되었지만, 각각 한계가 있었습니다(자세한 대안 비교는 [OverlaySlot and useOverlay](#overlayslot-and-useoverlay) 섹션을 참고하세요).

ovan은 **Slot** 기반으로 이 문제를 근본적으로 해결합니다. Slot의 render-prop이나 `useOverlay()` 훅을 통해 열린 오버레이는 **해당 Slot의 React 트리 내에서 렌더링**되어 context를 자연스럽게 상속받고, 이후 **호스트로 텔레포트**(웹은 `createPortal`, RN은 `react-native-teleport`)되어 화면 최상단에 표시됩니다. Provider를 루트로 올릴 필요도, context를 수동으로 재전파할 필요도 없습니다.

**2. React Native에서의 레이어 충돌 문제**

React Native에는 웹의 DOM과 달리 `createPortal`이 내장되어 있지 않습니다([react-native#36273](https://github.com/facebook/react-native/issues/36273)). 이로 인해 기존 JS 기반 포탈 솔루션들(`@gorhom/react-native-portal`, `react-native-paper`의 Portal 등)은 **React context가 깨지는 문제**가 있었습니다. 오버레이 내부에서 부모의 theme이나 navigation context에 접근할 수 없게 되는 것입니다.

더 근본적인 문제는 **JS 레이어와 Native 레이어 간의 충돌**입니다. React Native에서 오버레이 구현체들은 크게 두 종류로 나뉩니다.

- **JS 레이어에서 동작하는 오버레이** — overlay-kit의 모달, 커스텀 모달 컴포넌트 등. React 트리 내에서 `View`로 렌더링되며, `z-index`와 `position: absolute`로 위치를 제어합니다.
- **Native 레이어에서 동작하는 오버레이** — RN의 내장 `Modal`, `createNativeStackNavigator`의 모달 스크린, `@gorhom/bottom-sheet`의 `BottomSheetModal` 등. 이들은 별도의 네이티브 뷰 계층(iOS의 UIWindow, Android의 새로운 Activity/Window)에서 렌더링됩니다.

이 두 레이어는 **서로 다른 뷰 계층**에 존재하기 때문에, `z-index`로는 순서를 제어할 수 없습니다. 예를 들어, `@gorhom/bottom-sheet`와 overlay-kit을 함께 사용하면 다음과 같은 문제가 발생합니다.

- BottomSheet가 열려 있는 상태에서 overlay-kit의 모달을 열면, Provider의 위치에 따라 모달이 BottomSheet **아래**에 렌더링될 수 있습니다.
- `createNativeStackNavigator`의 모달 스크린 위에서 JS 기반 오버레이를 표시하려 해도, 네이티브 모달이 별도의 윈도우 계층에 있으므로 JS 오버레이가 그 아래에 가려집니다.
- 이러한 문제는 `z-index` 값을 아무리 높여도 해결되지 않습니다. 서로 다른 네이티브 뷰 계층 간의 문제이기 때문입니다.

> 관련 이슈: [gorhom/react-native-bottom-sheet#1644](https://github.com/gorhom/react-native-bottom-sheet/issues/1644), [gorhom/react-native-bottom-sheet#1378](https://github.com/gorhom/react-native-bottom-sheet/issues/1378), [gorhom/react-native-bottom-sheet Discussion#2081](https://github.com/gorhom/react-native-bottom-sheet/discussions/2081)

ovan은 [**react-native-teleport**](https://github.com/kirillzyusko/react-native-teleport)를 활용하여 이 문제를 해결합니다. `react-native-teleport`는 기존 JS 기반 포탈과 달리, **네이티브 레벨에서 뷰를 재배치**(Fabric의 `ReactNativeFabricUIManager.createPortal`, Paper의 `UIManager.createPortal`)합니다. 이를 통해 React context를 보존하면서도, 오버레이를 네이티브 뷰 계층의 원하는 위치에 정확히 배치할 수 있습니다. JS 레이어와 Native 레이어 간의 충돌 문제가 근본적으로 해결됩니다.

### 정리하면

ovan은 overlay-kit이 확립한 선언적 오버레이 패턴 위에, **Slot 기반 context 보존**과 **React Native 네이티브 레이어 문제 해결**(`react-native-teleport`)을 더한 라이브러리입니다. overlay-kit의 핵심 가치(명령형 호출, close/unmount 분리, Promise 기반 결과 반환)를 그대로 계승하면서, 웹과 React Native 모두를 지원합니다.

---

## What ovan solves?

| 필요한 것 | ovan이 해결하는 방법 |
| --- | --- |
| **어디서든 모달 열기** | `overlay.open(Modal)`(글로벌, Slot 없음)로 호출하거나, **`useOverlay()`** / **OverlaySlot render-prop**을 사용해 특정 Slot에 연결하여 해당 Slot의 React context를 상속받을 수 있습니다. 이벤트가 호출부와 Provider를 연결하므로, 콜백을 트리 아래로 전달할 필요가 없습니다. |
| **최상단에 렌더링 (웹 & RN)** | **OverlayProvider**가 단일 **호스트**를 렌더링합니다. Slot에 속한 오버레이는 해당 Slot의 React 트리에서 렌더링(context 상속)된 뒤 호스트로 **텔레포트**되어 overflow/z-index에 영향받지 않습니다. 글로벌 `overlay`로 연 오버레이(Slot 없음)는 Provider에서 직접 렌더링됩니다. |
| **애니메이션 + 상태 유지하며 닫기** | `close()`를 사용합니다. 오버레이의 `isOpen`이 `false`가 되지만 노드는 마운트 상태로 유지됩니다. 종료 애니메이션을 실행하고 상태를 보존할 수 있으며, 같은 `overlayId`로 다시 열면 같은 인스턴스가 표시됩니다. |
| **메모리 해제** | `unmount()`를 사용합니다. 오버레이를 목록과 트리에서 완전히 제거합니다. 애니메이션이 필요 없거나, 닫기 애니메이션이 끝난 후(예: `onExited` 콜백이나 `useEffect` 정리 함수) 호출합니다. |
| **사용자로부터 결과값 받기** | `overlay.openAsync(ConfirmModal)`을 사용합니다. 오버레이 내부에서 `close(value)`를 호출하면 Promise가 resolve되고, `reject(reason)`을 호출하면 reject됩니다. |
| **웹과 RN 모두 지원** | 웹에서는 `ovan/web`, React Native에서는 `ovan/native`를 import합니다. 내부 렌더링 전략(어댑터)만 다르고, 사용법은 동일합니다. |

---

## Installation

ovan은 **단일 패키지**(`ovan`)로 배포되며, tsup을 통해 웹(`ovan/web`)과 네이티브(`ovan/native`) 엔트리포인트를 분리하여 빌드됩니다. 플랫폼에 맞는 엔트리포인트에서 import하면 됩니다.

### React (웹)

**React 18+** 과 **react-dom**이 필요합니다.

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

**React**, **React Native**, 그리고 **react-native-teleport**(React context를 보존하면서 네이티브 뷰 계층 루트에 오버레이를 렌더링하기 위해 필요)가 필요합니다.

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

> **참고:** [react-native-teleport](https://github.com/kirillzyusko/react-native-teleport) 문서에서 설정 방법과 호환성(예: New Architecture)을 확인하세요.

### 패키지 구조

```
ovan
├── ovan/web       # React (웹) 엔트리포인트 — createPortal 기반
└── ovan/native    # React Native 엔트리포인트 — react-native-teleport 기반
```

두 엔트리포인트는 동일한 공개 API를 제공합니다. 내부 렌더링 전략(어댑터)만 플랫폼에 맞게 다릅니다.

---

## Usage

### 1단계: 셋업 모듈 생성

ovan은 `OverlayProvider`나 `overlay`를 패키지에서 직접 사용하지 않습니다. 먼저 **`createOverlayProvider(adapter)`**를 호출하여 오버레이 API를 생성한 뒤, 반환된 컴포넌트와 메서드를 앱 전체에서 사용합니다.

**React (웹):**

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

인자 없이 호출하면 플랫폼별 기본 어댑터(웹은 `createPortal`, RN은 `react-native-teleport`)가 자동으로 적용됩니다.

React Native에서 `PortalHost`의 위치나 레이아웃을 직접 제어해야 한다면, **커스텀 어댑터**를 전달할 수 있습니다.

```tsx
// overlay-setup.tsx — 커스텀 어댑터 사용
import { createOverlayProvider } from 'ovan/native'

export const { overlay, OverlayProvider, OverlaySlot, useOverlay } =
  createOverlayProvider({
    renderHost: () => <MyCustomPortalHost />,
  })
```

### 2단계: 앱에서 사용

앱에서는 항상 **셋업 모듈**에서 import합니다. `ovan/web`이나 `ovan/native`에서 직접 import하지 않습니다.

```tsx
// ✅ 올바른 사용
import { OverlayProvider, OverlaySlot, overlay } from './overlay-setup'

// ❌ 잘못된 사용
import { OverlayProvider } from 'ovan/web'
```

### 3단계: Provider와 Slot 배치

**OverlayProvider**로 앱(또는 오버레이를 사용하는 부분)을 감쌉니다. Provider는 단일 **호스트**를 렌더링하며, 모든 오버레이의 DOM/네이티브 노드가 여기로 텔레포트됩니다.

**OverlaySlot**은 오버레이의 "소유자" 역할을 합니다. Slot에서 열린 오버레이는 해당 Slot의 React 트리에서 렌더링(context 상속)된 뒤 호스트로 텔레포트됩니다.

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

### 오버레이가 렌더링되는 위치

- **글로벌 `overlay`로 열기** — `overlay.open(Modal)`처럼 호출하면 Slot과 무관하게 Provider에서 직접 렌더링됩니다. 어떤 Slot의 context도 볼 수 없습니다.
- **Slot에서 열기** — `useOverlay()` 또는 Slot의 render-prop을 통해 열면, 오버레이가 해당 Slot의 React 트리에서 렌더링(context 상속)된 뒤 호스트로 텔레포트됩니다.

### 오버레이 열기

```tsx
overlay.open(Controller, options?)
```

- **첫 번째 인자**: `{ overlayId, isOpen, close, unmount }`를 props로 받는 **컨트롤러 컴포넌트**.
- **두 번째 인자** (선택): `{ overlayId: 'my-modal' }` 등의 옵션. 같은 `overlayId`를 사용하면 동일한 인스턴스를 재사용합니다(닫았다가 다시 열면 상태 보존).

### 오버레이 컴포넌트 내부에서 받는 props

| Prop | 설명 |
| --- | --- |
| **`overlayId`** | 옵션으로 전달한 id (또는 자동 생성된 id) |
| **`isOpen`** | `close()` 호출 후 `false`가 됩니다. 가시성 제어와 접근성(예: `aria-hidden={!isOpen}`)에 사용합니다. |
| **`close()`** | `isOpen`을 `false`로 설정합니다. 오버레이는 마운트 상태를 유지하므로 종료 애니메이션 실행이 가능합니다. 애니메이션이 끝나면 `unmount()`를 호출하세요. |
| **`unmount()`** | 오버레이를 트리에서 완전히 제거합니다. 애니메이션이 필요 없거나, 닫기 애니메이션 종료 후 호출합니다. |

### React Native: PortalProvider 설정

React Native에서 오버레이는 **react-native-teleport**를 통해 렌더링됩니다. 앱을 **`PortalProvider`**로 감싸야 합니다.

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

`PortalProvider`는 루트에 배치하거나, 오버레이를 사용하는 스크린 주변에만 배치해도 됩니다.

---

## API reference

### 패키지 export (`ovan/web` 또는 `ovan/native`)

| Export | 설명 |
| --- | --- |
| **`createOverlayProvider(adapter?)`** | **가장 먼저 호출**합니다(예: `overlay-setup.tsx`). `{ overlay, OverlayProvider, OverlaySlot, useOverlay, useCurrentOverlay, useOverlayData, useOverlayState }`를 반환합니다. 인자 없이 호출하면 플랫폼별 기본 어댑터가 적용됩니다. RN에서 `PortalHost` 위치를 직접 제어해야 할 때는 커스텀 어댑터를 전달할 수 있습니다. |
| **`PortalProvider`** | **(React Native 전용)** 오버레이 텔레포트를 위해 트리를 감쌉니다. |

### `createOverlayProvider(adapter)` 반환값

| 멤버 | 설명 |
| --- | --- |
| **`overlay`** | `open`, `close`, `unmount`, `openAsync` 등의 메서드를 가진 객체. 글로벌 오버레이 열기에 사용합니다(Slot 없음, Provider에서 렌더링, Slot context 없음). |
| **`OverlayProvider`** | Provider 컴포넌트. 앱(또는 오버레이를 사용하는 부분)을 감쌉니다. |
| **`OverlaySlot`** | Slot을 선언합니다. children으로 **ReactNode** 또는 **(overlay) => ReactNode**(render-prop)를 받습니다. Slot 소유 오버레이는 이 Slot의 트리에서 렌더링된 뒤 호스트로 텔레포트됩니다. |
| **`useOverlay()`** | **가장 가까운 조상 OverlaySlot**에 바인딩된 overlay 객체를 반환합니다. **반드시 Slot 내부**(또는 render-prop 내)에서 호출해야 합니다. API는 `overlay`와 동일합니다. |
| **`useCurrentOverlay()`** | Provider 내부에서 현재 overlay id(및 관련 정보)를 읽습니다. |
| **`useOverlayData()`** | Provider 내부에서 overlay 데이터(예: 목록, 상태)를 읽습니다. |
| **`useOverlayState()`** | 전체 overlay 상태를 반환합니다(devtools나 고급 사용에 적합). |

### TypeScript 타입

`ovan/web` 또는 `ovan/native`에서 import할 수 있습니다.

| 타입 | 설명 |
| --- | --- |
| **`OverlayControllerComponent`** | 일반 오버레이 컨트롤러 컴포넌트 타입. `{ overlayId, isOpen, close, unmount }` props를 받습니다. |
| **`OverlayAsyncControllerComponent<T>`** | 비동기 오버레이 컨트롤러 컴포넌트 타입. `close(value: T)`로 resolve하고 `reject(reason)`으로 reject합니다. |
| **`OverlayControllerProps`** | 컨트롤러 컴포넌트의 props 타입. |
| **`OverlayAsyncControllerProps<T>`** | 비동기 컨트롤러 컴포넌트의 props 타입. |
| **`OverlaySlotHandle`** | Slot 핸들 타입 (ref 사용 시). |
| **`OverlaySlotChildren`** | Slot의 children 타입 (`ReactNode | (overlay) => ReactNode`). |

---

## open vs openAsync

ovan은 오버레이를 여는 두 가지 방식을 제공합니다. **`open`**은 단순히 오버레이를 표시하고, **`openAsync`**는 오버레이로부터 **결과값을 Promise로 받아올 수 있습니다**.

### `overlay.open(Controller, options?)`

오버레이를 열고 즉시 반환합니다. 단순한 알림, 토스트, 또는 사용자로부터 결과값을 받을 필요가 없는 모달에 사용합니다.

```tsx
const InfoModal: OverlayControllerComponent = ({ isOpen, close, unmount }) => (
  <div className="modal" role="dialog" aria-hidden={!isOpen}>
    <p>작업이 완료되었습니다.</p>
    <button type="button" onClick={() => { close(); /* 애니메이션 후 unmount */ }}>
      확인
    </button>
  </div>
)

// 호출
overlay.open(InfoModal, { overlayId: 'info' })
```

### `overlay.openAsync(Controller, options?)`

오버레이를 열고 **Promise**를 반환합니다. 사용자의 선택이나 입력을 기다려야 할 때 사용합니다.

- 오버레이 내부에서 **`close(value)`**를 호출하면 Promise가 **resolve**됩니다.
- **`reject(reason)`**을 호출하면 Promise가 **reject**됩니다.

컨트롤러 컴포넌트는 `close`와 `reject`를 추가로 props로 받습니다. TypeScript에서는 **`OverlayAsyncControllerComponent<T>`** 타입을 사용하여 resolve 값의 타입을 지정합니다.

```tsx
import type { OverlayAsyncControllerComponent } from 'ovan/web'

const ConfirmDialog: OverlayAsyncControllerComponent<boolean> = ({
  isOpen,
  close,
  reject,
}) => (
  <div className="modal" role="dialog" aria-hidden={!isOpen}>
    <p>정말 삭제하시겠습니까?</p>
    <button type="button" onClick={() => close(true)}>
      예
    </button>
    <button type="button" onClick={() => close(false)}>
      아니오
    </button>
    <button type="button" onClick={() => reject(new Error('취소됨'))}>
      취소
    </button>
  </div>
)

// 호출
async function handleDelete() {
  try {
    const confirmed = await overlay.openAsync(ConfirmDialog)
    if (confirmed) {
      // 삭제 실행
    }
  } catch (e) {
    // 사용자가 취소함
  }
}
```

### 언제 무엇을 쓸까?

| 상황 | 사용할 메서드 |
| --- | --- |
| 알림, 토스트, 단순 모달 (결과값 불필요) | `overlay.open()` |
| 확인 다이얼로그 (예/아니오) | `overlay.openAsync()` |
| 폼 입력값을 받아야 하는 모달 | `overlay.openAsync()` |
| 사용자가 선택지 중 하나를 골라야 하는 경우 | `overlay.openAsync()` |

> **팁:** 사용자가 선택 없이 닫을 수 있는 경우(예: 배경 클릭), `reject(...)`을 호출하여 호출자가 취소 상황을 처리할 수 있도록 하세요.

---

## close vs unmount

ovan은 오버레이를 "닫기"와 "제거"를 명확히 구분합니다. 이 구분이 애니메이션과 상태 관리의 핵심입니다.

### `close(overlayId?)`

- 오버레이의 **`isOpen`**을 `false`로 설정합니다.
- 오버레이는 **트리에 유지**됩니다. 종료 애니메이션을 실행할 수 있고, 내부 상태(예: 폼 입력값)가 보존됩니다.
- 같은 `overlayId`로 다시 열면 **같은 인스턴스**가 표시됩니다(상태 보존).
- 애니메이션이 끝나면 **`unmount()`**를 호출하여 메모리를 해제하세요.

### `unmount(overlayId?)`

- 오버레이를 목록과 **React 트리에서 완전히 제거**합니다.
- 종료 애니메이션 없이 즉시 사라집니다.
- 애니메이션이 필요 없을 때, 또는 **`close()` 후 애니메이션이 끝난 시점**에 호출합니다.

### 일반적인 패턴

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
          <p>모달 내용</p>
          <button onClick={close}>닫기</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

이 패턴에서 흐름은 다음과 같습니다.

1. 사용자가 "닫기" 클릭 → `close()` 호출 → `isOpen`이 `false`로 변경
2. `AnimatePresence`가 종료 애니메이션 실행
3. 애니메이션 완료 → `onExitComplete`에서 `unmount()` 호출
4. 오버레이가 트리에서 완전히 제거, 메모리 해제

### 요약

| 동작 | `close()` | `unmount()` |
| --- | --- | --- |
| `isOpen` 변경 | `false`로 설정 | 해당 없음 (노드 자체가 제거) |
| 트리에 유지 | ✅ 유지 | ❌ 제거 |
| 종료 애니메이션 | 가능 | 불가 (즉시 제거) |
| 상태 보존 | ✅ 보존 | ❌ 소멸 |
| 재사용 (같은 id) | ✅ 같은 인스턴스 | ❌ 새 인스턴스 생성 필요 |

---

## OverlaySlot and useOverlay

### 왜 Slot이 필요한가? — Context 보존 문제와 기존 대안들

React Native에는 웹의 `createPortal`에 대응하는 네이티브 API가 내장되어 있지 않습니다([react-native#36273](https://github.com/facebook/react-native/issues/36273)). 웹에서는 `ReactDOM.createPortal`이 DOM 위치만 옮기고 React 트리는 유지하므로 context가 자동 보존되지만, React Native에서는 오버레이를 다른 위치에 렌더링하면 context가 깨지는 문제가 있었습니다. 이에 대한 기존 대안들과 그 한계는 다음과 같습니다.

**대안 1: Provider를 루트에 배치 (Provider Hoisting)**

오버레이가 필요로 하는 모든 context provider를 앱 루트로 끌어올리는 가장 단순한 접근입니다. overlay-kit도 이 전략을 사용하며, 대부분의 앱에서 기본적으로 쓰는 방식입니다.

하지만 루트보다 아래에 있는 context(예: 특정 스크린의 로컬 context, 중첩된 네비게이션의 route params 등)는 오버레이에서 접근할 수 없습니다. 모든 context를 루트로 올리는 것은 현실적으로 불가능할 때가 많습니다.

**대안 2: Context 수동 재전파 (Manual Re-propagation)**

오버레이 내부에서 필요한 context provider를 수동으로 다시 감싸는 방식입니다. [Tamagui](https://tamagui.dev) v1이 이 전략을 사용했고, [react-native-paper](https://github.com/callstack/react-native-paper)의 Portal 사용자들도 이 workaround를 많이 썼습니다.

```tsx
// 오버레이 내부에서 필요한 context를 수동으로 다시 제공
<Portal>
  <ThemeProvider theme={currentTheme}>
    <NavigationContext.Provider value={navigation}>
      <MyOverlayContent />
    </NavigationContext.Provider>
  </ThemeProvider>
</Portal>
```

이 방식은 verbose하고 error-prone합니다. 새 context를 추가할 때마다 재전파 코드를 업데이트해야 하고, 빠뜨리면 런타임에 깨집니다. Tamagui는 자체 context(theme, config)는 자동 재전파했지만, 앱의 커스텀 context(navigation, app state 등)는 사용자가 직접 해야 했습니다. `needsPortalRepropagation()` 헬퍼를 제공할 정도로 이 문제를 인지하고 있었으며, Tamagui v2에서는 결국 `react-native-teleport` 기반의 네이티브 포탈로 전환했습니다.

> 관련 레퍼런스: [Tamagui Portal 문서 — Context re-propagation](https://tamagui.dev/ui/portal), [Tamagui v2 블로그 — 네이티브 포탈 전환](https://tamagui.dev/blog/version-two), [react-native-paper#3880](https://github.com/callstack/react-native-paper/issues/3880), [gorhom/react-native-portal#34](https://github.com/gorhom/react-native-portal/issues/34)

**ovan의 접근: Slot + 네이티브 텔레포트**

ovan은 **OverlaySlot**을 도입하여 이 문제를 근본적으로 해결합니다. Slot에서 열린 오버레이는 해당 Slot의 React 트리 내에서 렌더링되어 context를 자연스럽게 상속받고, 이후 호스트로 텔레포트되어 화면 최상단에 표시됩니다. Provider를 루트로 올릴 필요도, context를 수동으로 재전파할 필요도 없습니다.

### OverlaySlot이란?

**OverlaySlot**은 트리에서 오버레이의 "소유자"를 표시하는 컴포넌트입니다. Slot에서 열린 오버레이는 두 가지 장점을 가집니다.

1. **Context 상속** — 오버레이가 Slot의 React 트리 내에서 렌더링되므로, 해당 위치의 테마, 라우터, i18n 등 모든 context를 자연스럽게 상속합니다.
2. **물리적 텔레포트** — 렌더링 후 Provider의 호스트로 텔레포트되어, 부모의 `overflow: hidden`이나 `z-index`에 영향받지 않고 화면 최상단에 표시됩니다.

### Slot에서 오버레이를 여는 두 가지 방법

#### 방법 1: Render-prop

Slot의 children으로 함수를 전달하면, 해당 Slot에 바인딩된 `overlay` 객체를 받습니다. 별도 훅 없이 바로 사용할 수 있습니다.

```tsx
<OverlaySlot>
  {(overlay) => (
    <div>
      <h1>섹션 A</h1>
      <button onClick={() => overlay.open(MyModal, { overlayId: 'a-modal' })}>
        모달 열기
      </button>
    </div>
  )}
</OverlaySlot>
```

이 방식은 오버레이를 여는 트리거가 Slot의 직접 children일 때 가장 편리합니다.

#### 방법 2: useOverlay() 훅

`useOverlay()`는 **가장 가까운 조상 OverlaySlot**에 바인딩된 overlay 객체를 반환합니다. Slot의 하위 트리 깊숙한 곳에서 오버레이를 열어야 할 때 유용합니다.

```tsx
function DeepChild() {
  const overlay = useOverlay()

  return (
    <button onClick={() => overlay.open(MyModal, { overlayId: 'deep-modal' })}>
      모달 열기
    </button>
  )
}

// Slot 내부에서 사용
<OverlaySlot>
  <SomeWrapper>
    <DeepChild /> {/* useOverlay()가 가장 가까운 OverlaySlot에 바인딩 */}
  </SomeWrapper>
</OverlaySlot>
```

> **주의:** `useOverlay()`는 반드시 OverlaySlot의 **하위 컴포넌트** 내에서 호출해야 합니다. Slot 바깥에서 호출하면 에러가 발생합니다.

### 글로벌 overlay vs Slot overlay

| | 글로벌 `overlay` | Slot의 `overlay` / `useOverlay()` |
| --- | --- | --- |
| Context 상속 | ❌ Provider 위치의 context만 | ✅ Slot 위치의 모든 context |
| 렌더링 위치 | Provider에서 직접 | Slot 트리에서 렌더링 → 호스트로 텔레포트 |
| 사용 시점 | context가 필요 없는 간단한 오버레이 | 테마, 라우터 등 context가 필요한 오버레이 |

### 다중 Slot

탭이나 섹션마다 별도의 Slot을 배치할 수 있습니다. 각 Slot에서 열린 오버레이는 해당 Slot의 context를 상속합니다.

```tsx
<OverlayProvider>
  {/* 탭 A의 Slot */}
  <OverlaySlot>
    {(overlay) => <TabA overlay={overlay} />}
  </OverlaySlot>

  {/* 탭 B의 Slot */}
  <OverlaySlot>
    {(overlay) => <TabB overlay={overlay} />}
  </OverlaySlot>
</OverlayProvider>
```

모든 오버레이 노드는 단일 호스트로 텔레포트되므로, 스태킹(z-index, 순서)은 앱에서 관리합니다. 오버레이 컨텐츠의 루트 노드에 z-index를 설정하세요.

---

## Multiple overlay trees

앱에서 **독립된 오버레이 트리**가 필요한 경우(예: 섹션별 또는 기능별 분리), **`createOverlayProvider(adapter)`**를 다시 호출하면 됩니다. 새로운 `{ overlay, OverlayProvider, OverlaySlot, useOverlay, ... }`가 반환됩니다.

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

각 Provider는 자체 호스트를 가지며, 서로 독립적으로 오버레이를 관리합니다. 일반적인 앱 전체 오버레이 스택에는 하나의 `createOverlayProvider`로 충분하고, 이 기능은 특수한 경우에만 필요합니다.

---

## Credits

ovan의 설계와 구현 상당 부분은 [Toss](https://toss.im)의 [**overlay-kit**](https://github.com/toss/overlay-kit)에서 파생되었습니다. overlay-kit이 확립한 선언적 오버레이 패턴 — 명령형 호출, close/unmount 분리, Promise 기반 결과 반환 — 은 ovan의 핵심 철학이기도 합니다. 이 위에 React Native 지원, Slot 기반 context 보존, 플랫폼 어댑터(웹은 createPortal, RN은 react-native-teleport)를 확장했습니다. overlay-kit 저자들과 기여자들에게 감사드립니다.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

See [LICENSE](./LICENSE).