# 365Scores Frontend

Next.js 16 App Router frontend for the 365Scores assessment. The project uses TypeScript, Tailwind CSS 4, TanStack Query 5, and shadcn/ui primitives, Zustand 5.

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Engine (optional, for container workflows)

## Setup

1. Review `.github/copilot-instructions.md` to align with repo conventions.
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Copy `.env.example` to `.env.local` (if present) and fill in any required variables referenced in `src/config/env.ts`.

## Local Development

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to: **http://localhost:3000**
3. The app will automatically reload when you make changes to the code

**Development URL**: [http://localhost:3000](http://localhost:3000)  
**Default Port**: 3000

- Global providers and layout live under `src/app/layout.tsx`; route entries sit in `src/app/<segment>`.

## Available Pages

Once the development server is running, you can access the following pages:

- **Home Page**: [http://localhost:3000/](http://localhost:3000/) - Main landing page and Quiz starter
- **Quiz Pages**:
  - Quiz session: `http://localhost:3000/quiz/[sessionId]` (dynamic route for active quiz sessions)
- **Leaderboard**: [http://localhost:3000/leaderboard](http://localhost:3000/leaderboard) - View quiz rankings and scores

**Note**: The quiz session pages require a valid session ID generated when starting a quiz. Navigate through the app flow starting from the home page to access quiz sessions properly.

## Quality Checks

- Lint: `npm run lint`
- Format: `npm run format` (check) or `npm run format:write`

## Production Build

- Build artifacts: `npm run build`
- Preview production server: `npm run start`

## Docker

- Build image: `docker build -t 365scores-frontend .`
- Run container: `docker run --rm -p 3000:3000 365scores-frontend`
- Compose (build + run): `docker compose up --build`

The container executes `npm run start` against the production build produced during the image build stage.

## Architecture Conventions

- Follow `.github/copilot-instructions.md` for naming, barrel exports, and import ordering.
- Default to server components inside `src/app`; add `"use client"` only when React hooks or browser APIs are required.
- Scope feature logic under `src/features/<domain>` and re-export public APIs via each folder's `index.ts` barrel.
- Shared UI primitives stay in `src/components`; extend shadcn/ui primitives instead of forking them.
- Route definitions live in `src/config/routes.ts`; treat it as the source of truth when adding or renaming pages.
- Global state is powered by Zustand; store slices live under `src/stores/zustang` with domain-specific actions and selectors.

## Realtime Integrations

- **Server-Sent Events (SSE)**: `src/api/leaderboard/subscriptions/use-leaderboard-sse-subscription.ts` opens an `EventSource` to `env.apiBaseUrl + leaderboardRealtimeSSEConfig.sseEndpoint`. Consumers call `useLeaderboardSseSubscription(limit)` to keep the Zustand leaderboard store (`src/stores/zustang/leaderboard-store.ts`) in sync. Events are expected under the `leaderboardRealtimeSSEConfig.event` channel and carry JSON-encoded `LeaderboardSnapshot` payloads.
- **WebSocket (Socket.IO)**: `src/api/leaderboard/subscriptions/use-leaderboard-subscription.ts` creates a shared Socket.IO client that listens on `leaderboardRealtimeConfig.event`. Although the App Router currently uses SSE by default, this hook remains available for environments where WebSockets are preferred. Switch imports in `src/app/leaderboard/_components/leader-board-page-client.tsx` if you need the WebSocket transport.
- Connection settings for both transports reside in `src/config/realtime.ts`; update namespace/path/event values there to match backend changes.
- Real-time fetchers rely on `env.apiBaseUrl` (`NEXT_PUBLIC_API_BASE_URL`); ensure the origin includes protocol and host so cross-origin credentials work.

## Project Structure (Excerpt)

```
src/
	app/                # Next.js App Router entry points
	components/         # Shared UI primitives and layout
	features/           # Feature domains (UI, hooks, utils, types)
	api/                # HTTP clients, queries, mutations
	providers/          # Global provider composition
	config/             # Runtime configuration helpers
```

Refer to `.github/copilot-instructions.md` for naming and architectural conventions when contributing.
