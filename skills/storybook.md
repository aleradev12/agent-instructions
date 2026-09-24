---
name: storybook
description: "Use when creating or maintaining Storybook stories, controls, layout, or configuration in React and React Native projects."
---

# Storybook stories

Use Storybook to develop and document UI components in isolation. Apply the shared story-authoring guidance below to both React web and React Native; use the framework-specific package, renderer, and project configuration already in place. Do not assume paths, addons, decorators, or scripts from one project apply to another.

## React web and React Native

- Storybook config locations differ by target: React web commonly uses `.storybook/main.ts` and `.storybook/preview.tsx` (or `.js`/`.mjs`); React Native on-device setups commonly use `.rnstorybook/main.ts` and `.rnstorybook/preview.tsx`. Follow the actual scripts and configuration in the project rather than assuming either directory.
- Keep `ComponentName.stories.tsx` beside its component where the project’s story discovery configuration supports colocated stories; otherwise follow the configured stories glob.
- Mirror the project’s component organization in Storybook titles so the sidebar is easy to navigate.
- Type metadata and stories using the installed Storybook framework’s `Meta` and `StoryObj` types. In React Native this commonly comes from `@storybook/react-native`; in web projects use the configured framework package (for example, `@storybook/react-vite`).
- Use framework-appropriate primitives and styles: DOM elements for web, React Native components for native. Reuse the app’s real theme/providers through project decorators or global preview configuration.
- Keep large mock data and story-only helpers in a nearby `_stories/` directory when useful.
- Put story-local styles after helper components and story exports.

## React Native on-device configuration (project-specific example)

The following configuration and customization notes describe the source project this guidance was adapted from. Treat them as examples, and verify paths and behavior in the current project before applying them. Web projects typically place these files under `.storybook/` instead; their `main` config selects a framework/builder and story globs, while `preview` configures global decorators, parameters, and styles.

On-device Storybook (`@storybook/react-native` v10) for components anywhere under `src/`.

- Config: `src/.rnstorybook/` (`main.ts`, `preview.tsx`, `index.tsx`, generated `storybook.requires.ts` — never edit). In other RN projects the config may instead be at `.rnstorybook/` or another path passed to the start script.
- Stories glob: `src/**/*.stories.tsx`; web projects commonly use globs such as `../src/**/*.stories.@(js|jsx|ts|tsx)` in `.storybook/main.ts`.

### Patched UI library

The on-device UI comes from `@storybook/react-native-ui`, which is **heavily patched** via `patch-package` (`patches/@storybook+react-native-ui+10.4.7.patch`). The RN entry of the package is `src/`, so the patch edits source directly. When changing Storybook UI behavior, edit the patched `src/` files under `node_modules/@storybook/react-native-ui/src/`, then run `npx patch-package @storybook/react-native-ui` to regenerate the patch (verify with `--reverse` → re-apply → diff is identical).

Features the patch adds/changes (no code here — see the patch):

- Replaced `@gorhom/bottom-sheet` with `@lodev09/react-native-true-sheet` for both the addons panel and the menu drawer, with platform-aware grabber clearance.
- Merged the menu drawer into the addons panel: the sidebar now lives as a tab inside the same `TrueSheet` (`MobileAddonsPanel`).
- Removed the wide bottom bar; a floating button (burger `MenuIcon`, bottom-right) opens the addons sheet. "Fullscreen" (no bottom bar) is permanent.
- Compact emoji labels for addon tabs (📦 Components, 🎛️ Controls, ⚡ Actions, 🎨 Backgrounds) via an id→emoji map in `MobileAddonsPanel`; custom addons ship their own short titles.
- Search input no longer depends on the bottom-sheet text input (works in the TrueSheet).

## How many stories

Standard is two; adjust to the component:

- **Playground** — one instance built from `args` + `argTypes` (Controls). No `render`. Flip every prop live.
- **Showcase** — a `render` showing all variants/states at once. Hardcoded instances, no Controls.
- Trivial component (nothing to compare) → `Playground` only.
- Several distinct use cases → split into more stories, one per scenario.

```tsx
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from 'storybook/actions';
import { View } from 'react-native';
import { Unistyles } from '@/shared/lib/unistyles';
import { MainButton } from './MainButton';
import { MAIN_BUTTON_VARIANT } from './constants';

type TStoryProps = typeof MainButton;

const meta: Meta<TStoryProps> = { title: 'shared/ui/MainButton', component: MainButton };
export default meta;

export const Playground: StoryObj<TStoryProps> = {
    argTypes: {
        onPress: { action: 'pressed MainButton' },
        variant: { control: 'radio', options: Object.values(MAIN_BUTTON_VARIANT) },
        title: { control: 'text' }
    },
    args: { title: 'Press me', variant: MAIN_BUTTON_VARIANT.orange, disabled: false, isLoading: false }
};

export const Showcase: StoryObj<TStoryProps> = {
    render: () => (
        <View style={styles.container}>
            <MainButton title='Orange' variant={MAIN_BUTTON_VARIANT.orange} onPress={action('pressed Orange')} />
            <MainButton title='Disabled' disabled onPress={action('pressed Disabled')} />
        </View>
    )
};

const styles = Unistyles.create({ container: { gap: 12 } });
```

