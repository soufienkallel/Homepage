## CI formatting check v2.0.1

Change:
- Add repository formatter scripts for the CI `Prettier check` step.

Why:
- The workflow runs `npm run format:check`, but `package.json` does not define that script.
- The repository already has `.prettierrc` and `.prettierignore`, so the missing piece is wiring Prettier into package scripts.

How:
- Add `format` and `format:check` scripts in `package.json`.
- Add `prettier` as a dev dependency so the scripts run in CI after `npm ci`.

Affected files:
- `package.json`
- `package-lock.json`
- `.prettierignore`
- `.prettierrc`
- `.github/workflows/ci.yml`