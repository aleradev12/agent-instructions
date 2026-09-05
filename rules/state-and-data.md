# State and Data

Choose storage by lifetime and ownership.

| Data | Location | Examples |
| --- | --- | --- |
| One component or slice | Local state and props | open panel, drag preview, focus |
| One scenario | Feature/widget model | selection, insertion point, playback controls |
| Unrelated screens in one session | App-level store only when truly shared | current project ID, connection status |
| Must survive restart | ProjectRepository/SQLite or dedicated settings storage | blocks, order, clips, user settings |
| Large immutable data | AssetStore | photos, audio, upscale outputs |
| Regenerable derived data | Cache | thumbnails, proxies, waveforms |

## Rules

- Commit durable project data to the repository before presenting it as saved; persisted Zustand is not the project database.
- Change SQL and media files through application commands and ports, never directly from feature UI.
- Do not duplicate the complete project model in a UI store. Store IDs, command status, and focused projections/selectors.
- A peer or network response becomes canonical only after schema validation, operation validation, and commit.
- Camera state, transfer progress, peer state, and durable project state have different lifecycles; do not collapse them into one object.
- Do not persist speculative values without a real reader and a migration rule.
- Centralize settings storage; features must not create ad hoc AsyncStorage or MMKV keys.
- Keep absolute paths in the AssetStore location table; domain and sync use asset hashes.
- If deleting a cache entry can lose the project, it is an asset rather than cache.

## Errors and optimistic UI

- A reversible action may appear before commit when it has rollback and a visible pending state.
- A capture is not saved until its file is verified and the project transaction commits.
- Never replace an error with an empty value that looks successful.
- Commands expose stable error kinds and technical context; UI maps them to understandable actions.
- Canceling UI cannot always cancel hardware already in progress. After capture starts, receipt and recovery determine the outcome.

## Selectors

- Subscribe a component to the smallest useful projection, not the entire project.
- Derive values from one source of truth. Do not persist calculated clip start or block duration as independently mutable fields.
- Cache expensive projections by project revision and input hashes.
- Keep selectors pure and testable; application services perform IO.
