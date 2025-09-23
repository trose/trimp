# AGENTS.md

## Build/Lint/Test Commands
- Build: No specific build command found; assume `npm run build` or equivalent if package.json exists.
- Lint: No specific lint command found; assume `npm run lint` or `eslint .` if applicable.
- Test: No specific test command found; assume `npm test` or `pytest` if applicable.
- Single test: No specific command found; assume `npm test -- --testNamePattern="test name"` or `pytest -k "test_name"`.

## Code Style Guidelines
- Imports: Place all imports at the top of the file, grouped by external and internal.
- Formatting: Use 2 spaces for indentation; avoid trailing whitespace.
- Types: Use TypeScript if applicable; prefer explicit types over implicit.
- Naming: camelCase for variables/functions, PascalCase for classes/interfaces.
- Error Handling: Use try-catch blocks; log errors appropriately without exposing sensitive info.
- Conventions: Follow existing patterns; keep functions small and focused.
- Linting: Run linting before commits; use commitlint git hook to enforce conventional commit messages.
- Commit Often: Commit changes frequently to maintain a clean git history and enable easy rollbacks.
- No specific Cursor or Copilot rules found in the codebase.