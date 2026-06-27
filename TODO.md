# TODO

## Bug Fix

- **Search API routes have no authentication** — `/api/search/*` endpoints don't check sessions. External bots can burn API quotas on Deezer, Steam, TMDB, Google Books. Add `getSession()` checks returning 401.
- **No rate limiting on sign-in** — Unlimited login attempts enable brute-force. Add throttling via middleware or per-IP/email counter.
- **Only the app should access API** — API routes have no origin/CORS restrictions. External sites could call your endpoints. Restrict to same-origin or add API key validation.
- **More security** — General hardening: CSP headers, CSRF protection, secure cookie defaults, input sanitization across API routes.
- **Missing unique constraint on `(experienceId, sliderKey)`** — Double-submit can insert duplicate rating rows, inflating `averageScore`. Add composite unique index.
- **No DB CHECK constraint on rating values** — Revisit route doesn't validate ratings are 1-5. Add `CHECK (value >= 1 AND value <= 5)`.
- **Upload filename extension from user input** — Extension taken from `file.name` instead of MIME type. Map MIME types to safe extensions.
- **`next: { revalidate }` has no effect in API routes** — Steam search uses this but it only works in Server Components. Use manual caching or move to Server Component.
- **Category filter overflow on mobile** — On `/experiences`, the category filter buttons (All, Music, Game, Movie, Series, Book) wrap poorly on mobile. Series goes to a new row alone. Fix layout to center the last row or adjust button sizing.
- **Add "Back to Experiences" button in category selection** — On `/experiences/new`, the first step (category selection) has no way to go back to the experiences list. Add a back button.
- **Add "Back to Category Selection" in details step** — On `/experiences/new`, the second step (details form) only has a "Back" button that goes to category selection. Verify it works and improve UX if needed.

## Refactor

- **Caching** — Search results (Steam, Deezer, TMDB, Google Books) hit external APIs on every request. Add response caching (in-memory TTL, Redis, or Next.js `unstable_cache`).
- **Cleaner code, refactoring** — General code quality pass: extract duplicated patterns, simplify complex components, improve type safety.
- **Missing indexes on foreign key columns** — `experiences.userId`, `ratings.experienceId`, `revisits.experienceId`, `revisitRatings.revisitId`, `images.experienceId` have no indexes. Add via Drizzle `index()`.
- **`categoryGradients` defined in 3 places** — Identical gradient maps in `experiences/page.tsx`, `[slug]/page.tsx`, and `image-picker.tsx`. Centralize in `src/lib/categories.ts`.
- **Update CI/CD** — Improve GitHub Actions workflow: add linting step, add type checking, add build verification before deploy.

## Feature

- **Adding series to category** — Done ✓
- **Musics with lyrics** — Show song lyrics alongside ratings. Could fetch from a lyrics API (e.g., LRCLIB, Musixmatch).
- **Add photos for your experience** — Allow multiple photos per experience (e.g., cinema photos for movies, screenshots for games, cover variants for books). Extend the `images` table and image picker to support galleries.
- **AI daily suggestions** — Once per day, users get a personalized recommendation based on their rating history. Analyze high-rated experiences to find patterns (favorite genres, directors, eras, moods), then suggest similar content they haven't logged yet. Could use an LLM API or a simpler collaborative filtering approach. Store the suggestion in a `daily_suggestions` table with a `suggested_at` timestamp to enforce the once-per-day limit. Show it on the dashboard or as a notification.

## Potential Feature

- **"Experience Later" section** — A separate watchlist-like section in the app where users can save experiences they want to rate later (e.g., movies to watch, books to read, games to play). Users can add items from search results with minimal details. When they later experience something from this list, they rate it directly from the "Experience Later" page, and it automatically transfers to the main experiences section with full ratings. Requires new DB table, new page/route, and a "transfer" action that creates the experience entry and removes from the watchlist.