## Actions, never console.log

Callback props log to the Actions panel, not the console → stories stay side-effect free. Two forms:

- **Playground** → declare on `argTypes`, Storybook injects the handler: `argTypes: { onPress: { action: 'pressed' } }`.
- **Showcase** → call `action` per instance for distinct names: `onPress={action('pressed Orange')}`.
- `action` comes from `storybook/actions` (v10), not `@storybook/addon-actions`.

## Controls (`argTypes`)

- `'radio' | 'select'` + `options` for unions/enums; `'text'` for strings; `'boolean'` for flags.
- `mapping` maps friendly labels → real values; map a `'none'` option to `undefined` for optional props.
  ```tsx
  icon: { control: 'radio', options: ['none', 'arrow'], mapping: { none: undefined, arrow: <ArrowIcon /> } }
  ```
- Reuse repeated `argTypes` via a shared `COMMON_ARG_TYPES` const.

## Layout

- Every story is already wrapped in a global scroll container with padding — don't add your own outer `ScrollView`.
- Component scrolls on its own → disable the wrapper to avoid nested scroll: `parameters: { isWrappedInScrollView: false }`.
- Custom Storybook parameters → use `defineStorybookParameters` from `@/.rnstorybook/parameters` so `layoutInsets` stays typed.
  ```tsx
  const STORY_PARAMETERS = defineStorybookParameters({
      isWrappedInScrollView: false,
      layoutInsets: 'fullscreen'
  });
  ```
- Background and app theme are global — a story renders with the real theme, no provider needed.
- Showcase captions → use `StoryLabel` (from `@/.rnstorybook/ui/StoryLabel`); it recolors to stay readable when the background changes, instead of a hardcoded `Text` color.

## Notes addon is disabled

`@storybook/addon-ondevice-notes` is removed from `deviceAddons` in `src/.rnstorybook/main.ts` — no story uses it. Do not add `parameters: { notes: ... }`; it has no effect.

## Open stories and set controls via deep link (`storybook://`)

A dev-only deep link opens a story and applies controls without touching the on-device UI:

```
storybook://open/<storyTitle>/<storyName>?args=key:value,key2:value2
```

- `<storyTitle>` — the exact `title` from the story file (folder path included, e.g. `widgets/quiz-session/ui/Card`).
- `<storyName>` — the exported story name (`Playground`, `Showcase`).
- `args` — optional `key:value` pairs comma-separated; types auto-coerce (`true`/`false` → boolean, `42` → number, else string). The title+name are run through the official `toId`, so the id always matches.

Implementation: `src/.rnstorybook/deepLinking/` (parser + listener). The listener is mounted at the app root behind `IS_STORYBOOK_AVAILABLE`, so it tree-shakes out of production bundles. The `storybook://` scheme itself is registered **only in dev builds** — a debug source-set manifest (`android/app/src/debug/AndroidManifest.xml`) on Android, and a `$(STORYBOOK_URL_SCHEME)` Info.plist entry backed by a Debug-only build setting on iOS.

### Commands

There are yarn scripts for each target (find them in the package script list): pass the URL via the `URL=` env var.

Android (intent delivered to the running app):
```bash
URL="storybook://open/widgets/quiz-session/ui/Card/Playground" yarn storybook:open:android
```

With one connected device the script targets it automatically; with several it prompts to pick one. To target a device non-interactively, pass `SERIAL=<id>` (or adb's native `ANDROID_SERIAL=<id>`). List connected ids with `yarn android:list-devices`.

Run `yarn storybook:open:android` with no `URL=` to pick a story interactively: a searchable autocomplete lists every story in the repo (`title / storyName`) and builds the deep link for you.

iOS Simulator (delivered to the running app):
```bash
URL="storybook://open/widgets/quiz-session/ui/Card/Playground?args=isLoading:true" yarn storybook:open:ios-simulator
```

Real iPhone — relaunches the app with the URL as a launch payload (processed via `Linking.getInitialURL()`), so the app restarts:
```bash
URL="storybook://open/widgets/quiz-result/QuizResult/Playground?args=outcome:fail,correctCount:22" yarn storybook:open:ios-device
```

The device UDID is auto-detected by a script in the package (look for the iOS UDID helper in the script list). To print it manually, run that helper; to target a specific device, pass `UDID=<coredevice-identifier>`.

iOS bundle id: `com.es.prontotest`. For already-running iOS apps without relaunch, tap a `storybook://` link from Safari/Notes on the device instead.
