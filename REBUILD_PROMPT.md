# Poppy & Charlie Website — Rebuild Requirements

## Project Overview

A marketing/bookings website for Poppy & Charlie, an acoustic duo. Single-page layout with anchor-linked sections. Content is managed via a headless CMS with a web-based admin panel. The previous build used Payload CMS v3 and is being replaced — **CMS choice is open**, but the solution must be containerised and run on Node.js.

---

## Technical Constraints

- **Runtime:** Node.js (containerised)
- **Frontend:** Next.js (App Router, latest stable v15)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (preferred) or any CMS-supported DB that works well in Docker
- **Deployment:** Docker Compose on T3610 dev server (Ubuntu 24.x, IP `192.168.0.23`)
- **CI/CD:** GitHub Actions with a self-hosted runner already installed on T3610
- **Build:** Must build inside Docker on Linux — no cross-platform compilation steps
- **Port:** Host port `3006` (no conflicts with existing containers on T3610)
- **SSL:** Handled externally by nginx-proxy-manager on the local network — app container is HTTP-only
- **Media:** Uploaded images must persist across container restarts via a bind mount

---

## Deployment Architecture

```
GitHub (main branch push)
  → GitHub Actions self-hosted runner on T3610
    → docker compose up -d --build
      → Next.js frontend container (port 3006)
      → CMS / DB container(s)
      → Media bind-mounted from /data/poppyandcharlie/media/
```

- Workflow writes `.env` from GitHub Secrets before building
- No manual deploy steps — push to main = deployed
- Rollback = `git revert` + push, or `git checkout <tag>` + push

### T3610 Server Details

- **Hostname:** `linux01`
- **IP:** `192.168.0.23`
- **SSH user:** `johnadmin` (passwordless sudo, SSH key auth)
- **OS:** Ubuntu 24.x
- **Docker:** `docker compose` (v2, no hyphen) — `docker-compose` v1 NOT installed
- **No need to delete images before rebuild** — `docker compose up --build` picks up changes correctly
- **NVMe for Docker:** `/var/lib/docker` is on a WDC NVMe 469GB; project files and bind mounts are on `/data` (Crucial SATA 440GB)

### Paths on T3610

| Path | Purpose |
|---|---|
| `/data/poppyandcharlie/` | Project root for bind mounts |
| `/data/poppyandcharlie/media/` | Uploaded images (bind-mounted into container) |
| `/data/poppyandcharlie/postgres-data/` | PostgreSQL data directory |

Pre-create these before first run:
```bash
sudo mkdir -p /data/poppyandcharlie/media /data/poppyandcharlie/postgres-data
```

### Existing Containers on T3610 — Do Not Clash

| Container | Host Port |
|---|---|
| gigrequest-frontend-dev | 3000 |
| gigrequest-backend-dev | 3001 |
| gigrequest-db-dev | 5432 |

Use host port **3006** for the Poppy & Charlie app. Internal container ports are free to use any value.

### GitHub Actions Runner

- Runner already installed at `/home/johnadmin/actions-runner/` for other repos
- Register a **new** runner for this repo at `/home/johnadmin/actions-runner-poppyandcharlie/`
- Install as a systemd service so it survives SSH session close:
  ```bash
  sudo ./svc.sh install johnadmin
  sudo ./svc.sh start
  ```
- Runner has passwordless sudo and can run `docker compose` directly

### GitHub Actions Workflow (.github/workflows/deploy.yml)

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      - name: Write .env
        run: |
          cat > .env <<EOF
          DATABASE_URL=${{ secrets.DATABASE_URL }}
          DB_NAME=${{ secrets.DB_NAME }}
          DB_USER=${{ secrets.DB_USER }}
          DB_PASSWORD=${{ secrets.DB_PASSWORD }}
          CMS_SECRET=${{ secrets.CMS_SECRET }}
          NEXT_PUBLIC_APP_URL=${{ secrets.NEXT_PUBLIC_APP_URL }}
          EOF
      - name: Deploy
        run: docker compose up -d --build
