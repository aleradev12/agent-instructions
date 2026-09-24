# Economical Subagent Use

Delegation requires an operator request or applicable project authorization. Direct parent execution is the default; task size alone is not permission. This rule owns role selection, handoffs and delegation cost. Tracker state follows Task Tracking, not a second lifecycle here.

## Smallest useful assignment

- Ordinary roles are `scout` (read-only reconnaissance) and `worker` (one bounded implementation). Skip the scout when the relevant module and contract are already known.
- For a small change, work directly or use one authorized worker. Do not automatically build a scout → worker → multiple reviewers → oracle pipeline.
- Other roles are exceptional, strongly discouraged for ordinary work, and require explicit operator approval with a concrete reason. A worker completing a task does not automatically authorize a separate review stage; the parent reads the report and diff.
- Do not discover agents or list the model registry routinely when approved roles and model IDs are already known. Consult the local policy first and discovery only for a genuinely unknown capability, subject to tool requirements.
- A child must not delegate again unless nested delegation was explicitly authorized. Stop after the assigned result; do not turn a narrow task into its own orchestration project.

## Model routing

Use the configured allowlist and exact provider/model IDs from operator or project policy. `[medium]` work routes to the approved middle class (for example GPT Luna); `[high]` work routes to the approved high class (for example GPT Sol). The board-task-workflow skill owns task classification; a long task is not automatically high responsibility. On an unavailable model, quota or launch failure, report the exact blocker; do not silently switch models, runtimes or CLI execution modes.

## Handoff and integration

Give the child only what it needs: objective, issue if any, repo/cwd/ref, owned module/files, relevant contracts, permitted edits and publication boundaries, acceptance criteria, focused validation, expected report and escalation conditions. Point to authoritative instructions rather than pasting the whole conversation.

Maintain one writer per working tree. Parallel mutation needs isolated worktrees and non-overlapping ownership; sequence dependent tasks. Pass an explicit artifact or contract at a dependency boundary, not an assumption that the next child remembers prior work.

The parent owns tracker updates unless explicitly delegated, dependency coordination, final acceptance and publication. Read actual changes and verification evidence before declaring success; report unresolved decisions rather than repeatedly launching additional agents to guess them. Use the installed runtime's documented async/completion protocol, not sleep/status polling as a waiting strategy.
