# Marvel Quest 🕷️

> Track your complete MCU journey before **Spider-Man: Brand New Day** (July 31, 2026)

A beautiful, mobile-first MCU watch tracker with cross-device sync via Supabase and optional TMDB poster fetching.

---

## Features

- **114 MCU titles** in chronological order (Digital Spy 2026 guide)
- **3 watch paths**: Spider-Man Path (20 titles), Essential MCU (46 titles), Full Completionist (114 titles)
- **Cross-device sync** via Supabase (works fully offline as guest with localStorage)
- **Live countdown** to Spider-Man: Brand New Day
- **Pace calculator** — tells you how many titles/day you need
- **20 achievements** with confetti unlock animations
- **TMDB posters** fetched dynamically (optional — needs `VITE_TMDB_API_KEY`)
- **PWA-ready** — installable on iOS/Android home screen
- **Dark + Light mode** with persistence

---

## Local Setup

```bash
git clone <your-repo-url>
cd marvel-quest
npm install
cp .env.example .env.local
# Edit .env.local with your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Create `.env.local` with:

```env
# Required for cloud sync (get free at https://supabase.com)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional — enables TMDB poster images (free at https://www.themoviedb.org/settings/api)
VITE_TMDB_API_KEY=your-tmdb-api-key
```

> **Note:** The app works **fully without** any env vars in guest mode (localStorage only, gradient placeholders for posters).

---

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Authentication → Providers** and enable:
   - **Google** (add your Google OAuth client ID + secret)
   - **GitHub** (add your GitHub OAuth app credentials)
4. Under **Authentication → URL Configuration** set:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`
5. Copy **Project URL** and **anon public key** from **Settings → API** to your `.env.local`

---

## Vercel Deployment

```bash
npm run build
npx vercel --prod
```

Then in the **Vercel Dashboard → Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |
| `VITE_TMDB_API_KEY` | your TMDB API key (optional) |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Routing | React Router v6 |
| Auth + DB | Supabase |
| Posters | TMDB API (optional) |
| PWA | Custom service worker |
| Confetti | canvas-confetti |
| Deploy | Vercel |

---

## Data Sources

- **Watch order**: Digital Spy MCU Chronological Watch Order Guide (2026)
- **Poster images**: [TMDB](https://www.themoviedb.org/) (optional, requires free API key)
- **Trivia facts**: Curated MCU trivia

*This product uses the TMDB API but is not endorsed or certified by TMDB.*
