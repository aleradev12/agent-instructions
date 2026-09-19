# Task Tracking

Track implementation work in GitLab issues on `git.lan` (group `master-group`) so status and outcomes stay visible outside the conversation. Apply the same discipline if a project uses a different tracker.

## Status lifecycle

- Before starting work on an issue, set the `In progress` label and remove `Todo for agents` if present; the issue stays open.
- Issues migrated from the retired local tracker carry `Legacy status: <x>` labels; when you pick one up, replace the legacy label with the current labels.
- If the current state is unclear, check the issue's state, labels and comments (via `glab` or the API) rather than guessing.
- On finishing, add a comment on the issue summarizing what was actually done: files touched, key decisions, and the verification result (build/test/boot pass or fail).
- Then close the issue. Closed means done; there is no separate "done" label.
- If something is left incomplete or deliberately deferred, say so explicitly in the comment and leave the issue open with `In progress` rather than closing it.

## Delegating to a subagent

A freshly spawned subagent has no memory of tracker conventions. When delegating a tracked issue to one, state explicitly in its prompt: the issue URL or project path with issue id(s) it owns, and that this status lifecycle applies — otherwise it will do the work without ever touching the tracker.
