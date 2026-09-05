# FSD and File Structure

## Layers

Every UI client follows Feature-Sliced Design:

```text
app/       # startup, providers, routing, lifecycle, global composition
pages/     # screens and route-level composition
widgets/   # large self-contained parts of a page
features/  # complete user actions
entities/  # UI representation of domain entities
shared/    # domain-neutral UI, libraries, config, API primitives, and assets
```

Imports point down: `app → pages → widgets → features → entities → shared`. A slice must not import another slice on the same layer. Move shared composition up a layer and reusable technical code down to `shared`.

Domain, application services, timeline, synchronization, and media contracts live in framework-independent packages. They are not FSD layers. UI slices import their public APIs; domain packages never import applications.

## Slices and segments

- One slice owns one domain area or user action: `frame`, `audio-clip`, `capture-frame`, `reverse-block`.
- Name features with actions and entities with nouns.
- Supported segments are `ui`, `model`, `api`, `lib`, `config`, and `assets`.
- Create a segment only when it owns real code; identical empty structures add no value.
- Do not create a `components` segment inside a slice; components belong in `ui`.
- Do not create a universal `hooks` segment; place each hook by responsibility.

```text
features/capture-frame/
  api/                    # remote-command adapter owned by the feature
  model/                  # orchestration and UI state for the action
  ui/CaptureButton/
  index.ts

entities/frame/
  model/                  # UI-facing selectors and entity types
  ui/FrameThumbnail/
  index.ts

shared/lib/timing/
  useThrottledValue.ts    # domain-neutral hook
```

Server or peer interaction belongs in `api`, domain-facing state in `model`, component-local behavior beside the component in `ui`, and generic technical logic in `shared/lib`.

## Public API

- `index.ts` contains imports and re-exports only; no calculations or side effects.
- External code imports a slice through its `index.ts`.
- Deep imports into another slice are forbidden.
- Direct relative imports are allowed inside one slice.
- Export the minimum necessary surface; keep internal helpers and transport DTOs private until a consumer needs them.
- CI enforces layer direction and slice boundaries with ESLint boundary rules.

## File and folder names

- React component files and folders use `PascalCase`: `FrameThumbnail/FrameThumbnail.tsx`.
- A file with one primary export matches that export: `calculateFrameStart.ts`, `useCaptureState.ts`.
- Feature and grouping folders use `kebab-case`: `capture-frame`, `audio-clips`.
- Assets use `kebab-case`: `empty-project.svg`.
- A feature overview is `README.md`; additional local guides use `kebab-case.md`.
- Use names such as `utils.ts`, `helpers.ts`, or `common.ts` only for a small cohesive group. A reusable operation gets its own named file.

## Application example

```text
apps/mobile/src/
  app/
    providers/
    navigation/
  pages/
    capture/
    edit-project/
  widgets/
    camera-workspace/
    timeline/
    camera-inspector/
  features/
    capture-frame/
    select-lens/
    configure-framing/
    reverse-block/
    sync-project/
  entities/
    project/
    block/
    frame/
    audio-clip/
    camera/
  shared/
    ui/
    lib/
    api/
    config/
    assets/
```

Electron `main`, `preload`, and workers are separate runtime contexts outside renderer FSD. Swift, Kotlin, and C++ modules live in platform modules and implement ports. Browser server handlers never enter the `remote-web` renderer.

## Feature documentation

Add a feature README when a scenario has non-obvious rules or several interacting parts. A simple button does not require documentation.

Use two sections:

1. `Business requirements` describes observable behavior and scope without implementation detail.
2. `Technical notes` maps the parts and records non-obvious decisions, ordering, and reasons.

Do not restate code or preserve removed approaches. A rename or behavior-preserving refactor should not require changing the README.
