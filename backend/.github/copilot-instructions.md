# Copilot Instructions

## Module Layout Rules

- Keep feature modules under `src/<feature>` or `src/common/<feature>`; avoid placing feature code at the root.
- Every module directory must include `dtos`, and `services` subfolders and `types.ts` file.
- Each `types`, `dtos`, and `services` folder must expose an `index.ts` barrel that re-exports the public APIs of the files inside it.
- Add other capability folders (controllers, gateways, providers, etc.) alongside those required folders, maintaining a flat module structure.

## Contribution Notes

- Prefer creating new shared utilities under `src/common` and export them through their respective `index.ts` barrels.
- When adding new DTOs or types, update the corresponding barrel to keep imports stable.
- Keep comments succinct; add them only when the intent of the code is not obvious from the implementation.
- Ensure any generated files or compiled output remain outside of source control unless explicitly necessary.
