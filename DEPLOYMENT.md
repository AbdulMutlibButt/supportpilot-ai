# Vercel public portfolio deployment

SupportPilot has two intentionally separate modes. Local full mode keeps PostgreSQL, private local storage, and Ollama at `127.0.0.1`; it supports local RAG and citations. Vercel production must use public portfolio mode, which is backed only by non-private seed data and deterministic mock AI.

## Import and configure

1. Import the GitHub repository in Vercel and select the Next.js framework preset. No `vercel.json` is required.
2. Create or select a hosted PostgreSQL database (for example, a free hosted PostgreSQL offering). Do not use a local database URL.
3. Add these **Production** environment-variable names in Vercel. Never place values in source control.

| Name | Required value or purpose |
| --- | --- |
| `DATABASE_URL` | Hosted PostgreSQL connection URL |
| `APP_BASE_URL` | The final HTTPS public URL, with no path |
| `APP_MODE` | `public-demo` |
| `AI_PROVIDER` | `mock` |
| `ALLOW_MOCK_AI` | `true` |
| `SESSION_COOKIE_NAME` | Optional cookie name |
| `EMAIL_PROVIDER` | Optional; only `development-outbox` is permitted |

Do **not** configure `OLLAMA_*`, `LOCAL_STORAGE_ROOT`, private upload/storage variables, payment credentials, or external email-provider credentials in public mode. Startup validation rejects these combinations without printing their values. Public mode hides and server-rejects private uploads, uses mock AI, shows demonstration labels, and uses demonstration billing and the database-backed development email preview only. It collects no card data.

Use `npm ci` as the Vercel install command and `npm run build` as the build command. `postinstall` runs `prisma generate` so the generated client is present on Vercel. `DATABASE_URL` must be configured during install/build because Prisma configuration reads it, but the database does not need to be reachable for the build: the application does not query it at build time. A reachable hosted database is required for migrations, seeding, and runtime requests.

## Migrate and seed safely

Run migrations from a trusted administrator environment with the same hosted `DATABASE_URL` configured:

```sh
npm ci
npm run db:deploy
```

`db:deploy` runs `prisma migrate deploy`; never run `prisma migrate dev`, `prisma db push`, or any reset command against production.

Portfolio seeding is explicit and idempotent. It upserts only the documented non-private Northstar demonstration workspace, users, conversations, articles, and chatbot configuration; it does not reset or delete the database. Set these temporary variables only for the seed operation, then remove them from the shell:

```sh
NODE_ENV=production VERCEL_ENV=production APP_MODE=public-demo AI_PROVIDER=mock ALLOW_MOCK_AI=true APP_BASE_URL=https://your-domain.example DATABASE_URL=... SEED_PASSWORD=... SEED_CONFIRMATION=SEED_NON_PRIVATE_PORTFOLIO_DATA npm run db:seed:portfolio
```

Use PowerShell syntax on Windows when needed. Treat `SEED_PASSWORD` as a secret; do not save it in Vercel unless a deliberate future reseed is required.

## Compatibility and operating notes

Vercel route handlers use standard Web streaming for chatbot responses. Public mode never calls Ollama and does not use the local filesystem; local uploads remain a local-full capability only. The in-memory burst limiter is best-effort per serverless instance; database-backed plan and workspace checks remain enforced server-side. Cookie settings include `Secure` in production, `HttpOnly`, and `SameSite=Lax`.

The mock provider demonstrates grounded-answer UI and citations but is not a substitute for local Ollama. Local Ollama must remain bound to `127.0.0.1` and must never be tunneled or exposed publicly.

## Rollback and post-deployment checks

To roll back application code, redeploy a previous known-good Git commit in Vercel. Prisma migrations are forward-only: restore data through the hosted provider’s backup tools or ship a corrective migration; never reset the production database.

After deployment, verify:

- `/` displays public portfolio messaging.
- `/register` states that registration is disabled.
- `/dashboard/knowledge` labels uploads as disabled and upload requests are rejected.
- `/api/health` reports public-demo and mock-AI health without configuration values.
- The public chatbot streams a mock answer with citations.
- Billing is visibly demonstration-only and email links are development previews.
- Browser bundles contain no Ollama URL, local storage path, private document text, or database URL.

No Vercel project, hosted database, or deployment is created by this repository setup.

## Isolated local PostgreSQL verification

For stable local verification, Docker Compose defines a separate PostgreSQL 16 service in `docker-compose.yml`. Copy `.env.docker.example` to the ignored `.env.docker.local`, choose a local-only password, and run:

```sh
docker compose --env-file .env.docker.local up -d
```

Create an ignored `.env.test.docker.local` with the matching `DATABASE_URL`, export it only for local commands, then run `npm run db:deploy`, `npm run db:seed`, and the test commands. The service binds to `127.0.0.1:54329`, uses the dedicated `supportpilot_verification` database and `supportpilot_verification_postgres_data` volume, and never touches Prisma Dev/PGlite data. Do not use this local Compose database for Vercel.
