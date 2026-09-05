# Components and UI Logic

## Presentational components

- Receive data and callbacks through props and render UI.
- Do not know about navigation, repositories, camera access, networking, or global stores.
- May own local visual state such as pressed, focused, expanded, or an uncommitted drag position.
- Put reusable domain-neutral components in `shared/ui`.
- Keep feature- or entity-specific components in that slice’s `ui` segment.
- Never put business rules or data fetching in `shared/ui`.

## Container components

- Connect application commands, selectors, navigation, permissions, and lifecycle to presentational UI.
- Live on the page, widget, or feature layer that owns the scenario.
- Do not combine JSX, SQL, transport, and camera calls; platform operations go through ports.
- A widget composes several features and entities into a self-contained area such as the camera workspace or timeline.

## Logic and hooks

- Give each hook one reason to change: permission, capture command, drag state, or playback subscription.
- A screen composes focused hooks; do not create a universal `useScreenController`.
- Name hooks by task: `useCameraPermission`, `useFrameSelection`, `useCaptureCommand`.
- Keep pure calculations as functions in `lib`, not hooks.
- Keep component-specific interaction hooks beside the component in `ui`.
- Put peer/server hooks in `api` and domain-facing state hooks in `model`.

## Props and events

- Destructure props in the component signature.
- A presentational component reports intent with domain callbacks such as `onCapture` and `onMoveFrame`; it does not receive a repository or store.
- Do not leak a platform event when a domain ID and value are sufficient.
- Passing props within one widget is acceptable while the flow stays clear. Add context or a store for multiple independent consumers, not in advance.

## Performance

- Add `React.memo`, `useMemo`, and `useCallback` for a measured hot path or stable contract, not by default.
- Inline objects and callbacks defeat shallow memoization; stabilize props before memoizing.
- Virtualize frame strips and waveforms and subscribe through narrow selectors.
- Preview updates must not rerender the whole capture screen or timeline.
- Never put a full-resolution image or base64 payload in React state; expose a handle or proxy.

## Assets

- Store simple vector artwork as `.svg` assets and import it through one platform adapter.
- Use inline SVG only for truly dynamic graphics that cannot be represented as an asset.
- Keep shared icons in `shared/ui` or `shared/assets` instead of duplicating them across features.
