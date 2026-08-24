# SupportPilot AI

SupportPilot AI is a modern customer-support workspace for growing teams. The current application combines a polished responsive interface with a real PostgreSQL-backed account, workspace, session, and role foundation.

## Current features

- Responsive product landing page
- Registration and login with server-side validation
- Password hashing with bcrypt
- Database-backed, HTTP-only sessions and logout
- Protected dashboard routes
- Workspace creation during registration
- Owner, agent, and viewer membership roles
- Workspace authorization helpers
- Database-backed conversation inbox, assignments, tags, notes, and activity
- Secure team invitations with owner, agent, and viewer roles
- Database-backed Knowledge Base collections, documents, chunks, jobs, and activity
- Private PDF, DOCX, TXT, and manual article processing with workspace isolation
- Light and dark themes
- Loading, empty, error, and not-found states
- Local development seed accounts
- Automated authentication and authorization tests

## Technology stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- PostgreSQL through local Prisma Postgres
- Prisma ORM 7 and Prisma Migrate
- Zod validation
- bcrypt password hashing
- Mammoth and PDF.js document text extraction
- Local Ollama chat and `nomic-embed-text` embeddings (no cloud AI key required)
- Vitest, Playwright, and ESLint

## Local setup

Requirements: Node.js 20 or newer and npm. This project uses Prisma's project-local PostgreSQL development server, so Docker and a system-wide PostgreSQL installation are not required.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Start the named local database:

   ```bash
   npm run db:dev
   ```

4. Copy the TCP PostgreSQL URL reported by Prisma into `DATABASE_URL` in `.env`. Set `SESSION_COOKIE_NAME` and a development-only `SEED_PASSWORD`. For local AI, set `AI_PROVIDER=ollama`, `OLLAMA_BASE_URL=http://127.0.0.1:11434`, the two installed model names, and embedding dimensions `768`. Ollama must remain loopback-only.

5. Apply migrations and load development data:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. Start the application:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

### Seed accounts

The seed creates owner, agent, and viewer accounts in the Northstar Support workspace. They use the local `SEED_PASSWORD`; the seed never prints it. Never reuse seed credentials outside local development.

## Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create and type-check a production build |
| `npm run start` | Run the compiled production application |
| `npm run lint` | Run ESLint |
| `npm test` | Run the automated test suite once |
| `npm run test:e2e` | Run browser-level authentication, conversation, and Knowledge Base workflows |
| `npm run ai:smoke` | Run a privacy-preserving seeded smoke test against local Ollama |
| `npm run db:dev` | Start the named local Prisma Postgres instance |
| `npm run db:migrate` | Create and apply development migrations |
| `npm run db:seed` | Load local development users and workspace data |

## Project status

Milestones 1 through 5 are implemented. SupportPilot now includes local Ollama-backed indexing, workspace-isolated retrieval, validated grounded citations, a persistent public chatbot, human takeover, and agent reply assistance in addition to the existing authentication, support workflow, invitations, and private Knowledge Base. Uploaded files remain private and are not committed to Git.

## Planned features

- Object-storage provider for production uploads
- Optional production AI-provider and vector-index adapters
- Email channel integration and notifications
- Stripe subscriptions and workspace billing
- Expanded integration and end-to-end test coverage

## Security notes

Local environment files, credentials, generated clients, build output, database files, and logs are intentionally excluded from Git. Keep production secrets in the deployment platform's secret manager and never commit them to the repository.

`npm audit --omit=dev` currently reports a high-severity advisory through the development-only Prisma CLI (`@prisma/config` → `deepmerge-ts`). npm's offered remediation downgrades Prisma across a major version, so it is intentionally not applied. Reassess when Prisma publishes a compatible patched release; the affected CLI dependency is not part of the deployed application runtime.
