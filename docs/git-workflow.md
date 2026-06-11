# Git Workflow

## Main Branch Policy

- `main` should always build and be safe to deploy.
- Do not commit directly to `main` after the GitHub repository is shared.
- Merge changes through pull requests.
- Before opening a PR, run `corepack pnpm lint`, `corepack pnpm typecheck`, and `corepack pnpm build`.
- Keep `main` protected from direct local development work.

## Development Branch

Use one shared development branch for current MVP work:

- `codex/dev-setup`

Do not create separate feature branches for each change unless the team decides
to change this workflow. All login-free MVP work, community voting features,
Korean UI updates, and structural fixes should continue on `codex/dev-setup`.

## Commit Message Examples

Use concise, imperative messages:

```text
feat: add mock-backed vote service
fix: prevent dashboard chart overflow on mobile
docs: add Windows local setup steps
refactor: split stock detail page sections
chore: update pnpm lockfile
```

## Pull Request Flow

1. Sync `main`.
2. Switch to `codex/dev-setup`.
3. Make focused changes on `codex/dev-setup`.
4. Run lint, typecheck, and build locally.
5. Push `codex/dev-setup` to GitHub.
6. Open a PR with:
   - what changed
   - how it was tested
   - screenshots for UI changes when useful
   - known limitations or follow-up work
7. Request review.
8. Address comments with additional commits.
9. Squash or merge after approval, depending on the team preference.

## Starting On A New PC

1. Install Git and Node.js.
2. Clone the repository.
3. Run `corepack enable`.
4. Run `corepack pnpm install`.
5. Copy `.env.example` to `.env.local`.
6. Fill in Supabase environment variables from the team secret store.
7. Run `corepack pnpm dev`.
8. Confirm the app opens at [http://localhost:3000](http://localhost:3000).

See [local-setup.md](./local-setup.md) for OS-specific commands.