```

Adjust secret names to match the chosen CMS's required environment variables.

### Public Access via nginx-proxy-manager

- NPM runs on QNAP NAS (`192.168.0.10`), handles SSL for all apps on the local network
- External port forwards already in place: 80 → NAS:3000 (NPM HTTP), 443 → NAS:3443 (NPM HTTPS)
- No new router port forwards needed
- Add a new proxy rule in NPM: `poppyandcharlie.com` → forward to `192.168.0.23:3006`
  - Use the T3610 IP directly (not a container name) because this is a cross-machine proxy
- SSL terminates at NPM; the app container is HTTP-only inside
- NPM logs at `/data/logs/proxy-host-<N>_error.log` inside the NPM container if debugging is needed

### docker-compose.yml (skeleton — adapt to chosen CMS)

```yaml
services:
  poppyandcharlie:
    build: .
    container_name: poppyandcharlie
    restart: unless-stopped
    ports:
      - "3006:3000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      CMS_SECRET: ${CMS_SECRET}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
    volumes:
      - /data/poppyandcharlie/media:/app/public/media
    depends_on:
      poppyandcharlie-db:
        condition: service_healthy

  poppyandcharlie-db:
    image: postgres:16-alpine
    container_name: poppyandcharlie-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - /data/poppyandcharlie/postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 10
```

If the chosen CMS runs as a separate service, add it here and link them on an internal Docker network.

### Dockerfile (skeleton — adapt to chosen CMS/framework)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
# Copy Next.js standalone output (if using output: 'standalone')
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Build happens inside Docker on T3610 — no cross-platform binary patching needed. Do NOT add a `USER` directive; run as root to avoid bind-mount permission issues.

---

## CMS Requirements (technology-agnostic)

The CMS must provide:

1. **Web-based admin UI** — accessible at `/admin` or similar, password-protected
2. **User authentication** — at minimum email/password login for the admin
3. **Image uploads** with:
   - Focal point selection (stored as X/Y percentage, 0–100)
   - Auto-generated size variants on upload: thumbnail (400×300), card (768×576), hero (1920×1080)
   - Alt text field per image
4. **Rich text editor** — bold, italic, links, bullet lists, numbered lists (standard Lexical/Slate/TipTap or similar)
5. **Collection-based content** — repeatable entries for events, videos, photos
6. **Singleton/global settings** — non-repeatable content like site settings and theme
7. **API or SDK** accessible from Next.js server components (REST, GraphQL, or JS SDK)
8. **Self-hostable** — must run in Docker without an external cloud dependency for the core CMS functionality

---

## Content Model

### Global: Site Settings

| Field | Type | Notes |
|---|---|---|
| `hero.title` | text | Band name displayed in hero |
| `hero.subtitle` | text | Small text above band name (e.g. "Acoustic Duo") |
| `hero.tagline` | text | Tagline below band name |
| `hero.backgroundImage` | image upload | Full-screen hero background |
| `about.title` | text | Section heading |
| `about.text` | rich text | Band bio |
| `about.image` | image upload | Portrait photo with focal point |
| `contact.heading` | text | |
| `contact.subtext` | text | |
| `contact.email` | email | |
| `social.instagram` | text | Full URL |
| `social.youtube` | text | Full URL |
| `social.facebook` | text | Full URL |
| `instagram.beholdWidgetId` | text | Widget ID from behold.so |
| `seo.metaTitle` | text | |
| `seo.metaDescription` | text | |

### Global: Theme Settings

| Field | Type | Options |
|---|---|---|
| `preset` | select | `warm`, `minimal`, `dark`, `forest` |

### Collection: Events

| Field | Type | Notes |
|---|---|---|
| `title` | text (required) | Display name for the gig |
| `date` | datetime | Date and time |
| `venue` | text (required) | Venue name |
| `location` | text | Town/city |
| `ticketUrl` | text | Optional booking link |
| `status` | select | `upcoming` (default), `sold-out`, `cancelled` |
| `notes` | textarea | Optional notes shown on listing |

Default sort: by `date` ascending. Admin list columns: title, date, venue, status.

### Collection: Videos

| Field | Type | Notes |
|---|---|---|
| `title` | text (required) | |
| `youtubeUrl` | text (required) | Full YouTube URL (any format) |
| `description` | textarea | Optional |
| `featured` | boolean | Default true; homepage shows featured only |
| `order` | number | Default 0; controls display order |

Default sort: by `order`.

### Collection: Photos

| Field | Type | Notes |
|---|---|---|
| `title` | text (required) | |
| `image` | image upload (required) | References media library |
| `caption` | text | Shown on hover |
| `order` | number | Default 0 |

Default sort: by `order`.

### Media Library

Central image store. All uploads produce three size variants automatically (thumbnail 400×300, card 768×576, hero 1920×1080). Focal point stored as focalX/focalY (0–100). Alt text required on every upload.

Admin thumbnail in the media list view must be large enough to identify the image without zooming — at minimum ~100px wide. (Previous CMS rendered these at ~40px which was unusable.)

---

## Page Sections (top to bottom, single page)

### 1. Navigation (fixed header)

- Fixed to top of viewport, sits above all sections
- Left: band name (links to `/`)
- Centre: anchor links — About, Videos, Gigs, Gallery, Contact
- Right: Instagram and YouTube icon links (if set in CMS)
- Mobile: hamburger menu replaces centre + right, slides down a full-width menu
- Background: semi-transparent with backdrop blur

### 2. Hero

- Full viewport height
- Background: if a hero image is set, display it full-cover with the focal point controlling `object-position`; overlay with black at 50% opacity
- **Mobile requirement:** hero image must be served at an appropriate compressed size for mobile — do not serve the full-resolution image to mobile devices. Use `next/image` with `fill` and `sizes="100vw"` so Next.js serves WebP at the correct breakpoint. Do NOT use CSS `background-image` with the raw URL, as this bypasses image optimisation.
- If no hero image: show a radial gradient decoration using the theme accent colour
- Text content (centred): subtitle (small caps above), band name (very large heading), tagline (body text below)
- Two CTA buttons: "Book Us" (links to `#contact`) and "Watch & Listen" (links to `#videos`)
- Animated scroll indicator at bottom

