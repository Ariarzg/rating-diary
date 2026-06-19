<div align="center">

# Rating Diary

### Rate and journal your experiences across music, games, movies, and books

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-16c784)](https://orm.drizzle.team)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## Features

### Core
- **Category-Specific Rating Sliders** — 7 unique sliders per category (Music, Game, Movie, Book), each with a clear description
- **Search Auto-Fill** — Search Steam, Deezer, TMDB, or Google Books to auto-populate experience details
- **Journal System** — Track how your opinions change over time with revisit entries
- **Image Picker** — Choose from search results, web images (via Cloudflare Worker proxy), or upload your own
- **Full Edit & Delete** — Modify all experience details or remove them entirely

### UI/UX
- **Dark & Light Mode** — Toggle between themes with full theme-aware styling
- **Animated Landing Page** — React-bits GradientText, animated squares, floating particles
- **Responsive Design** — Works beautifully on mobile, tablet, and desktop
- **Shadcn UI Components** — Clean, accessible, and consistent UI primitives
- **Smooth Animations** — Framer Motion page transitions and micro-interactions

### Technical
- **Full-Stack TypeScript** — End-to-end type safety
- **Server & Client Components** — Properly separated for optimal performance
- **Session-Based Auth** — Secure JWT authentication with httpOnly cookies
- **Route Protection** — Middleware-based proxy for authenticated routes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4.3 |
| **UI Components** | Shadcn UI (Base UI) |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Drizzle ORM |
| **Animations** | Framer Motion + React Bits |
| **Package Manager** | Bun |
| **Authentication** | JWT (jose) + bcryptjs |
| **Image Search** | DuckDuckGo via Cloudflare Worker (no API key) |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- A [Neon](https://neon.tech) PostgreSQL database
- (Optional) A [TMDB API key](https://www.themoviedb.org/settings/api) for movie search

### Installation

```bash
# Clone the repository
git clone https://github.com/ariarzg/rating-diary.git
cd rating-diary

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### Database Setup

```bash
# Push schema to database
bun run db:push

# Or generate migrations first
bun run db:generate
bun run db:migrate
```

### Environment Variables

```env
# Required
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"

# Optional (for movie search)
TMDB_API_KEY="your-tmdb-api-key"

# Optional (for image search via Cloudflare Worker)
IMAGE_SEARCH_PROXY_URL="https://your-worker-name.workers.dev"
```

### Run

```bash
# Development
bun run dev

# Production
bun run build
bun run start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

```
rating-diary/
├── cloudflare-worker/             # Cloudflare Worker for image search proxy
│   ├── index.js                   # Worker code
│   └── README.md                  # Worker setup instructions
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── auth/               # Authentication endpoints
│   │   │   ├── experiences/        # CRUD for experiences
│   │   │   ├── search/             # External API integrations
│   │   │   └── upload/             # File upload handler
│   │   ├── auth/                   # Sign-in / Sign-up pages
│   │   ├── experiences/            # Experience pages
│   │   └── globals.css             # Theme variables
│   ├── components/
│   │   ├── animations/             # Squares, Particles, GlowCard
│   │   ├── auth/                   # Auth forms & buttons
│   │   └── ui/                     # Shadcn UI primitives
│   ├── db/
│   │   ├── index.ts                # Database connection
│   │   └── schema.ts               # Drizzle schema
│   ├── lib/
│   │   ├── auth.ts                 # JWT utilities
│   │   ├── categories.ts           # Category configs & sliders
│   │   ├── icons.tsx               # SVG icons & RatingStars
│   │   └── utils.ts                # Utility functions
│   └── proxy.ts                    # Route protection middleware
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Create account |
| `POST` | `/api/auth/signin` | Sign in |
| `POST` | `/api/auth/signout` | Sign out |
| `GET` | `/api/experiences` | List all experiences |
| `POST` | `/api/experiences` | Create experience |
| `GET` | `/api/experiences/[slug]` | Get experience details |
| `PATCH` | `/api/experiences/[slug]` | Update experience |
| `DELETE` | `/api/experiences/[slug]` | Delete experience |
| `POST` | `/api/experiences/[slug]/revisit` | Add revisit entry |
| `GET` | `/api/search/game` | Search Steam games |
| `GET` | `/api/search/music` | Search Deezer music |
| `GET` | `/api/search/movie` | Search TMDB movies |
| `GET` | `/api/search/book` | Search Google Books |
| `GET` | `/api/search/images/duckduckgo` | Search web images |
| `POST` | `/api/upload` | Upload image file |

---

## Rating Sliders

Each category has 7 unique rating dimensions:

### Music
| Slider | Description |
|--------|-------------|
| Rhythm | How infectious and well-crafted the beat and tempo feel |
| Lyrics | Depth, meaning, and poetic quality of the words |
| Vocals | Vocal range, emotion, and delivery quality |
| Production | Sound mixing, mastering, and overall audio quality |
| Mood | How well it sets and maintains the intended emotional tone |
| Replayability | How often you want to listen to it again |
| Originality | How unique and innovative it sounds compared to others |

### Game
| Slider | Description |
|--------|-------------|
| Gameplay | Core mechanics, controls, and how fun it is to play |
| Story | Narrative depth, plot twists, and storytelling quality |
| Graphics | Visual fidelity, art style, and aesthetic appeal |
| Sound Design | Sound effects, ambient audio, and audio feedback |
| Replayability | How much value you get from playing it again |
| Immersion | How well it pulls you into its world |
| Polish | Bug-free experience, UI/UX quality, and attention to detail |

### Movie
| Slider | Description |
|--------|-------------|
| Plot | Story structure, pacing, and narrative coherence |
| Acting | Performances, emotional range, and believability |
| Cinematography | Camera work, lighting, and visual composition |
| Soundtrack | Music score, sound effects, and audio atmosphere |
| Rewatchability | How much you enjoy watching it again |
| Dialogue | Writing quality, wit, and natural conversation flow |
| Direction | Overall vision, scene composition, and creative choices |

### Book
| Slider | Description |
|--------|-------------|
| Plot | Story arc, pacing, and how engaging the narrative is |
| Writing Style | Prose quality, voice, and literary craftsmanship |
| Characters | Depth, development, and relatability of characters |
| World-building | Setting richness, lore, and immersive detail |
| Re-readability | How much you gain from reading it again |
| Themes | Depth of ideas, messages, and intellectual stimulation |
| Pacing | How well the story flows and maintains momentum |

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with Next.js, Drizzle, and Neon

</div>
