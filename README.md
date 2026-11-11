# Agent Instructions

Reusable default engineering rules and a dependency-free instruction and skill generator for Codex, Claude Code, Pi, and Cursor.

## Install from GitLab

```sh
npm install --save-dev 'git+ssh://git@git.lan/master-group/reusable/agent-instructions.git#v0.7.0'
```

Add one project command:

```json
{
  "scripts": {
    "docs:generate": "agent-instructions"
  }
}
```

Running `npm run docs:generate` without extra flags preserves the existing behavior: it writes the configured instruction file (`AGENTS.md` by default) and skill outputs, then verifies the result. It does not add `CLAUDE.md` or Cursor outputs automatically.

## Select platforms

Platform selection is available starting with `v0.7.0`. Update the dependency to receive the new CLI options and Cursor support.

```sh
npm run docs:generate -- --target cursor
npm run docs:generate -- --target claude
npm run docs:generate -- --target codex --target pi
npm run docs:generate -- --target all
```

Repeat `--target` to select several platforms. `--target=cursor` also works. Use `--help` to list options; `--config <path>` can be combined with platform selection.

| Target | Instructions | Skills |
| --- | --- | --- |
| `codex` | `AGENTS.md` | `.agents/skills/<name>/SKILL.md` |
| `claude` | `CLAUDE.md` | `.claude/skills/<name>/SKILL.md` |
| `pi` | `AGENTS.md` | `.agents/skills/<name>/SKILL.md` |
| `cursor` | `.cursor/rules/project.mdc` | `.cursor/skills/<name>/SKILL.md` |

Codex and Pi share their outputs; selecting both writes each artifact only once. `all` selects every platform. Only selected outputs are synchronized: files for other platforms are neither updated nor deleted.

Explicit targets use the native paths in the table, not `agents.output` or `skills.outputs`. The other configuration settings still apply, including source directories, title, and disabled rules/skills. Without `--target`, all configured output paths continue to work as before.

When using explicit targets, the generator refuses to overwrite instruction files without its generated-file marker. Existing protection for manually authored or extended skills applies in both modes. Move any authoritative manual instructions into the Markdown sources before generating over their old paths.

### Cursor: always-on rules, linked documents, and skills

The Cursor rule contains the same embedded instruction sources as `AGENTS.md`, wrapped in MDC frontmatter with `alwaysApply: true`. This makes the rule itself available in every Agent conversation; it does **not** inline or automatically load linked documents.

Markdown links remain links, with relative paths adjusted for the output file's directory. For example, `[API](../api.md#contracts)` in `docs/agents/project.md` becomes `[API](../../docs/api.md#contracts)` in `.cursor/rules/project.mdc`. Keep explicit instructions such as “Before changing API, read the contracts” in the source when a linked document must be consulted for that task.

Skills remain separate `SKILL.md` files, discoverable by name and description and loaded when needed, rather than becoming always-on rules. See the [Cursor rules](https://cursor.com/docs/rules) and [skills](https://cursor.com/docs/skills) documentation.

## Keep sources in Git, generate locally

Commit the configuration, `docs/agents/*.md`, and `docs/skills/*.md` along with any linked project documentation. Each developer can select their own platforms at invocation time without changing the shared config.

For generated-only paths, add these entries to the consuming project's `.gitignore`:

```gitignore
/AGENTS.md
/CLAUDE.md
/.cursor/rules/project.mdc
/.agents/skills/
/.claude/skills/
/.cursor/skills/
```

Do not ignore an entire skill directory if it also contains manually maintained skills; ignore only the generated skill subdirectories instead. Adjust entries for legacy custom output paths. Other Cursor rules, settings, and platform-specific files can stay tracked.

The generator does not edit `.gitignore` or untrack existing files. If generated artifacts are already tracked, first confirm that all authoritative content exists in the sources, then remove the generated artifacts from Git's index as a separate migration; `.gitignore` alone does not untrack them.

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

Each Markdown file in `skills.sourceDirectory` is a project-specific source for one skill on each selected platform (or each configured skill output in legacy mode). Its filename must match the `name` field and must not collide with an enabled shared skill:

```md
---
name: project-architecture
description: "Use for architectural changes in this project. Do not use for isolated copy edits."
---

# Project Architecture

Follow the project-specific workflow here.
```

The generator writes identical `SKILL.md` files to each selected output directory. It removes obsolete generated skills, but refuses to overwrite manually authored skills or remove a generated skill directory that contains extra files.

Set `skills.enabled` to `false` when the project needs instruction files without skills. Project-local skills are still supported alongside the package's shared skill.

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

To try this checkout without installing or publishing a release, run the CLI from a consuming project (prefer a scratch directory for inspection):

```sh
cd /path/to/consumer
node /path/to/agent-instructions/bin/agent-instructions.mjs --target cursor
node /path/to/agent-instructions/bin/agent-instructions.mjs --target all
```

The JavaScript API accepts the same selection as an array:

```js
await generateProject({ projectRoot, targets: ['cursor', 'claude'] });
```

Omit `targets` to preserve configured outputs. Results include `agentOutputs` for all generated instruction paths; the existing `agentOutput` field contains the first path for compatibility.
