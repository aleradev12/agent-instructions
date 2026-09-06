# Flux Task Workflow

Flux is the shared task tracker across projects (MCP server `flux`, tool names prefixed `mcp__flux__`). Every tracked task is implemented in its own commit so the board and git history stay aligned. Connection details differ per machine and per checkout; never hardcode or assume them.

## Connecting

- Flux may run against a local data file or a shared server; the choice is configured per checkout and per machine, so discover it instead of guessing paths or URLs.
- If the flux tools are missing or return no projects, report this and ask how to proceed; do not create storage, configuration, or projects on your own initiative.

## Planning and follow-up tasks

- A task in `planning` is a draft, not agent-ready work. Never move it to `todo` or start it unless the user explicitly asks to promote that exact task.
- Only a task already in `todo` may be moved to `in_progress` by an agent.
- When you discover follow-up work while implementing a task, create a separate task in `planning`, then continue working only on the current task. Never promote or start that follow-up yourself.
- When Flux supports the `requires_human` flag, set it only while **creating** a new task that requires physical action, credentials, owner approval, or clarification. Do not change `requires_human` on an existing task.

## Choosing where to work

Decide before writing code, from the task itself:

- Small task (a focused change touching few files, low conflict risk): the current branch is acceptable.
- Large task (new feature, cross-module refactor, many files, or long-running work): use a dedicated git worktree so the main checkout stays available to the developer and other agents.
- Prefer a worktree whenever the checkout contains unrelated uncommitted work, even for a small task.

Worktree recipe (adapt names to repo conventions):

```sh
git worktree add ../<repo>-wt-<task-id> -b flux/<task-id>-<short-slug>
```

- Keep worktrees outside the repository or in an ignored path; never commit them.
- A fresh worktree does not share installed dependencies; install them there before building or testing.
- Remove the worktree only after its branch is merged or explicitly abandoned.

## One task, one commit

- Implement exactly one flux task per commit; never mix task work with unrelated edits.
- Reference the task id in the commit body (`Flux-Task: <id>`) so history links back to the board.
- If a task genuinely needs several commits, keep each commit coherent and reference the same task id in each body.

## Committing in a shared tree

Other agents and the developer may work in the same checkout concurrently.

- Run `git status --short` before staging and treat every file you did not touch as someone else's work.
- Stage with an explicit pathspec only; `git add -A`, `git add .`, and `git commit -a` are forbidden.
- If a file you need already contains changes you did not make, stop and ask; never commit, discard, stash, or overwrite them.
- After committing, confirm the commit contains only your changes:

```sh
git show --stat HEAD
```

## Closing the task

- Once the commit exists, add a task comment with the commit hash and a summary of what was done, then move the task to `done` as described in the task-tracking rules.
- Push or open merge requests only when the project workflow calls for it; a finished task means a local commit unless stated otherwise.
