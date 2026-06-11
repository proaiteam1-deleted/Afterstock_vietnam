# Supabase Schema Proposal

This schema is not required for local development yet. The current app uses mock data and is structured so these tables can replace the mock layer later.

## `stocks`

- `symbol` text primary key
- `name_ko` text not null
- `name_en` text not null
- `market` text not null
- `price` numeric not null
- `change_percent` numeric not null
- `volume` bigint not null
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

## `votes`

- `id` uuid primary key default gen_random_uuid()
- `stock_symbol` text references `stocks(symbol)`
- `direction` text check in (`up`, `down`)
- `user_id` uuid references auth.users(id)
- `session_date` date not null
- `created_at` timestamptz default now()
- Unique index: `(stock_symbol, user_id, session_date)`

## `sentiment_snapshots`

- `id` uuid primary key default gen_random_uuid()
- `stock_symbol` text references `stocks(symbol)`
- `bullish_percent` numeric not null
- `bearish_percent` numeric not null
- `total_votes` integer not null
- `crowding_level` text not null
- `contrarian_signal` text not null
- `created_at` timestamptz default now()

## `users_profile`

- `id` uuid primary key references auth.users(id)
- `nickname` text not null
- `accuracy_rate` numeric default 0
- `total_predictions` integer default 0
- `badge` text not null default '평범'
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

## `community_posts`

- `id` uuid primary key default gen_random_uuid()
- `user_id` uuid references auth.users(id)
- `stock_symbol` text references `stocks(symbol)`
- `title` text not null
- `body` text not null
- `image_url` text
- `likes` integer default 0
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

## `prediction_results`

- `id` uuid primary key default gen_random_uuid()
- `vote_id` uuid references `votes(id)`
- `stock_symbol` text references `stocks(symbol)`
- `session_date` date not null
- `actual_direction` text check in (`up`, `down`, `flat`)
- `is_correct` boolean not null
- `settled_at` timestamptz default now()

## RLS Notes

- Anyone can read `stocks` and `sentiment_snapshots`.
- Authenticated users can create `votes`.
- Users can only edit their own votes and posts.
- Admin can manage stocks and sentiment snapshots.
- Community post writes should require authentication.
