# Module Documentation

Every meaningful module owns a short README: a navigation map, not an inventory of its implementation. This rule owns documentation structure and instruction-source discipline.

## Language

Write documentation in English unless the user explicitly requests another language or an explicit project rule defines an exception. This covers technical READMEs, architecture notes, ADRs, instructions and skills; the conversation's language alone does not change the documentation default. Follow a project's declared content/localization policy for user-facing material. Preserve historical submissions and do not bulk-translate unrelated files as a side effect of a small change.

## Navigate from general to specific

- The root README explains the product, entry points, setup commands and top-level modules. It does not document every subsystem.
- Each module README explains its responsibility, observable guarantees, boundary and collaborators, then points to the next level of modules when needed. A reader should know where to go next without reading the whole codebase.
- Use `Business requirements` for purpose, behavior and exclusions; use `Technical notes` for boundaries, navigation and non-obvious constraints. Keep each section proportionate to the module.
- Name stable child modules and link to their README when useful. Do not list every file or function; exact symbols and filenames belong only in low-level documentation when necessary to use or debug that part.
- A rename or internal refactor alone should not require rewriting parent documentation. Update it when behavior, ownership, contracts or navigation actually change.
- Tiny helper directories do not need ceremonial READMEs. Document the cohesive module that owns them; do not create a new hierarchy solely for documentation.

## Keep detail local

Prefer one short README. When mechanics or decisions need more space, place them in that module's `docs/` and link from its README. Use global docs only for genuinely cross-module decisions. Record a non-obvious decision once: context, choice, alternatives and consequences, without a chronology of every experiment.

Do not repeat business guarantees in technical prose or narrate obvious code. Keep durable explanations, not transient file listings or implementation transcripts.

## One authoritative source

- Before adding a rule, search the existing instructions and module documentation. Extend the owning section instead of adding the same requirement elsewhere.
- Each requirement, contract and decision has one authoritative source. Other documents link to it; summaries identify the source rather than restating a competing specification.
- Shared rules belong in the reusable instruction package. Project sources contain project-specific facts and explicit exceptions, not copies of shared policy. Skills describe a procedure and reference rules; they do not repeat the rulebook.
- Generated `AGENTS.md` and skill copies are derived artifacts, not extra sources: edit the originals and regenerate. Never hand-edit generated files or copy them back into their own sources.
- When requirements change, remove or mark superseded guidance at its source and repair references. Do not append a new instruction while leaving a contradictory old one active. Preserve historical submitted documents as historical, not current specifications.
