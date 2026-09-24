# Task Tracking

Track implementation work in GitLab issues on `git.lan` (group `master-group`) so status and outcomes stay visible outside the conversation. Apply the same discipline if a project uses a different tracker.

## Status lifecycle

- Only start work on an issue explicitly labeled `Todo for agents`. An open issue without that label is not agent-ready work; if nothing is labeled, say so instead of picking an issue yourself.
- Before starting work on an issue, set the `In progress` label and remove `Todo for agents`; the issue stays open.
- Issues migrated from the retired local tracker carry `Legacy status: <x>` labels; when you pick one up, replace the legacy label with the current labels.
- If the current state is unclear, check the issue's state, labels and comments (via `glab` or the API) rather than guessing.
- On finishing, add a comment on the issue summarizing what was actually done: files touched, key decisions, and the verification result (build/test/boot pass or fail).
- Then close the issue. Closed means done; there is no separate "done" label.
- If something is left incomplete or deliberately deferred, say so explicitly in the comment and leave the issue open with `In progress` rather than closing it.

## Delegating to a subagent

Economical Subagent Use owns the handoff procedure. Point the assigned tracker owner to this lifecycle and the issue; if a child cannot access the tracker, the parent posts its verified report. Do not silently drop status updates or grant a child publication/closure authority just to obtain a comment.
