# FIFA World Cup 2026 — Predict & Win

A web app for a "Predict & Win" contest around the FIFA World Cup 2026. Visitors
predict the tournament winners and individual award winners, register with their
contact details, and submit. An admin enters the real results after the
tournament, the app scores every submission, ranks participants, and publishes a
public leaderboard.

There is **no traditional database**. A Google Sheet (driven by a Google Apps
Script Web App) is the data store. The Next.js app talks to it over HTTPS with a
shared secret. This keeps hosting free/cheap and lets a non-technical organiser
read and edit submissions directly in the Sheet.

---

## Stack

| Layer            | Choice                                                        |
| ---------------- | ------------------------------------------------------------ |
| Framework        | Next.js `16.2.9` (App Router, React Server Components)        |
| UI               | React `19.2.4`, Tailwind CSS `v4` (`@tailwindcss/postcss`)   |
| Language         | TypeScript (`strict`)                                         |
| Data store       | Google Sheet via a Google Apps Script Web App                |
| Email            | Nodemailer over Gmail SMTP (app password)                    |
| Excel export     | `exceljs`                                                     |
| Toasts / loaders | `sonner`, `lottie-web`                                        |
| Package manager  | pnpm (`pnpm-lock.yaml` is committed)                          |

> **Note on Next.js version:** this is Next 16, which has breaking changes vs.
> older versions. The biggest one visible here: **middleware is `proxy.ts` at the
> project root and exports a `proxy()` function** (the old `middleware.ts` /
> `middleware()` convention is gone). See `AGENTS.md`.

---

## How it works (architecture)

```
                          ┌──────────────────────────────┐
   Browser  ──────────►   │  Next.js app (App Router)    │
   (public + admin)       │  - pages / RSC               │
                          │  - /api/* route handlers     │
                          │  - proxy.ts (admin auth gate)│
                          └───────────────┬──────────────┘
                                          │  POST { secret, action, payload }
                                          ▼
                          ┌──────────────────────────────┐
                          │  Google Apps Script Web App  │
                          │  (apps-script/Code.gs)       │
                          └───────────────┬──────────────┘
                                          ▼
                          ┌──────────────────────────────┐
                          │  Google Sheet (3 tabs)       │
                          │  Predictions / Config /Actuals│
                          └──────────────────────────────┘
```

Everything server-side that touches data goes through `lib/appsScript.ts`, which
POSTs `{ secret, action, payload }` to the Web App. The Apps Script
(`apps-script/Code.gs`) authorises on the shared secret and dispatches on
`action`. The Sheet has three tabs, all created automatically on first use:

- **`Predictions`** — one row per submission (see `SHEET_HEADERS` in `lib/fields.ts`).
- **`Config`** — app settings as `Key`/`Value` rows (registration open/closed,
  results published, banner messages). Managed from the admin UI.
- **`Actuals`** — the real tournament results, stored as `Key`/`Value` so they
  survive reloads and power re-scoring.

### The submit path is atomic

`POST /api/predict` makes **one** Apps Script call: the `submit` action runs the
registration gate + duplicate check (mobile, then email) + ID generation + row
append inside a `LockService` lock. One round-trip instead of read-then-write,
and the lock closes the duplicate race when two people submit at once. See
`submitPrediction()` in `Code.gs` and `submitPredictionAtomic()` in
`lib/appsScript.ts`.

Submission IDs look like `FWC26-12345` (random 5-digit, collision-checked).

### Confirmation email is fire-and-forget

After the submission is saved, the confirmation email is sent via Next's
`after()` hook **after the HTTP response is returned**, so the ~2–4s SMTP
handshake never delays the user's success screen. Email is strictly optional: if
`AUTH_SMTP_EMAIL` / `AUTH_SMTP_APP_PASSWORD` aren't set, sending no-ops; a mail
failure can never fail an already-saved submission. See `app/api/predict/route.ts`
and `lib/email.ts` / `lib/emailTemplate.ts`.

### Caching

Apps Script round-trips are slow (~seconds), so reads that don't need to be
live are cached with `unstable_cache`:

- Public config — `lib/serverConfig.ts`, `revalidate: 120s`, tag `app-config`.
- Public results list — `app/api/results/route.ts`, `revalidate: 60s`, PII stripped.

The registration **gate** is always read fresh inside the `submit` action, so
closing registration takes effect immediately even while cached UI is stale.

---

## Scoring

Defined in `lib/scoring.ts`. There are 9 prediction fields. Points:

| Prediction                                                   | Points |
| ------------------------------------------------------------ | ------ |
| `World_Cup_Winner`                                           | 2      |
| `Golden_Ball`                                                | 2      |
| `Runner_Up`, `Third_Place`, `Fair_Play_Award`, `Golden_Boot`,`Most_Assists`, `Golden_Glove`, `Best_Young_Player` | 1 each |

Maximum score is **11**. Matching is case-insensitive and trim-insensitive.

**Tiebreakers** (in order): `Total_Score` DESC → correct World Cup Winner →
correct Golden Ball → earliest `Timestamp`.

---

## Routes

### Public pages

