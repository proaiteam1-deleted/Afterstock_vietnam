# Frontend Architecture

AfterStock uses the Next.js App Router with TypeScript and Tailwind CSS.

## Folder Ownership

- `app/`: route-level pages and metadata
- `components/layout/`: shell and navigation
- `components/stocks/`: stock dashboard components
- `components/vote/`: voting UI and form behavior
- `components/sentiment/`: charts, gauges, interpretation cards
- `components/community/`: community previews and badge display
- `components/ui/`: shadcn-style primitives
- `lib/domain/`: product rules such as sentiment crowding thresholds
- `server/services/`: server-side data access facade
- `lib/mock/`: temporary local data
- `lib/types/`: TypeScript and Zod models
- `lib/supabase/`: future Supabase clients

## Data Flow

Pages call `server/services/afterstock-service.ts`. Today those functions return mock data. Later they should be replaced with Supabase queries without changing page/component contracts.

Voting is local-only in the initial build. `VotePanel` validates with Zod and React Hook Form, then parent components can optimistically update local UI state.

## Component Rules

- Keep financial data display components stateless where possible.
- Put interactive state in client components near the interaction.
- Use typed props from `lib/types`.
- Keep route files focused on composition and data loading.
