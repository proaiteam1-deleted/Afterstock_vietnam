# Local Setup

## Prerequisites

- Git
- Node.js 20 or newer
- Corepack, included with modern Node.js
- Access to the team Supabase development variables when persistence is enabled

## macOS

1. Install Node.js and Git. Homebrew example:

```bash
brew install node git
```

2. Clone the repository:

```bash
git clone https://github.com/YOUR_ORG/afterstock.git
cd afterstock
```

3. Enable Corepack and install dependencies:

```bash
corepack enable
corepack pnpm install
```

4. Create local environment variables:

```bash
cp .env.example .env.local
```

5. Edit `.env.local` and replace placeholder values with development values.

6. Start the app:

```bash
corepack pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000).

## Windows PowerShell

1. Install Node.js and Git from their official installers, or with winget:

```powershell
winget install OpenJS.NodeJS
winget install Git.Git
```

2. Clone the repository:

```powershell
git clone https://github.com/YOUR_ORG/afterstock.git
cd afterstock
```

3. Enable Corepack and install dependencies:

```powershell
corepack enable
corepack pnpm install
```

If `corepack enable` fails because Windows cannot write shims under `Program Files`, continue using `corepack pnpm` commands directly.

4. Create local environment variables:

```powershell
Copy-Item .env.example .env.local
```

5. Edit `.env.local` and replace placeholder values with development values.

6. Start the app:

```powershell
corepack pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000).

## Verification

Run these before starting substantial work:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

## Environment Safety

- Commit `.env.example`.
- Do not commit `.env.local`, `.env`, production env files, service role keys, or downloaded secret files.
- Store shared development secrets in the team password manager or GitHub Actions secrets, not in the repository.
