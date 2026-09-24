# Instruction tooling

## Business requirements

Provide reusable engineering guidance without project-specific runtime dependencies. Consumers can regenerate project instructions and skills, and obtain a lightweight source-size signal without modifying application code.

## Technical notes

- **Generator:** validates configuration and Markdown sources, combines shared and local instructions, then synchronizes generated skill outputs. It refuses to overwrite manually authored skills.
- **Code-size inspector:** enumerates Git sources or takes explicit files, classifies paths, counts physical lines and returns findings. It does not rewrite files or infer architectural quality. CLI usage and exclusions live in the package README; thresholds follow Code Style.
- **CLI adapters:** parse arguments and render results/errors; checks themselves stay usable without shell parsing of their output. Node's built-in test runner covers temporary-project generation and size-check behavior.

Policy sources belong in `rules/`; task procedures belong in `skills/`. Do not put either specification into implementation comments.
