# 365Scores Quiz Backend

NestJS service that powers the 365Scores quiz assignment. It exposes REST endpoints for running quiz sessions and reading leaderboards, while streaming live score updates over WebSockets and Server-Sent Events. PostgreSQL is accessed through Prisma ORM and Redis keeps short-lived session and leaderboard state. Session cookies are handled transparently—no explicit user registration endpoint is required. The repository includes Docker Compose support for running the full stack locally.

## Stack Highlights

- NestJS modules separate quiz orchestration, leaderboard broadcasting, and shared infrastructure concerns.
- Prisma provides a typed access layer to PostgreSQL (`prisma/schema.prisma`).
- Redis stores active quiz session state, question queues, and cached leaderboard slices.
- Socket.IO (`/leaderboard` namespace) pushes the top 1000 scores whenever a session completes.
- DTOs with `class-validator` and the Nest ValidationPipe enforce clean contracts between the API and clients.
- A cookie-based `SessionGuard` provisions or resumes anonymous participants for each request, injecting a stable `sessionUser` without manual authentication flows.
- Server-Sent Events (`GET /leaderboard/stream/top1000`) mirror websocket payloads for clients that prefer HTTP streaming, powered by `LeaderboardSseService`.
- A scheduled refresh (`CronExpression.EVERY_5_MINUTES`) keeps the cached leaderboard warm and re-broadcasts snapshots automatically.

## Prerequisites

- Node.js 18+ and pnpm 9+
- Docker Desktop (optional, for full stack)
- PostgreSQL 15+ and Redis 6+ if you are running services manually

## Environment

Copy `.env.example` to `.env` and adjust credentials as needed. Default values when using the bundled compose services:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quiz?schema=public"
REDIS_URL="redis://localhost:6379/0"
PORT=3000
```

## Local Development

### Manual setup

```bash
pnpm install
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
pnpm run start:dev
```

Once the dev server starts, open `http://localhost:3000` in your browser (Socket.IO streams from `ws://localhost:3000/leaderboard`).

### Docker workflow

```bash
docker compose up --build
```

Services exposed:

- API on `http://localhost:3000`
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

Stop the stack with `docker compose down`. Add `-v` to drop named volumes when you want a fresh database.

## Database Management

- `pnpm run prisma:generate` – regenerate the Prisma client after schema changes.
- `pnpm run prisma:migrate` – create/apply migrations locally (uses `prisma migrate dev`).
- `pnpm run prisma:seed` – load sample quiz data defined in `prisma/seed.ts`.
- `pnpm exec prisma studio` – open a GUI inspector for the database (optional).

When modifying the schema, create a migration via `pnpm exec prisma migrate dev --name <change>` (or use the `prisma:migrate` script interactively), then regenerate and re-seed as needed.

## Project Structure

```
src
├── app.module.ts            # Root Nest module
├── auth                     # Cookie-backed session guard and constants
├── common                   # Shared infrastructure (Prisma, Redis, utils)
├── leaderboard              # Leaderboard API and websocket gateway
├── quiz                     # Quiz orchestration and DTOs
└── users                    # Internal user store used by the session guard
```

Each feature module follows the `dtos/`, `services/`, and `types.ts` convention with barrel exports for stable imports.

## Contribution Guidelines

- Read `.github/copilot-instructions.md` before changing the module layout or adding new features; it documents the required folder structure and barrel exports for every module.
- Keep shared utilities under `src/common`, exporting them through the existing `index.ts` barrels to avoid import churn.
- Follow the existing DTO validation pattern (`class-validator`, `class-transformer`) when introducing new request/response shapes.

## API Surface

### REST endpoints

| Method  | Path                          | Purpose                                                                                                  |
| ------- | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `POST`  | `/quiz/start`                 | Start a session, returning `sessionId`, first question, and options.                                     |
| `GET`   | `/quiz/:sessionId`            | Fetch the current state for a specific session (score, question payloads).                               |
| `PATCH` | `/quiz/answer`                | Submit an answer; response includes correctness, updated score, and next question or completion payload. |
| `GET`   | `/leaderboard/top?limit=1000` | Read the cached leaderboard for the top N scores (max 1000).                                             |

DTO definitions live under `src/<feature>/dtos` and describe each payload in detail.

### Streaming options

- `GET /leaderboard/stream/top1000` (SSE) – emits an initial leaderboard snapshot followed by push updates; see `LeaderboardSseController`.
- Socket.IO namespace `/leaderboard` – clients receive identical payloads via the `leaderboard/top1000` event; see `LeaderboardGateway`.

### Session management

- Every HTTP request passes through `SessionGuard`, which reads the `365scores_session` cookie (configurable via `STICKY_USER_SESSION_COOKIE`).
- Unknown cookies trigger the creation of a new anonymous user record in PostgreSQL; an HTTP-only cookie is issued with a long-lived identifier.
- Controllers receive the hydrated participant via `request.sessionUser` (see `AuthenticatedRequest` type) and reuse it for quiz operations.

### WebSocket events

- Connect to `ws://localhost:3000/leaderboard` in the `leaderboard` namespace.
- On connection the server emits `leaderboard/top1000` with the latest leaderboard snapshot.
- Additional `leaderboard/top1000` broadcasts are sent whenever a qualifying quiz session completes.

## Testing

Run the full unit suite:

```bash
pnpm run test
```

Watch mode and coverage are available via `pnpm run test:watch` and `pnpm run test:cov`. Add module-specific specs under `src/**/__tests__` or alongside service files using the `.spec.ts` suffix.

## Troubleshooting

- Ensure PostgreSQL and Redis are reachable using the credentials from `.env`.
- If migrations fail, reset the local database (`pnpm exec prisma migrate reset`) and re-seed.
- When Socket.IO clients cannot connect, confirm CORS and namespace configuration in `leaderboard.gateway.ts`.
- For long-running Docker compose sessions, prune volumes to refresh seeded data: `docker compose down -v`.
