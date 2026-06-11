# API Roadmap

## Phase 1: Mock Data

- Read stocks from `server/services/afterstock-service.ts`
- Update vote state only in the browser
- Keep service functions stable in `server/services/afterstock-service.ts`

## Phase 2: Supabase Reads

- Replace stock and sentiment reads with Supabase queries
- Cache stable stock metadata
- Keep sentiment snapshots read-only for public users

## Phase 3: Authenticated Voting

- Require Supabase Auth for votes
- Enforce one vote per user, stock, and session date
- Add server actions for vote creation
- Recalculate snapshots with a scheduled job

## Phase 4: Community

- Persist community posts
- Add image storage through Supabase Storage
- Add moderation and report flows
- Add prediction result settlement jobs

## Suggested Endpoints or Server Actions

- `createVote(stockSymbol, direction, sessionDate)`
- `listStocks()`
- `getStockDashboard(symbol)`
- `listCommunityPosts(stockSymbol?)`
- `createCommunityPost(input)`
