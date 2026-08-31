# Contributing

Use Node.js 20 or newer. Create a branch, keep local secrets in `.env`, and never commit uploads, database files, extracted customer content, tokens, or generated output.

Before submitting work:

```powershell
npm test
npm run test:e2e
npm run lint
npx tsc --noEmit
npm run build
```

Database changes require a reviewed Prisma migration and workspace-isolation tests. Every mutation must authenticate, authorize the required role, and scope the resource by workspace. New providers must remain behind an interface and keep credentials server-only.
