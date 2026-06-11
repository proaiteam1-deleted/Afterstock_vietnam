# Developer Handoff

This codebase is now organized around stable product boundaries so multiple developers can work in parallel without reaching across layers.

## Architecture Review

- `app/` contains route composition only. Pages should load data through services and assemble feature components.
- `components/ui/` contains generic shadcn-style primitives. These should not know about AfterStock domain models.
- `components/landing/`, `components/stocks/`, `components/sentiment/`, `components/vote/`, and `components/community/` contain feature UI.
- `lib/types/` owns shared TypeScript models and Zod schemas.
- `lib/domain/` owns business rules such as crowding thresholds, contrarian hint text, and local sentiment recalculation.
- `lib/mock/` owns temporary mock datasets split by domain.
- `server/services/afterstock-service.ts` is the data access layer. It currently reads mock data, but callers should treat it as the future Supabase boundary.
- `lib/supabase/` contains client/server placeholders for the future database integration.

## Service Boundary

Use these functions from `server/services/afterstock-service.ts` instead of importing mock data directly:

- `getStocks()`
- `getStockBySymbol(symbol)`
- `getSentimentBySymbol(symbol)`
- `submitVote(stockSymbol, direction)`
- `getCommunityPosts(stockSymbol?)`
- `getTopPredictors(stockSymbol?)`

Additional helpers such as `getStockDashboard()`, `getStockDashboards()`, `getUserProfiles()`, and `getSentimentHistoryBySymbol()` exist for page composition.

## How To Continue

1. Keep route files small. If a route starts carrying layout-heavy JSX, move it into a feature component.
2. Keep reusable visual primitives in `components/ui`; keep product-specific components in their feature folder.
3. Add new domain rules to `lib/domain`, not inside React components.
4. Add or update types in `lib/types` before changing services or UI props.
5. Add mock data in the relevant `lib/mock/*` file while persistence is not ready.
6. Replace service internals with Supabase queries later without changing component imports.
7. Use `submitVote()` as the eventual server-action/Supabase insert boundary for authenticated voting.

## Supabase Migration Notes

- `getStocks()` should query `stocks`.
- `getSentimentBySymbol()` should query the latest row in `sentiment_snapshots`.
- `submitVote()` should insert into `votes`, enforce one vote per user/session, and return a recalculated or freshly fetched snapshot.
- `getCommunityPosts()` should join author profile data or remain post-only with a separate profile fetch.
- `getTopPredictors(stockSymbol?)` should use `prediction_results` once per-stock accuracy exists.

## Quality Checks

Run these before handing off a branch:

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm format:check
corepack pnpm build
```
