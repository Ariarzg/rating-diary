<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Rules

- **NEVER commit or push code without explicit user approval.** Always wait for the user to say so before running `git commit` or `git push`.

## Commands

```bash
bun run dev          # Start dev server (localhost:3000)
bun run build        # Production build
bun run lint         # ESLint (flat config)
bun run db:push      # Push schema to Neon DB (fastest for dev)
bun run db:generate  # Generate Drizzle migrations
bun run db:migrate   # Apply Drizzle migrations
bun run db:studio    # Open Drizzle Studio
```

No `typecheck` or `test` scripts exist. Run `npx tsc --noEmit` for type checking. No test suite is configured.

## Stack

- **Next.js 16** (App Router), React 19, TypeScript 5
- **Tailwind CSS 4** with `@tailwindcss/postcss`
- **Shadcn UI** — style: `base-nova`, component library: `@base-ui/react`, icons: `lucide-react`
- **Drizzle ORM** → PostgreSQL via `@neondatabase/serverless`
- **Auth**: JWT (`jose`) + `bcryptjs`, httpOnly cookie named `session`
- **Package manager**: Bun (lockfile: `bun.lock`)
- **Animations**: Framer Motion (`motion`)

## Architecture

- `src/app/` — App Router pages and API routes
- `src/components/ui/` — Shadcn primitives (generated, do not hand-edit)
- `src/db/schema.ts` — Drizzle schema (single source of truth for DB)
- `src/db/index.ts` — Neon connection + drizzle instance
- `src/lib/auth.ts` — JWT create/verify, session helpers
- `src/lib/categories.ts` — Category slider definitions (music/game/movie/series/book)
- `src/proxy.ts` — Route protection logic (currently **not wired as middleware**; file exists but no `middleware.ts` imports it)
- `cloudflare-worker/` — Standalone Cloudflare Worker for image search proxy (separate deploy)

## Gotchas

- **Tailwind v4**: Uses `@import "tailwindcss"` and `@theme inline` blocks in `globals.css`. No `tailwind.config.*` file — config is CSS-first.
- **Path alias**: `@/*` → `src/*`
- **Schema path**: `drizzle.config.ts` points to `./src/db/schema.ts`; migrations output to `./drizzle/`
- **No `.env.example`**: Required env vars are `DATABASE_URL`, `JWT_SECRET`. Optional: `TMDB_API_KEY`, `IMAGE_SEARCH_PROXY_URL`.
- **File uploads**: Saved to `public/uploads/` (gitignored). Upload API enforces 5MB max, image types only.
- **Slugs**: Generated server-side as `name-slug-{uuid8}` — do not trust URL slugs for uniqueness without the UUID suffix.
- **Rating values**: Must be integers 1–5 (enforced in API).
- **DB push vs migrate**: Use `db:push` for quick schema dev (no migration files). Use `db:generate` + `db:migrate` for production-safe migrations.

## Conventions

- Server components by default; add `"use client"` only when needed
- API routes live under `src/app/api/` — all require JWT auth except signup/signin/signout
- Shadcn components are in `src/components/ui/` — add new ones via `npx shadcn@latest add <component>`
- Use `cn()` from `@/lib/utils` for conditional class merging

## Project Workflow

### Git Branches
- `main` — Production. Merges trigger production deployment on Vercel.
- `develop` — Development. Pushes trigger preview deployments on Vercel.

### Branching Workflow
1. Work on `develop`
2. Push to `develop` → Vercel auto-deploys a preview URL
3. Test on preview → confirm changes work in isolation
4. Merge `develop` into `main` → Vercel deploys to production

### Schema Migrations (Automated)
`vercel.json` build command runs `db:generate && db:migrate` before `next build`. Every deploy (production and preview) auto-applies pending schema changes. No manual migration step needed.
- For local dev: use `bun run db:push` (fastest, no migration files)
- For production-safe flow: `bun run db:generate` + `bun run db:migrate`

### Neon Database Branching
- **Neon Project:** rating-diary (`soft-firefly-87539645`)
- **Production branch:** `production` (main Postgres database)
- **Preview branches:** Auto-created by Vercel + Neon integration for each preview deployment
- Preview deployments get their own isolated database branch automatically

### Vercel Environment Variables
**Production scope** (main branch):
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Production Neon connection string |
| `JWT_SECRET` | Production secret |
| `TMDB_API_KEY` | Your TMDB key |
| `IMAGE_SEARCH_PROXY_URL` | `https://image-search-proxy.ariarzg.workers.dev` |

**Preview scope** (develop + PRs):
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Auto-provisioned by Neon integration (do NOT set manually) |
| `JWT_SECRET` | Development secret (must differ from prod) |
| `TMDB_API_KEY` | Same as production |
| `IMAGE_SEARCH_PROXY_URL` | Same as production |

### Proxy/Route Protection
Route protection is handled in `src/proxy.ts` (not `middleware.ts`):
- `/` → Redirects to `/experiences` if signed in
- `/experiences/*` → Requires auth, redirects to `/auth/signin` if not
- `/auth/*` → Redirects to `/experiences` if already signed in

### Cloudflare Worker
The DuckDuckGo image search proxy runs as a Cloudflare Worker (`cloudflare-worker/`):
- Production: `https://image-search-proxy.ariarzg.workers.dev`
- Source: `cloudflare-worker/index.js`
