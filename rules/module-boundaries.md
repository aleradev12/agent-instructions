# Module Boundaries

Organize around responsibilities a maintainer can name, not around the files an agent happened to create. This rule owns cross-module structure and reuse; UI-specific placement follows Components and UI Logic.

## Ownership and dependencies

- Before implementation, identify the module that owns the behavior, the existing public contract and the permitted dependency direction. Extend that owner instead of adding a parallel implementation.
- Modules expose a small public API. Consumers must not reach into another module's internal storage, UI state or private helpers. Keep imports acyclic; match the project's established layout instead of imposing a new architecture for one change.
- Keep business decisions separate from transport, UI and provider adapters. External input is translated at the boundary; domain code should not need a browser, messenger or live AI provider to run.
- Within a module, keep code, focused tests and its documentation together. Module Documentation owns the documentation format.

## Reuse without a shared dumping ground

- Search for an existing implementation before writing a similar validator, mapper, component, error translator or adapter. Use the reuse discovery index below, then confirm against source; the index is a lead, not proof of compatibility.
- When the same behavior is genuinely needed in several places, give it one owner at the narrowest common level: module-local first, then a shared domain module or domain-neutral shared layer.
- Shared infrastructure must not depend on a consuming feature. Domain-specific rules remain with their domain even when several clients use them.
- Similar-looking code is not always the same responsibility. Do not force unrelated behavior into a generic helper with dozens of flags, or extract speculative abstractions for imaginary future consumers.
- Review the change across module boundaries, not just file by file: duplicated policy, leaked responsibilities and dependency cycles matter even when each file looks clean. Use existing import-boundary lint rules when available; do not introduce a second competing dependency checker.

## Discover local reuse candidates

A shared-layer README can serve as a small discovery index even when candidate code remains in its owning slice. If the list grows, link a single `shared/docs/reuse-candidates.md` from that README; do not maintain two copies. Separate **available shared APIs** from **local candidates — extraction required**.

Record only plausible reusable behavior, not every helper: capability/search terms, owning module (link to its README), semantic constraints and status. Exact private function/file names are optional low-level hints, not a second API specification. Example row:

| Capability | Owner | Constraints | Status |
| --- | --- | --- | --- |
| Date/time display | Scheduling module README | Explicit timezone and locale; display only, not deadline calculation | Local candidate; no cross-slice import |

Before building a second consumer, inspect this index and search source by the capability/owner. Compare actual semantics: formatting an instant, formatting a duration and computing a deadline are different responsibilities. An absent/stale index entry does not replace source search.

If reuse is real, extract the smallest domain-neutral behavior into the permitted shared layer, move its tests, update both consumers in one bounded change, and update/remove the candidate row. Domain-specific reuse belongs in the appropriate domain owner, not technical shared. Never deep-import a sibling slice just because its helper appears in this index. If only one module needs it, leave the implementation local and optionally register the candidate. Do not create an empty shared-code hierarchy just to hold the index.
