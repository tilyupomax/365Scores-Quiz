# Copilot Instructions

## Purpose

These guidelines help GitHub Copilot align code suggestions with the conventions and architecture of this project. Follow them when generating, editing, or refactoring code.

## Ground Rules

- Obey the existing ESLint (`eslint.config.mjs`) and Prettier configurations; suggestions must lint and format cleanly.
- Write TypeScript-first code. Avoid `any`, prefer discriminated unions or generics, and keep types in sync with runtime behaviour.
- Keep React components small, focused, and typed via explicit props interfaces or type aliases.
- Default to server components in the Next.js App Router. Only mark files with `"use client"` when client-side hooks or browser-only APIs are required.
- Use descriptive naming, prefer immutable patterns, and never introduce side effects during module evaluation.
- Name page-level components with a `Page` suffix (e.g., `QuizPage`).
- Preserve the established import order: types, builtins, externals, internals (`@/*`), then relative paths.
- Create `index.ts` barrels to re-export public APIs for each folder and subfolder so imports stay stable and scoped.
- Treat `src/config/routes.ts` as the single source of truth for paths. Keep each entry in the `{ value: string, ...subroutes }` shape and update it whenever a page is added or a route path changes.

## Project Layout

```
.
├── public/                         # Static assets served as-is
└── src/
    ├── app/                        # App Router entry points and route segments
    │   ├── globals.css             # Global Tailwind layer and resets
    │   ├── layout.tsx              # Root layout; wraps pages with shared providers
    │   └── (route folders/_components/<name>Client.tsx(if needed), _hooks, route folders)
    ├── components/
    │   ├── index.ts                # Shared components barrel
    │   ├── ui/                     # shadcn base primitives; keep close to upstream API
    │   ├── layout/                 # Cross-cutting layout primitives (headers, navigation)
    │   └── <shared-name>/          # Cross-feature building blocks exposed via barrel
    ├── features/
    │   ├── index.ts                # Barrel for feature domains
    │   └── <domain>/
    │       ├── index.ts            # Barrel for the domain surface
    │       ├── components/         # Domain-specific UI composed from ui primitives
    │       ├── hooks/              # Domain hooks (state mgmt, derived data); React Query hooks stay under api/queries
    │       ├── types/              # Domain DTOs, input params, discriminated unions
    │       └── utils/              # Domain-only helpers; re-export from barrel files
    ├── hooks/                      # App-wide hooks that are not domain-specific
    ├── lib/
    │   ├── query/
    │   │   └── keys.ts             # Central query key factories shared (just logic) across features
    │   └── utils.ts                # Shared helpers (e.g., `cn`, Tailwind class merger)
    ├── providers/                  # Composition root for global providers
    ├── services/                   # Client or server integrations (HTTP, analytics)
    ├── stores/                     # State management (e.g., Zustand) scoped by feature, only here
    ├── styles/                     # Tailwind layers or global CSS modules (rare)
    ├── types/                      # Shared TypeScript types and schemas
    ├── config/                     # Runtime configuration, constants, feature flags
    └── api/                        # Cross-feature API layer
        ├── index.ts                # Barrel for all API entities
        └── <entity>/
            ├── index.ts            # Barrel for the entity API surface
            ├── queries/            # TanStack queries, only hooks. Inside hooks call the fetchers from the api class and can create transformers
            │   └── index.ts        # Barrel for query exports
            ├── mutations/          # TanStack mutations, only hooks. Inside hooks call the fetchers from the api class and can create transformers
            │   └── index.ts        # Barrel for mutation exports
            ├── <entity>.api.ts     # Class with all requests to API, use axios inside class. Exposes methods for queries and mutations
            └── <entity>.keys.ts    # Query and mutation keys for the entity
```

Within each feature directory, expose only the public API from an `index.ts` barrel to keep boundaries explicit. When a concern grows, prefer new top-level buckets under `src/` over nesting deeply inside unrelated modules.

## Shared Components & Cross-Feature Queries

