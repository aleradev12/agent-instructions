# FSD and File Structure

This rule owns layer directions and slice layout. Module Boundaries owns reuse and the discovery index; Module Documentation owns README structure. Do not repeat those specifications here.

## UI layers

UI clients follow Feature-Sliced Design:

```text
app/       # startup, providers, routing, global composition
pages/     # screens and route composition
widgets/   # self-contained page sections
features/  # user actions
entities/  # UI-facing domain representations
shared/    # domain-neutral UI, libraries, config, API primitives, assets
```

Imports point down: `app → pages → widgets → features → entities → shared`. A slice must not import another slice on the same layer. Move composition up; apply Module Boundaries before moving behavior down. Framework-independent domain packages do not import UI applications.

## Backend adaptation

Use FSD-like responsibility slices on the server, not artificial pages/widgets. A default direction is:

```text
app/        # composition root, dependency injection, startup
adapters/   # HTTP/GraphQL, jobs, persistence, external providers
workflows/  # orchestration spanning several use cases
features/   # application use cases and the ports they need
entities/   # domain state, invariants, policies and domain ports
shared/     # domain-neutral technical primitives
```

Dependencies point down this list; unused layers need not exist. Incoming adapters call workflow/feature public APIs. Outgoing adapters implement ports declared by their consuming feature/domain; features never import concrete repositories, NestJS controllers or provider SDKs. The composition root wires implementations to ports.

Features do not call sibling feature internals; multi-use-case orchestration belongs in workflows. Same-layer entity slices likewise stay independent: pass IDs or explicit projections at a higher boundary, or put a genuinely cohesive aggregate under one owner. Do not evade the rule with a global business `shared/types` bucket or service locator.

A small service may start with app, features, entities and one adapter. Split only along real responsibilities, not to fill an empty directory template. Keep one-way dependency rules even when runtime calls return data upwards. This is a backend adaptation, not a claim that server layers are official frontend FSD terminology.

## Slices, segments and public API

- Name feature slices with actions and entity slices with nouns. One slice owns one responsibility.
- UI segments may be `ui`, `model`, `api`, `lib`, `config`, `assets`; server slices use only applicable segments, such as `model`, `ports`, `lib`, `config`. Do not add UI segments to backend code or a universal `hooks` folder.
- External consumers import a slice through its public entry point, never private deep paths. Inside one slice, direct relative imports are fine.
- Export the minimum contract consumers need; keep side effects out of barrel exports. Code Style owns entry-point formatting.
- Enforce layer direction, sibling isolation and public-entry imports with the project's boundary linter. Include forbidden-import examples so aliases, relative paths and type-only imports cannot bypass it. No custom duplicate checker when existing tooling can enforce the rule.

## Names and runtime boundaries

- React component files/folders use PascalCase; feature/grouping folders and assets use kebab-case.
- A file with one main export matches that export. Prefer cohesive names over a growing `utils`, `helpers` or `common` bucket.
- Domain modules do not import applications; applications share explicit contracts rather than each other's internals. Browser bundles must not receive server persistence, secrets or provider credentials through a shared package.
- Electron main/preload, native modules, background workers and server processes are distinct runtime contexts, not renderer FSD slices. Model their boundaries explicitly where the project uses them.
