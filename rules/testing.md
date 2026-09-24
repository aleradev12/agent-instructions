# Testing

Protect observable behavior and realistic failure risks. Use a small, reliable check set, not exhaustive test layers or repeated reviews for every change.

## Default verification

- Run affected lint/type checks, focused behavior tests and the repository's required checks. For a new end-to-end capability, add one reproducible smoke path through its real boundaries.
- Test the important failure for the changed behavior: invalid input, denied access, retry, provider timeout or interrupted write as appropriate. Do not add every possible category to a trivial change.
- Changes to identity, permissions, shared contracts or durable state need targeted integration/negative tests in addition to a happy path. Cross-user/tenant data access and duplicate writes are not optional polish.
- Use deterministic fakes for external providers and inject time/randomness when outcomes depend on them. A live paid AI call is not a unit-test prerequisite; test the real adapter separately when credentials and environment are authorized.
- Do not claim a mocked test proves a real deployment or live provider works. Report checks that could not be run.

## Placement and quality

- Colocate focused unit tests with their owner. Put cross-module fixtures in a shared test location only when actually shared.
- Test public contracts; import an internal helper directly only in that helper's unit test. Assert outcomes rather than duplicating implementation lines.
- Ensure the runner discovers every supported test suffix. Prefer explicit assertions to broad snapshots or arbitrary sleeps.
- For a bug fix, demonstrate the regression fails before the fix when practical. Name the violated behavior in the test and failure output.
- Run focused checks after editing, then required repository checks. Rerun unchanged checks only when a changed dependency, environment or integration result warrants it.

Load, stress, broad property-based suites and specialized device/media matrices are project-specific additions, not a default tax. Add them for a concrete requirement or observed risk, and link their plan from the owning module.
