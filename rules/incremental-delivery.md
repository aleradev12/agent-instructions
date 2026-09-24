# Incremental Delivery

Deliver a working, understandable slice with basic protection, not a theoretically perfect platform. This rule owns scope and completion discipline; structural policy belongs to Module Boundaries and validation policy to Testing.

## Bound the change

- Turn a broad request into independently verifiable slices. Before editing, state the behavior, its owner, affected contracts, exclusions and a short check plan. Do not require a long planning document for a small fix.
- Complete one user-visible path before broadening the feature. A shared-contract change has one owner; dependent implementations follow the contract rather than inventing incompatible alternatives.
- Do not mix feature delivery with an unrelated rewrite, repository-wide formatting, dependency upgrade or framework substitution.
- Prefer existing runtime and tooling. Defer distributed infrastructure, caching and high-load tuning until a measured need or explicit acceptance criterion requires them. Keep extension boundaries without implementing every future extension.

## Basic protection is not optional

At external boundaries validate input, verify identity and authorization, and protect secrets/private data. For stateful writes address retries, atomicity and failure recovery where they can cause loss or duplication. Bound external calls and costs; surface failure honestly rather than returning a fake success. An AI/model response is untrusted input: validate proposed actions before committing authoritative state.

## Definition of done

Report the observable result, affected modules, commands actually run and their outcomes, known limitations and any exception requiring a decision. Use Testing for the necessary checks and Module Documentation for updates; a passing size check or polished demo alone is not completion. If an acceptance criterion remains unmet, say partial/blocked, not done. Keep remaining work in the tracker rather than embedding a running task diary in source comments.
