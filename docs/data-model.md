# Data Model

## Stock

- `symbol`
- `nameKo`
- `nameEn`
- `market`
- `price`
- `changePercent`
- `volume`

## Vote

- `id`
- `stockSymbol`
- `direction`: `up` or `down`
- `userId`
- `createdAt`
- `sessionDate`

## SentimentSnapshot

- `stockSymbol`
- `bullishPercent`
- `bearishPercent`
- `totalVotes`
- `crowdingLevel`
- `contrarianSignal`
- `createdAt`

## User

- `id`
- `nickname`
- `accuracyRate`
- `totalPredictions`
- `badge`: `지존`, `고수`, `평범`, or `똥손`

## CommunityPost

- `id`
- `userId`
- `stockSymbol`
- `title`
- `body`
- `imageUrl`
- `createdAt`
- `likes`
