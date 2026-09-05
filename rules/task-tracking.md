# Task Tracking

Use the project's task tracker for implementation work so status and outcomes stay visible outside the conversation. The shared tracker across these projects is Flux (MCP server `flux`); apply the same discipline if a project uses a different tracker instead.

## Status lifecycle

- Before starting work on a tracked task, move it to `in_progress`.
- If the valid status names or current state are unclear, check with the tracker's list operation (e.g. `mcp__flux__list_tasks`) rather than guessing.
- On finishing, add a comment on the task summarizing what was actually done: files touched, key decisions, and the verification result (build/test/boot pass or fail).
- Then move the task to `done` (or the closest valid terminal status if `done` is rejected).
- If something is left incomplete or deliberately deferred, say so explicitly in the comment and leave the task `in_progress` rather than marking it done.

## Delegating to a subagent

A freshly spawned subagent has no memory of tracker conventions. When delegating a tracked task to one, state explicitly in its prompt: the tracker project id, the exact task id(s) it owns, and that this status lifecycle applies — otherwise it will do the work without ever touching the tracker.
