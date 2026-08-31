# Release checklist

- [ ] Working tree reviewed; release changes intentionally committed
- [ ] Environment and private-file scan clean
- [ ] Database migration status current
- [ ] Unit, integration, browser, and accessibility-critical tests pass
- [ ] ESLint, TypeScript, and production build pass
- [ ] Compiled browser bundle contains no server-only configuration or private content
- [ ] Dependency audit reviewed; Prisma CLI warning documented without breaking downgrade
- [ ] Public-mode configuration validation passes
- [ ] Health endpoint contains no secrets or machine paths
- [ ] Demonstration billing/email labels visible
- [ ] Ollama remains loopback-only
- [ ] Privacy, terms, and contact placeholders replaced before production use
- [ ] License selected by repository owner