### 3. About

- Two-column grid (stacks on mobile): text left, photo right
- Photo appears above text on mobile (`order-first md:order-last`)
- Photo: `next/image` with `fill`, aspect ratio 4:5, focal point via `objectPosition`
- Text: rich text rendered from CMS, wrapped in a `<div className="rich-text">` for CSS targeting
- Placeholder text and placeholder box if no content set

### 4. Videos

- Section id: `videos`
- Grid: 1 col mobile, 2 col sm, 3 col lg
- Each video: embedded YouTube iframe (lazy loaded), title below, optional description
- YouTube URL parsing must handle: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, `youtube.com/embed/`
- Show up to 6 featured videos
- Section hidden if no videos

### 5. Upcoming Gigs

- Section id: `gigs`
- **Section is completely hidden if there are no upcoming events** (future dates, non-cancelled)
- Filter: exclude cancelled status AND exclude past dates at render time
- Each gig row: date block (day number, month, year) | **event title** (h3) with venue + optional location below | time | status badge | optional ticket link
- **The h3 must show the event's `title` field — NOT the venue name.** Venue and location are secondary text on the line below the title.
- Status badge styles: upcoming = accent colour, sold-out = muted, cancelled = red
- Ticket link only shown if status is `upcoming`

### 6. Gallery

- Section id: `gallery`
- Grid: 2 cols mobile, 3 cols md, 4 cols lg
- First photo spans 2 cols × 2 rows (feature image)
- Each photo: square aspect ratio, `next/image` fill with focal point, caption on hover
- Use the `card` size variant URL when available
- Section hidden if no photos

### 7. Instagram Feed

- Section id: `instagram`
- Behold.so embed widget (third-party service)
- Only shown if `beholdWidgetId` is set in CMS
- Widget ID injected via a client-side script — this component must be a client component (`'use client'`)
- Instagram handle hardcoded: `@poppyandcharliemusic`
- Link to `https://www.instagram.com/poppyandcharliemusic/` below heading

