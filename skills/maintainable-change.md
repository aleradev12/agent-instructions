---
name: maintainable-change
description: "Use when implementing or refactoring a feature across modules, preparing a bounded AI coding assignment, or checking whether a change remains understandable and maintainable."
---

# Maintainable Change

Use the shared rules in the project's generated AGENTS.md: Module Boundaries, Code Style, Module Documentation, Incremental Delivery and Testing. For authorized delegation also read Economical Subagent Use. If an applicable section is unavailable, consult its source in the installed `@aleradev12/agent-instructions` package (`rules/`); do not recreate a second rulebook here. Explicit project exceptions take precedence over package defaults within the active instruction hierarchy.

## Before editing

1. Read the nearest module README and follow its navigation only as far as needed. Locate the behavior's current owner and check for an existing reusable implementation.
2. State a short change boundary: observable result, owning module, consumers/contracts affected, exclusions and verification. Ask about unresolved product choices before turning them into code.
3. For a large request, choose a small end-to-end slice and name the handoff to the next slice. Apply Economical Subagent Use only if delegation is authorized; this skill is not permission to spawn agents.

## Implement and inspect

4. Make the slice, then inspect the aggregate diff, not only individual files. Trace changed dependencies and consumers against Module Boundaries. Look for duplicated decisions, leaked state and accidental coupling.
5. Use the package's `agent-code-size` command on changed source paths as the Code Style signal. Follow its documented CLI usage; do not treat a clean report as architectural approval or inflate the task into a legacy cleanup.
6. Apply Testing and update only the authoritative documentation affected under Module Documentation. Verify navigational links where they changed.
7. Report the result using Incremental Delivery's completion contract. If a tradeoff remains, present the smallest decision or follow-up, not a new unsolicited reviewer/oracle chain.
