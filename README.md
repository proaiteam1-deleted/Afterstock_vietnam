# AfterStock Vietnam

Vietnamese clone of the current AfterStock MVP front page.

## Scope

- Same one-page layout as the Korean AfterStock deployment.
- Top asset tabs, search, TradingView/basic chart area, community direction panel, AI opinion button, profile accuracy ranking, reward banner, and market snapshot are preserved.
- User-facing text on the MVP home flow is localized to Vietnamese.
- Realtime chat remains disabled; the page keeps the profile opinion/feed structure.

## Local Run

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Data Notes

- Main profile ranking mock data lives in `components/home/stock-chart-community-home.tsx`.
- Stock/quote/community seed data lives in `lib/stocks/mockStocks.ts`.
- Profile images use remote community-style Unsplash image URLs with the existing circular fallback avatar.
- AI opinion button is UI-only; connect the future API in `handleAskAi`.
