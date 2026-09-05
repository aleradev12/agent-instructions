# Testing

A test must protect an observable contract or a realistic failure risk. Do not add tests that mirror implementation lines without a plausible regression.

## Placement

- Colocate unit tests: `calculateFrameStart.ts` → `calculateFrameStart.test.ts`.
- Put fixtures shared by packages and platform suites in `packages/test-fixtures`.
- Import a module’s public API when testing its external contract. Directly import an internal helper only in that helper’s unit test.
- Configure the runner to match every supported test suffix. CI must prove a test file was discovered, not merely that it exists.

## Verification layers

| Layer | Coverage |
| --- | --- |
| Domain unit/property | Block invariants, rational time, reverse, audio anchors, deterministic merge |
| Adapter contract | SQLite, AssetStore, archive, network schemas, camera/media error mapping |
| Integration | Command → repository → projection; sync operations/assets; render plan → decoder |
| Native/device | Real lenses and controls, preview/photo geometry, interruptions, codecs |
| End-to-end acceptance | Product REQs on phone and desktop, disconnects, and project transfer |

## Core rules

- Keep domain and timeline packages pure and test them without React Native or Electron.
- Component tests cover user behavior; extract and test pure calculations separately.
- Inject controllable time, random IDs, filesystem, and network adapters.
- Golden images include a grid, asymmetric corners, orientation metadata, and expected perspective output.
- Audio fixtures include impulses at known sample positions; decode exported MP4 and inspect actual timestamps.
- The sync suite reorders, duplicates, and drops operations and chunks. The same DAG must produce the same projection or conflict set.
- The crash suite interrupts ingestion after staging, rename, SQL commit, and acknowledgement boundaries.
- Emulator-only testing cannot prove device camera support; record device model and OS version with native results.

## Validate the test

- A new regression test must first fail against the known faulty behavior or fixture.
- Failure output names the violated contract and relevant input.
- Do not hide flaky timing behind a large sleep; use a controllable clock/event and wait for explicit state.
- UI snapshots do not replace assertions for critical actions and state.
- Run the focused suite after a change, then required repository checks. Do not rerun unchanged checks without a reason.

The [delivery plan](../technical/delivery.md) defines the complete risk and acceptance matrix.
