# Security policy

SupportPilot is currently a portfolio demonstration, not a hosted production service. Report suspected vulnerabilities privately to the repository owner rather than opening an issue containing secrets or private data.

Security-sensitive areas include authentication, session and reset tokens, workspace authorization, invitation acceptance, private uploads, storage-key resolution, public-chat abuse controls, retrieval isolation, prompt injection, citation validation, environment separation, and localhost-only Ollama access.

Never include passwords, tokens, database URLs, private documents, prompts, generated answers, machine paths, or local outbox action URLs in reports. Rotate any credential accidentally disclosed. Public deployment requires replacing development credentials, reviewing headers and rate-limit storage, configuring a managed database, and completing legal/privacy documentation.
