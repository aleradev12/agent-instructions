# Agent Instructions

Reusable default engineering rules and a dependency-free generator for `AGENTS.md`, Codex project skills, and Claude project skills.

## Install from GitLab

```sh
npm install --save-dev 'git+ssh://git@git.lan/master-group/reusable/agent-instructions.git#v0.6.2'
```

Add one project command:

```json
{
  "scripts": {
    "docs:generate": "agent-instructions"
  }
}
```

Running `npm run docs:generate` writes every configured artifact and verifies the result before exiting.

## Configure

Create `agent-instructions.config.json` in the project root:

```json
{
  "$schema": "./node_modules/@aleradev12/agent-instructions/config.schema.json",
  "title": "My Project Agent Instructions",
  "defaults": {
    "enabled": true,
    "disabled": []
  },
  "agents": {
    "sourceDirectory": "docs/agents",
    "output": "AGENTS.md"
  },
  "skills": {
    "enabled": true,
    "disabled": [],
    "sourceDirectory": "docs/skills",
    "outputs": [".agents/skills", ".claude/skills"]
  }
}
```

All fields are optional. Without a config file, the values above apply except that the title is `Project Agent Instructions`.

Set `defaults.enabled` to `false` to omit every shared rule. Use `defaults.disabled` to omit individual rules while keeping the rest. Available rule IDs are:

- `code-style`
- `components`
- `feature-documentation`
- `fsd`
- `git`
- `incremental-delivery`
- `module-boundaries`
- `state-and-data`
- `styling`
- `subagents`
- `task-tracking`
- `testing`

Every visible `.md` directly inside `agents.sourceDirectory` extends the selected defaults. The directory may be absent or empty when defaults are enabled. Nested directories and non-Markdown files are rejected.

## Project skills

The package includes shared skills generated to every configured skill output by default:

- `board-task-workflow` for GitLab issue triage, child Task decomposition and coordination.
- `maintainable-change` for bounded implementation and aggregate-diff inspection using the shared rules.
- `storybook` for authoring and maintaining React web and React Native Storybook stories, controls, layout, and the project's Storybook-specific tooling.

Add a shared skill name to `skills.disabled` to omit it; unknown names are rejected.

Each Markdown file in `skills.sourceDirectory` is a project-specific source for one Codex and Claude skill. Its filename must match the `name` field and must not collide with an enabled shared skill:

```md
---
name: project-architecture
description: "Use for architectural changes in this project. Do not use for isolated copy edits."
---

# Project Architecture

Follow the project-specific workflow here.
```

The generator writes identical `SKILL.md` files to each configured output directory. It removes obsolete generated skills, but refuses to overwrite manually authored skills or remove a generated skill directory that contains extra files.

Set `skills.enabled` to `false` when the project needs only `AGENTS.md` generation. Project-local skills are still supported alongside the package's shared skill.

## Policy ownership

Edit the authoritative source, then regenerate consumers; generated copies are not independent instructions.

| Topic | Source |
| --- | --- |
| Readability, comments, file-size policy | [Code Style](rules/code-style.md) |
| Responsibility, imports and reuse discovery | [Module Boundaries](rules/module-boundaries.md) |
| UI FSD and backend layer adaptation | [FSD](rules/fsd.md) |
| Existing UI preservation and component responsibilities | [Components](rules/components.md) |
| Checkpoints and local GitLab publication | [Git](rules/git.md) |
| Documentation language, README hierarchy and single source | [Module Documentation](rules/feature-documentation.md) |
| Scope and completion | [Incremental Delivery](rules/incremental-delivery.md) |
| Proportionate verification | [Testing](rules/testing.md) |
| Delegation, roles and model routing | [Economical Subagent Use](rules/subagents.md) |
| Tracker lifecycle | [Task Tracking](rules/task-tracking.md) |

Project-local sources should specify domain boundaries, exceptions and acceptance scenarios, not repeat these rules. The generator's CLI and check implementation are mapped in [src](src/README.md).

## Source-size signal

The maintainability rules and this CLI are included starting with `v0.6.0`. Existing consumers must update the dependency and regenerate their instructions to receive the new rules.

```sh
agent-code-size                       # Git tracked + non-ignored untracked sources
agent-code-size src/example.ts        # explicit changed files, relative to cwd
agent-code-size --strict src/example.ts
```

Run from the project root. Limits are defined by Code Style. Default mode only reports; `--strict` returns exit 1 for oversized files. Invocation/read failures return exit 2. This is opt-in CI enforcement, not a demand to refactor all legacy code. It does not detect duplicated logic, missing module docs, unsafe imports or bad architecture; use the maintainable-change workflow for those checks.

Counts physical lines (including blanks/comments) in JS/TS, Vue/Svelte, Python, Go, Rust, Java, Kotlin and Swift files. Skips declarations, `.generated.`/`.gen.` filenames, symlink files, and directories named `node_modules`, `vendor`, `dist`, `build`, `coverage`, `generated`, `__generated__`, `__snapshots__`, `.git`, `.pi`. Tests are included; unmarked fixtures/generated code are not automatically classified as exceptions. With explicit files, Git ignore rules do not apply. Git-discovered deleted files are skipped; explicitly missing source files are errors. Output contains paths/counts, not source content.

Do not enable strict mode globally until the project has reviewed its existing size signals and exception strategy. Wire it to selected changed files first if needed.

## Development

```sh
npm run check
```
