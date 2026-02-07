# Contributing

Thanks for contributing. This project is small and focused, so clean, well-scoped changes are easiest to review.

## Code of Conduct
This project follows the Contributor Covenant. See `CODE_OF_CONDUCT.md`.

## Development Setup
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`

## Useful Scripts
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Build: `npm run build`
- Preview: `npm run preview`

## Fork and Pull Request Workflow
1. Fork the repository on GitHub.
2. Create a branch: `git checkout -b feat/short-description`
3. Make your changes and keep them focused.
4. Run `npm run lint` and `npm run typecheck` before opening a PR.
5. Push your branch and open a pull request.
6. Fill out the PR template with a clear summary and test status.

## Versioning
This project uses automated version bumps on merges to `main` based on PR titles.
Rules:
- Titles containing `feat` trigger a minor bump.
- Titles containing `fix` trigger a patch bump.
- If neither keyword is present, no version change occurs.

Example titles:
- `feat: add rotation presets`
- `fix: correct libero placement`

## Commit Guidance
- Use clear, descriptive commits.
- Keep changes small and easy to review.

## Reporting Bugs
Use the issue templates in GitHub to report bugs or request features.