| Path                | What it is                                                   |
| ------------------- | ----------------------------------------------------------- |
| `/`                 | Landing / welcome screen                                     |
| `/prediction`       | Multi-step prediction wizard (register → 9 picks → preview → submit) |
| `/results`          | Public leaderboard (only after admin publishes; no PII)      |
| `/teams`            | All 48 qualified teams                                       |
| `/teams/[teamId]`   | A team's squad (players grouped by position) + manager       |

A protected admin area (behind authentication) handles event controls, entering
actual results, scoring/ranking, the leaderboard, and Excel export. Its routes
are intentionally not documented here.

### Public API route handlers (`app/api/...`)

| Route                  | Method | Purpose                                               |
| ---------------------- | ------ | ----------------------------------------------------- |
| `/api/predict`         | POST   | Atomic submit (gate + dedup + save), then async email |
| `/api/check-duplicate` | POST   | Pre-submit mobile/email duplicate check               |
| `/api/config`          | GET    | Public config (registration/results state + messages) |
| `/api/results`         | GET    | Public leaderboard (cached, PII stripped)             |

---

## Data files & FIFA data

Team and squad data is **pre-fetched and committed** so the app doesn't depend on
FIFA's APIs at request time for the prediction options:

- `data/teams.json` — 48 teams.
- `data/squads.json` — 48 squads, ~1,248 players.

`lib/predictionOptions.ts` builds the wizard's selectable team/player lists from
these files. Players with names duplicated across squads (e.g. two
"Emiliano Martinez") get the team name appended so selections stay unambiguous.

To refresh squads, run the standalone fetch script (hits `api.fifa.com`, 5s delay
between teams):

```bash
node squad-fetch.js   # reads data/teams.json, writes data/squads.json
```

`lib/teams.ts` also fetches live from FIFA endpoints (with ISR `revalidate`) for
the `/teams` pages.

---

## Getting started

### 1. Prerequisites

- Node.js 18+ and pnpm.
- A Google account (for the Sheet + Apps Script backend).

### 2. Set up the backend

Follow **`apps-script/DEPLOY.md`** end to end. Summary:

1. Create a Google Sheet, open **Extensions → Apps Script**.
2. Paste `apps-script/Code.gs`.
3. Add a Script Property `SHARED_SECRET` (a long random string).
4. Deploy as a **Web App** (Execute as *Me*, access *Anyone*). Copy the URL.

> If you upgrade an existing deployment, you must deploy a **new version** for
> code changes (including the `submit` action) to take effect.

### 3. Configure env

Copy `.env.example` to `.env.local` and fill in the values. The required keys (and
inline notes on each) are documented in `.env.example` — refer to that file.

### 4. Run

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint`.

---

## Running the contest (admin flow)

1. **Before / during:** sign in to the admin dashboard. Registration is **open**
   by default. Use **Event Controls** to close it when the window ends (the closed
   banner message is configurable).
2. **After the tournament:** in the admin, enter the **actual** winners/award
   results and hit **Calculate**. This scores and ranks every submission and
   writes back to the Sheet, and saves the actuals so they persist.
3. **Publish:** toggle results published. `/results` now shows the public
   leaderboard (no mobile numbers or emails — ever).
4. **Export:** download all submissions as Excel any time.

Sensible safe defaults: if the `Config` tab can't be read, registration is
treated as **open** and results as **not published**.

---

## Project layout

```
app/                 # App Router pages + API route handlers
  api/               # predict, results, config, admin/*
  admin/             # admin dashboard + login
  prediction/        # prediction wizard page
  results/           # public leaderboard page
  teams/             # teams list + [teamId] squad pages
components/           # UI (wizard steps, cards, admin dashboard, nav, etc.)
lib/
  appsScript.ts      # the single client to the Apps Script backend
  fields.ts          # Submission shape + sheet headers (source of truth)
  scoring.ts         # points + tiebreakers
  config.ts          # Config-tab keys + parsing
  serverConfig.ts    # cached public config (crash-safe)
  validation.ts      # email/mobile regex, dedup, ID generation
  adminAuth.ts       # stateless session token helpers
  email.ts           # nodemailer transporter
  emailTemplate.ts   # confirmation email HTML
  teams.ts           # FIFA fetch helpers + flag/image URL builders
  predictionOptions.ts # builds team/player option lists from data/
data/                # teams.json, squads.json (pre-fetched FIFA data)
apps-script/         # Code.gs backend + DEPLOY.md
proxy.ts             # admin auth gate (Next 16 "middleware")
squad-fetch.js       # one-off script to regenerate data/squads.json
```

---

## Gotchas

- **`@/*` path alias** maps to the project root (`tsconfig.json`), so
  `@/lib/...`, `@/components/...`, `@/data/...`.
- **Mobile numbers are India-only** by validation: `MOBILE_REGEX` is
  `^\+91[6-9]\d{9}$` (`lib/validation.ts`). Change this if your audience differs.
- **`SHEET_HEADERS` is duplicated** in `lib/fields.ts` (TS) and
  `apps-script/Code.gs` (GAS). They must stay in sync — same for the prediction
  field list and the dedup/ID logic.
- **Text columns** (`Submission_ID`, `Mobile_Number`) are force-formatted as text
  in the Sheet so a leading `+` isn't dropped by auto-number conversion.
- Editing `Code.gs` requires deploying a **new version** in Apps Script before it
  takes effect.
```
