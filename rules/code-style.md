# Code Style

## Readability

- Names carry domain meaning without surrounding context: `selectedFrame`, `captureReceipt`, `isCameraReady`.
- Split complex expressions into named intermediate values.
- Extract repeated or independent operations into functions with domain names.
- Name callback parameters after the entity: `frames.map(frame => ...)`, not `item` or `x`.
- Prefix booleans with `is`, `has`, `should`, or `can`.
- Prefix debug- and mock-only identifiers with `debug`.

## Comments

Prefer self-documenting names, types and small operations over explanatory comments. Write a comment only for a non-obvious reason, platform constraint, or required order. Keep it short, understandable without task history, and stable after normal refactoring.

- Explain why; do not narrate the code.
- Write code comments in English.
- Do not put file paths in comments; name the function, type, or mechanism.
- Do not use decorative separators or ASCII headings. Split an oversized file into modules.
- Keep rejected alternatives in an ADR or commit message, not beside code that does not contain them.

## Types and constants

- Use `type` for React props.
- Prefer `as const` plus a union for new finite runtime value sets. Use TypeScript `enum` only for a concrete compatibility need.
- Separate transport DTOs from domain types and map them at the adapter boundary.
- Name magic values with their unit: `PREVIEW_STALE_TIMEOUT_MS`, `MAX_CAPTURE_RETRIES`.
- Include units in property names or types: `durationMs`, `sampleRateHz`, `byteLength`.
- Use branded types or opaque wrappers to distinguish entity IDs in domain code.

## File size

- Aim for source files of at most 350 lines. Above that, inspect responsibilities; at 500 or more, split by cohesive behavior where practical or explain the exception in the change report.
- Do not satisfy a line budget by compressing code, moving unrelated helpers into a dumping ground, or creating one-line indirection. A reader should understand the extracted boundary.
- Generated sources and declarative fixtures may be exceptions; identify them explicitly. Do not enlarge a legacy oversized file casually or refactor unrelated files just to make a size check green.
- The size checker reports a maintainability signal, not proof of architecture quality. Policy and exceptions remain human-readable; strict CI adoption is an explicit project decision.

## File order

```text
imports
module constants
primary exported types
primary export
local helpers
```

- Keep the primary export visible before a long helper section.
- Move a large constant set into the slice’s `config` or `constants` module.
- Give a reusable helper its own named file and test.
- Keep `index.ts` limited to imports and re-exports.
- Omit file extensions from TypeScript imports.

## Errors and asynchronous work

- Empty `catch` blocks are forbidden for application, camera, storage, sync, and media operations.
- Fire-and-forget work requires explicit failure handling or reporting.
- Support cancellation when an asynchronous result is no longer useful after leaving a page.
- Convert adapter exceptions into stable application errors; UI must not depend on library exception text.
- Preserve the idempotency key when retrying an operation that is unsafe to repeat as a new request.