### 8. Contact

- Section id: `contact`
- Centred layout, max width 3xl
- Heading, subtext, email as a `mailto:` link (large, styled)
- Social links below: Instagram, YouTube, Facebook (show only those with URLs set)

### 9. Footer

- Copyright line (current year)
- Social links (Instagram, YouTube, Facebook)
- Admin link → `/admin`

---

## Theme System

Four presets selectable from the CMS. The active preset's CSS variables are injected into `:root` on the server render (via a `<style>` tag in the layout) so there is no flash of unstyled content. Tailwind uses these variables via `var()` references.

### CSS Variables per Preset

| Variable | warm | minimal | dark | forest |
|---|---|---|---|---|
| `--color-bg` | `#fdf6ed` | `#ffffff` | `#0f0f0f` | `#f2f5f0` |
| `--color-bg-secondary` | `#f5ead6` | `#f5f5f5` | `#1a1a1a` | `#e5ebe0` |
| `--color-text` | `#2c1810` | `#1a1a1a` | `#f0ece6` | `#1e2d1e` |
| `--color-text-muted` | `#7a5c4a` | `#666666` | `#a0998f` | `#4a634a` |
| `--color-accent` | `#c17d3c` | `#1a1a1a` | `#e8c97e` | `#3d6b47` |
| `--color-accent-hover` | `#a66830` | `#333333` | `#d4b567` | `#2d5237` |
| `--color-border` | `#e8d5c0` | `#e5e5e5` | `#2a2a2a` | `#c8d8c0` |
| `--font-heading` | Playfair Display / Georgia / serif | Inter / system-ui / sans-serif | Cormorant Garamond / Georgia / serif | Merriweather / Georgia / serif |
| `--font-body` | Lato / system-ui / sans-serif | Inter / system-ui / sans-serif | Raleway / system-ui / sans-serif | Open Sans / system-ui / sans-serif |

All fonts loaded from Google Fonts. Tailwind config maps Tailwind colour names (`background`, `surface`, `foreground`, `muted`, `accent`, `border`) to these CSS variables.

---

## Caching / ISR

- Frontend layout and homepage: `revalidate = 60` (ISR, 60-second stale window)
- If DB/CMS is unreachable at build time, the build must still succeed — use try/catch with a "coming soon" fallback for all data fetching
- Content changes visible within ~60 seconds of saving in the CMS without a redeploy

---

## What Was Wrong with the Previous Build (Payload CMS v3)

For reference when evaluating CMS alternatives:

1. **Build non-determinism** — different deploys of the same source produced different webpack bundles; one build worked, the next didn't, with no code changes. Root cause was never definitively identified.
2. **Complex wiring** — Payload v3 required several non-obvious patterns (server function wrappers, factory route handlers, `force-dynamic` on admin layout, CSS import) that were easy to get wrong and broke the admin panel silently.
3. **Admin thumbnail unusable** — the media list view rendered thumbnails at ~40px; there was no straightforward way to fix this without overriding internal Payload admin CSS.
4. **Cross-platform build issues** — building on Windows and deploying Linux containers required manual sharp binary patching. (This is resolved by building inside Docker on the Linux target.)

---

## Bug Fixes Required vs Old Site

These were defects in the previous build that must be correct in the rebuild:

| # | Requirement |
|---|---|
| 1 | Media admin list thumbnails must be large enough to identify images without browser zoom |
| 2 | Hero background image must be optimised for mobile — use `next/image`, not CSS `background-image` with a raw URL |
| 3 | Upcoming gig rows must show the event **title** as the primary heading, with venue/location as secondary text below |

---

## Environment Variables

```
DATABASE_URL=postgresql://...   # or CMS-specific DB connection
CMS_SECRET=...                  # admin secret / JWT secret
NEXT_PUBLIC_APP_URL=https://poppyandcharlie.com
```

Exact variable names will depend on chosen CMS. Store as GitHub Secrets; CI writes `.env` before building.
