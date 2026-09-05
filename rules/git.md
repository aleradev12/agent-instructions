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
- A request for a commit means a local commit. Push only when explicitly requested or required by an accepted release workflow.

## Moving files

Move a file before editing it so Git can preserve rename history:

```sh
git mv <old-path> <new-path>
git diff --cached --summary -- <old-parent> <new-parent>
```

After confirming the rename, update imports, public APIs, tests, and documentation. Very small barrel files may appear as add/delete because they have too little content for rename detection; primary implementation files should retain recognizable history.

## Searches and secrets

- Use `rg` for recursive searches because it respects ignore rules by default.
- Do not read `.env`, signing keys, tokens, or credentials without an explicit need and owner authorization.
- Never copy a secret into a commit, document, comment, terminal output, or message.
- Treat runtime mobile configuration as extractable from APK/IPA; it is not storage for build-time secrets.
