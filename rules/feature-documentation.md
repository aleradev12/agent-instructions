# Feature Documentation

A feature README is a compact map of a complex scenario. A reader with no prior context should understand the behavior and key decisions faster than by reading the implementation.

## Structure

Use exactly two primary sections:

1. `Business requirements`: one-line goal, observable behavior, constraints, and out-of-scope behavior. Do not mention code, files, or hook names.
2. `Technical notes`: a map of the parts plus non-obvious decisions, reasons, ordering constraints, and platform pitfalls.

Subheadings name a system part with a short noun phrase. A heading is not a long claim or question.

## Style

- Keep one idea per bullet; add a reason only when the decision is not obvious.
- Use concrete nouns instead of context-free words such as “it,” “data,” or “component.”
- Do not repeat the part map inside each part description.
- Do not restate a user promise in technical language in the second section.
- Do not copy implementation details that are obvious from one source file.
- Describe the current system, not removed approaches or review history.
- Write a stable contract: a rename or behavior-preserving refactor should not require an update.
- Link to durable concepts. A changing file inventory belongs only in a file-structure document.

## When to write or update one

- Add a README for interacting modules, non-obvious failure behavior, complex lifecycle, or an important business rule.
- Do not add a README to a simple local UI detail solely for uniformity.
- An observable behavior change updates business requirements, technical notes, and acceptance tests.
- An implementation change updates the README only when it changes a non-obvious constraint or decision.

## Final check

Remove a bullet when it duplicates another point, depends on project history, restates a function name, or would become false after a safe rename. The remainder must answer two questions: what the feature guarantees and which decisions are not quickly apparent from the code.
