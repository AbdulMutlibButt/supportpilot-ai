# SupportPilot AI

SupportPilot AI is a portfolio-ready, local-first customer-support workspace built with Next.js. It combines database-backed authentication, tenant-isolated conversations, a private Knowledge Base, local Ollama retrieval-augmented generation, validated citations, real workspace analytics, and clearly labeled no-charge billing and email demonstrations.

## Current features

- Secure registration, login, logout, password reset, hashed sessions, and session revocation
- Owner, agent, and viewer roles enforced in server-side data-access functions
- Workspace-isolated conversations, customers, messages, assignment, tags, notes, and activity
- Secure PDF, DOCX, TXT, and manual-article processing with private local storage
- Local Ollama embeddings and grounded answers with server-validated citations
- Public workspace chatbot, anonymous sessions, escalation, and human takeover
- Demonstration Free, Pro, and Business plans with server-side usage limits
- Database development-email outbox for invitations, resets, assignments, and escalations
- Real workspace analytics, health endpoint, request correlation IDs, and owner system status
- Responsive light/dark UI, loading/error/empty states, keyboard focus, and reduced-motion support

## Architecture

```text
Browser
  → Next.js App Router / Server Actions / Route Handlers
  → authentication + workspace authorization data-access layer
  → Prisma ORM
  → PostgreSQL

Knowledge source → private storage → extraction → deterministic chunks
  → nomic-embed-text → workspace-filtered retrieval
  → llama3.2:3b → structured answer → server citation validation
```

Provider calls, environment configuration, database access, private storage paths, prompts, and full source documents stay server-side. Retrieval filters by workspace in database queries before generation; prompts are not the tenant boundary.

## Technology stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- PostgreSQL, Prisma ORM and Prisma Migrate
- Ollama with `llama3.2:3b` and `nomic-embed-text`
- Zod, bcrypt, Jose, Mammoth, PDF.js
- Vitest, Playwright, ESLint

## Local full-mode setup

Requirements: Node.js 20+, npm, Ollama, and the two local models. Prisma's named development PostgreSQL server avoids requiring Docker or a system-wide PostgreSQL installation.

```powershell
npm install
Copy-Item .env.example .env
npm run db:dev
```

Copy the reported TCP PostgreSQL URL into `DATABASE_URL`. Configure `.env` locally:

```dotenv
APP_MODE=local-full
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_CHAT_MODEL=llama3.2:3b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_EMBEDDING_DIMENSIONS=768
```

Install the models without exposing Ollama beyond localhost:

```powershell
ollama pull llama3.2:3b
ollama pull nomic-embed-text
```

Then apply migrations, seed local data, and start the app:

