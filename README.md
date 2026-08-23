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
- Conversations, Knowledge Base, Analytics, Team, and Settings interfaces
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
- Vitest and ESLint

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

4. Copy the TCP PostgreSQL URL reported by Prisma into `DATABASE_URL` in `.env`. Set `SESSION_COOKIE_NAME` to a local cookie name, and set `SEED_PASSWORD` to a development-only password of at least eight characters.

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

The seed creates owner, agent, and viewer accounts in the Northstar Support workspace. Their development-only credentials are printed by the seed command. Never reuse seed credentials outside local development.

## Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create and type-check a production build |
| `npm run start` | Run the compiled production application |
| `npm run lint` | Run ESLint |
| `npm test` | Run the automated test suite once |
| `npm run db:dev` | Start the named local Prisma Postgres instance |
| `npm run db:migrate` | Create and apply development migrations |
| `npm run db:seed` | Load local development users and workspace data |

## Project status

Milestones 1 and 2 are complete. The application has a production-quality interface and an initial secure data foundation. Dashboard product content is currently representative; customer-support records and workflows will become database-backed in later milestones.

## Planned features

- Database-backed conversations and customer records
- Knowledge Base article management and document uploads
- Invitation acceptance and team administration workflows
- AI-assisted support answers and automation
- Email channel integration and notifications
- Stripe subscriptions and workspace billing
- Expanded integration and end-to-end test coverage

## Security notes

Local environment files, credentials, generated clients, build output, database files, and logs are intentionally excluded from Git. Keep production secrets in the deployment platform's secret manager and never commit them to the repository.