- House reusable, cross-feature UI in `src/components`; primitives stay under `src/components/ui`, layout shells under `src/components/layout`, and other building blocks get their own folders with an `index.ts` barrel.
- Keep feature-scoped UI within `src/features/<feature>/components` and re-export it via that folder's `index.ts`. If a component graduates to cross-feature use, move it into `src/components/<name>` and expose it through the shared barrel.
- Place shared TanStack Query helpers in `src/lib/query/keys.ts`, and scope entity-specific fetchers, hooks, and transformers to `src/api/<entity>`.
- For network logic reused by several features, create neutral modules under `src/api`, and expose their public surface through the local `<entity>.api.ts` barrel.
- Always funnel imports through the relevant barrel file (e.g., `src/components/index.ts`, `src/api/<entity>/<entity>.api.ts`) to avoid tight coupling between features.

## TanStack Query Structure

- Domain-specific API logic lives in `src/api/<entity>`, with `queries/` for fetchers and hooks, `mutations/` for mutation helpers, and `transformers/` for DTO mapping.
- Parse and validate server responses alongside the fetcher (e.g., `transformers/parse-response.ts`) and return typed DTOs before exposing the hook.
- Re-export each entity surface from `<entity>.api.ts`, combining queries, mutations, keys, and any shared transformers.
- Gather domain DTOs, input types, and discriminated unions under `src/features/<domain>/types` and re-export them from that folder's barrel.

## Key Packages & How To Use Them

- **Next.js 16** (`next`, `react`, `react-dom`): Build routes under `src/app`. Prefer server actions/data loading where possible.
- **@tanstack/react-query 5**: Use for client-side data fetching and caching. Call hooks within components wrapped by `TanstackQueryProvider`. Configure query keys under `/lib` if they are shared.
- **Tailwind CSS 4 & Geist fonts**: Compose utility classes in JSX. When combining classes, import and use the `cn` helper from `src/lib/utils` to dedupe Tailwind styles.
- **shadcn/ui**: Keep generated primitives under `src/components/ui`. Avoid editing upstream files unless syncing with the shadcn generator; layer project-specific variants by composing these primitives in feature components.
- **class-variance-authority + tailwind-merge + clsx**: Build variant-based styling APIs. Define variant utilities in `/lib` or dedicated component folders.
- **lucide-react**: Use for iconography. Tree-shake by importing only the icons you need.
- **babel-plugin-react-compiler**: Keep components pure (no impure side effects) to benefit from React Compiler optimizations.

## Coding Best Practices

- colocate UI with logic: create feature-specific subfolders (e.g., `src/features/scores/components/...`). Export public APIs via index files to control boundaries.
- Derive client components carefully: when a component uses `useState`, `useEffect`, context hooks, or browser APIs, include `"use client"` at the top.
- Data fetching: prefer server components + async/`fetch` for static/SSR use cases; use React Query only for interactive client data. Keep query keys typed and extracted to constants.
- Styling: rely on Tailwind primitives; avoid bespoke CSS unless necessary. Place shared styles in `globals.css` or create component-scoped class names via Tailwind `@layer`.
- shadcn primitives stay in `src/components/ui`; extend them via wrappers or variants rather than mutating the originals. Keep animations, tokens, and shared state colocated with the wrapping component.
- Forms and mutations: prefer React Query `useMutation` with optimistic updates when UX requires it. Handle errors via toasts/snackbars (stubbed until UI library is selected).
- Accessibility: follow `eslint-plugin-jsx-a11y` recommendations. Always include `alt` text, `aria` attributes, and semantic markup.
- Error handling: bubble fatal errors to error boundaries; surface recoverable errors with user-facing messaging.
- Testing (when introduced): co-locate tests next to the implementation (`component.test.tsx`, `hook.test.ts`). Ensure stories or tests mock React Query providers when required.

## Tooling Workflow

- Run `npm run dev` for local development.
- Use `npm run lint` and `npm run format:write` before committing.
- Keep dependencies in `package.json` synchronized; document significant upgrades in `README.md`.

Adhering to these instructions ensures Copilot contributes code that fits the project architecture and coding standards.
