# Module Boundaries

Organize around responsibilities a maintainer can name, not around the files an agent happened to create. This rule owns cross-module structure and reuse; UI-specific placement follows Components and UI Logic.

## Ownership and dependencies

- Before implementation, identify the module that owns the behavior, the existing public contract and the permitted dependency direction. Extend that owner instead of adding a parallel implementation.
- Modules expose a small public API. Consumers must not reach into another module's internal storage, UI state or private helpers. Keep imports acyclic; match the project's established layout instead of imposing a new architecture for one change.
- Keep business decisions separate from transport, UI and provider adapters. External input is translated at the boundary; domain code should not need a browser, messenger or live AI provider to run.
- Within a module, keep code, focused tests and its documentation together. Module Documentation owns the documentation format.

## Reuse without a shared dumping ground

- Search for an existing implementation before writing a similar validator, mapper, component, error translator or adapter.
- When the same behavior is genuinely needed in several places, give it one owner at the narrowest common level: module-local first, then a shared domain module or domain-neutral shared layer.
- Shared infrastructure must not depend on a consuming feature. Domain-specific rules remain with their domain even when several clients use them.
- Similar-looking code is not always the same responsibility. Do not force unrelated behavior into a generic helper with dozens of flags, or extract speculative abstractions for imaginary future consumers.
- Review the change across module boundaries, not just file by file: duplicated policy, leaked responsibilities and dependency cycles matter even when each file looks clean. Use existing import-boundary lint rules when available; do not introduce a second competing dependency checker.