```powershell
$env:SEED_PASSWORD="choose-a-local-password"
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Seed users are `owner@supportpilot.local`, `agent@supportpilot.local`, and `viewer@supportpilot.local`, using the local `SEED_PASSWORD`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Server-only PostgreSQL connection |
| `SESSION_COOKIE_NAME` | Optional local session-cookie name |
| `SEED_PASSWORD` | Development seed password; never printed |
| `APP_MODE` | `local-full` or `public-demo` |
| `AI_PROVIDER` | `ollama` locally or `mock` for public demo |
| `ALLOW_MOCK_AI` | Must be `true` to enable deterministic mock AI |
| `OLLAMA_BASE_URL` | Loopback URL only; rejected in public mode |
| `OLLAMA_CHAT_MODEL` | Local chat model |
| `OLLAMA_EMBEDDING_MODEL` | Local embedding model |
| `OLLAMA_EMBEDDING_DIMENSIONS` | Expected embedding vector size |
| `LOCAL_STORAGE_ROOT` | Optional server-only local storage root; forbidden in public mode |

No environment variable is prefixed with `NEXT_PUBLIC_`; AI and storage configuration must not enter browser bundles.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build and framework type check |
| `npm run lint` | ESLint |
| `npm test` | Unit and integration tests |
| `npm run test:e2e` | Browser and accessibility-critical workflows |
| `npm run db:dev` | Start local Prisma PostgreSQL |
| `npm run db:migrate` | Apply development migrations |
| `npm run db:seed` | Seed demonstration data |
| `npm run ai:smoke` | Privacy-preserving real-Ollama smoke test |

## Security design

- Passwords use bcrypt; session, invitation, anonymous-chat, and reset tokens are random and stored hashed where used for authentication.
- Password-reset responses are generic, tokens expire after 30 minutes and are single-use, and successful resets revoke every session.
- Every protected mutation rechecks authentication, role, workspace membership, and resource scope server-side.
- Uploads validate extension, MIME signature, size, safe storage keys, and extraction results; files live outside public directories.
- Public chat applies rate and usage limits, input/output limits, cancellation and timeouts.
- Retrieved documents are treated as untrusted; structured citations are accepted only for chunks retrieved in the same workspace.
- Logs and health responses exclude prompts, generated answers, document content, tokens, credentials, and machine paths.
- Security headers and correlation IDs are added by the Next.js proxy.

See [SECURITY.md](SECURITY.md) for reporting and review scope.

## Demonstration and deployment modes

### Local full mode

Uses PostgreSQL, private local file storage, loopback-only Ollama, real local embeddings, and the real RAG chatbot.

### Public portfolio mode

Uses `APP_MODE=public-demo`, deterministic mock AI, seeded non-private content, demonstration billing, and database email previews. Private uploads and Ollama configuration are rejected. No real payment or email provider is connected.

See [DEPLOYMENT.md](DEPLOYMENT.md). Deployment is intentionally not performed by this milestone.

### Public Beta mode

Set `APP_MODE=public-beta`, `AI_PROVIDER=mock`, and `ALLOW_MOCK_AI=true` with a hosted PostgreSQL URL and HTTPS `APP_BASE_URL`. Visitors can create isolated free workspaces and use the inbox with mock AI. Uploads, document ingestion, local storage, Ollama, paid AI, payments, and external email delivery remain disabled. Vercel Hobby is intended for personal, non-commercial use and its free limits apply.

### Stable local PostgreSQL verification

Docker Desktop can provide an isolated PostgreSQL database for local tests without touching Prisma Dev/PGlite data. Copy `.env.docker.example` to the ignored `.env.docker.local`, choose a local-only password, then run `docker compose --env-file .env.docker.local up -d`. Put the matching local `DATABASE_URL` in ignored `.env.test.docker.local`, then run migrations, seed data, and tests with that variable in the shell. The Compose service binds only to `127.0.0.1:54329` and uses the separate `supportpilot_verification_postgres_data` volume.

## Known audit warning

`npm audit --omit=dev` reports a high-severity `deepmerge-ts` advisory through the development-only Prisma CLI (`prisma` → `@prisma/config`). npm's proposed automatic repair force-downgrades Prisma to 6.12, a breaking change, so it is intentionally not applied. Reassess when Prisma publishes a compatible update. This CLI chain is not shipped in the production runtime.

## Portfolio screenshots

- Landing page — screenshot placeholder
- Conversation workspace and AI assistance — screenshot placeholder
- Knowledge Base indexing and citations — screenshot placeholder
- Public chatbot — screenshot placeholder
- Analytics, billing demonstration, and system status — screenshot placeholder

## Project documents

- [Contribution guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Deployment modes](DEPLOYMENT.md)
- [Release checklist](RELEASE_CHECKLIST.md)
- [Portfolio demonstration script](PORTFOLIO_DEMO.md)

## Roadmap

- Production object-storage adapter
- Production email-provider adapter
- Optional production AI/vector provider
- Real billing only after a dedicated security and compliance review
- Expanded observability, localization, and multi-workspace switching

No open-source license has been added yet. A recommendation is provided in the final milestone report for owner approval.
