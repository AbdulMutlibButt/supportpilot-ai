# Deployment strategy

## Local full mode

Set `APP_MODE=local-full` and use PostgreSQL, private local storage, and Ollama bound to `127.0.0.1`. The server calls Ollama; browsers never do. This is the only mode that supports private uploads and real local RAG.

## Public portfolio mode

Set `APP_MODE=public-demo`, `AI_PROVIDER=mock`, and `ALLOW_MOCK_AI=true`. Do not set Ollama or local-storage variables. Use only seeded non-private content. The application rejects unsafe public-mode combinations at startup/provider creation and rejects uploads.

Public mode must display demonstration labels, use no real email delivery, collect no payment details, and use disposable non-production database credentials. Ollama must never be proxied, tunneled, or bound publicly.

Deployment is not part of the current milestone.
