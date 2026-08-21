# Content Dashboard

Internal Next.js app for uploading and categorizing content into Sanity, and
for refining the definitions of the 4 content categories. Not the public
site (`web/`) and not Sanity Studio (`studio/`) — this is a separate,
password-gated tool for Aimee.

## Getting started

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the values:

| Variable                 | Notes                                                             |
| ------------------------- | ------------------------------------------------------------------ |
| `SANITY_PROJECT_ID`       | `18kcd13f`                                                        |
| `SANITY_DATASET`          | `production`                                                      |
| `SANITY_API_VERSION`      | e.g. `2026-08-14`                                                 |
| `SANITY_API_WRITE_TOKEN`  | Editor-permission token from sanity.io/manage → API → Tokens      |
| `DASHBOARD_PASSWORD`      | Shared password for logging in                                    |
| `SESSION_SECRET`          | Random string signing the session cookie (e.g. `openssl rand -base64 32`) |

## Routes

- `/login` — password gate
- `/` — the whole dashboard: category cards, per-category quiz triggers, and the
  content log. Everything else happens in modals.

## What lives where

Aimee only ever sees this app. Two things are deliberately **not** exposed here
and are managed in Sanity Studio instead:

- **Category definitions** (`category.definition`) — admin-only.
- **Writing quiz questions** (`category.refinementQA`) — add entries in Studio
  with a `question`, a `questionType` of `open` or `choice`, and `options` for
  choice questions. Anything with an empty `answer` shows up in the dashboard
  as pending; answering it here fills in `answer` and `answeredAt`.

Uploads take one of three sources: a file, a link, or written content (stored as
Portable Text so the site can render it).

## Deployment

Deployed as its own Vercel project (Root Directory: `dashboard`), separate
from the `web/` Astro site. Set the env vars above in the Vercel project
settings.
