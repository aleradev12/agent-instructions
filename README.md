# Agent Instructions

Reusable default engineering rules and a dependency-free generator for `AGENTS.md`, Codex project skills, and Claude project skills.

## Install from GitLab

```sh
npm install --save-dev 'git+ssh://git@git.lan/master-group/reusable/agent-instructions.git#v0.4.0'
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
    "disabled": ["fsd"]
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

All fields are optional. Without a config file, the values above apply except that no default rule is disabled and the title is `Project Agent Instructions`.

Set `defaults.enabled` to `false` to omit every shared rule. Use `defaults.disabled` to omit individual rules while keeping the rest. Available rule IDs are:

- `code-style`
- `components`
- `feature-documentation`
- `fsd`
- `git`
- `state-and-data`
- `styling`
- `task-tracking`
- `testing`

Every visible `.md` directly inside `agents.sourceDirectory` extends the selected defaults. The directory may be absent or empty when defaults are enabled. Nested directories and non-Markdown files are rejected.

## Project skills

The package includes the shared `board-task-workflow` skill for GitLab board issue triage, child Task decomposition (`[medium]`/`[high]`), and tier-aware execution (e.g. GPT Luna / GPT Sol). It is generated to every configured skill output by default. Add `"board-task-workflow"` to `skills.disabled` to omit it; unknown names are rejected.

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

## Development

```sh
npm run check
```
