# Git and File Changes

## Shared working tree

- Treat unrelated changes as user or parallel work.
- Add only current-task files to a commit using an explicit pathspec.
- Check `git status --short` and the target-file diff before editing.
- Do not run a repository-wide formatter for a task that changes a few files.
- Never discard or overwrite unknown changes to obtain a clean diff.

```sh
git add -- <pathspec>
git commit -m "<type>: <imperative description>" -- <pathspec>
```

## Commits

- Use Conventional Commit types: `feat`, `fix`, `refactor`, `docs`, `test`, and `chore`.
- Keep one coherent change per commit.
- Use an imperative subject for `feat`, `refactor`, `docs`, and `chore`.
- A `fix` subject names the observable problem being corrected.
- A non-trivial commit body briefly explains the reason and non-obvious decision; it does not narrate the diff.
- Commit your own intermediate changes locally at coherent checkpoints, not only at the end of a large task. A checkpoint may be incomplete: identify that honestly in the commit/report, but do not include secrets or unrelated work.

## Push and handoff

- GitLab on the exact host `git.lan` is the owner's local collaboration remote: periodic pushes of task branches are authorized without a frequency limit. Push all your completed local checkpoints there **before finishing the session or handing control back to the user**. A pushed WIP branch is preferable to an unreported pile of task changes.
- Inspect the actual push URL (`git remote -v` / `git remote get-url --push --all <remote>`), not the remote name. Use an explicit verified remote and branch. If that remote has multiple push URLs, do not push through it unless every destination is authorized; do not treat a hostname merely containing `git.lan` as the local host.
- Other Git hosts/remotes require explicit user authorization for that destination. This rule does not authorize force-push, overwriting someone else's commits, merging to a protected branch, deployments or public releases. Prefer the current task branch; do not merge just to satisfy the push rule.
- Before handoff, check status, inspect the task diff, run appropriate checks, commit only owned paths, push to `git.lan`, and verify the push result. Report branch/commit and remaining work. Preserve unrelated dirty files and report them; never sweep all changes into a commit to manufacture a clean tree.
- If checks fail but the checkpoint is safe to save, commit and push it as incomplete, keeping the task open. If push fails or no authorized local remote exists, preserve the local commit and report the exact blocker; do not silently switch hosts, reset history or claim publication. In an emergency interruption, preserve the latest safe checkpoint and state what remains unsaved.
- Do not race an active writer to make a checkpoint. On async delegation handoff, the coordinator pushes existing completed checkpoints; live child changes are saved by their sole owner at a safe boundary and published by the coordinator when consumed.

## Moving files

Move a file before editing it so Git can preserve rename history:

```sh
git mv <old-path> <new-path>
git diff --cached --summary -- <old-parent> <new-parent>
```

After confirming the rename, update imports, public APIs, tests, and documentation. Very small barrel files may appear as add/delete because they have too little content for rename detection; primary implementation files should retain recognizable history.

## Searches and secrets

- Use the configured code-exploration workflow; keep searches scoped and respect ignore rules.
- Do not read `.env`, signing keys, tokens, or credentials without an explicit need and owner authorization.
- Never copy a secret into a commit, document, comment, terminal output, or message.
- Treat runtime mobile configuration as extractable from APK/IPA; it is not storage for build-time secrets.
