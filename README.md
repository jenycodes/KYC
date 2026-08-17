# SecureKYC

Monorepo for the SecureKYC identity verification system.

## Structure

```
apps/
  web/       Next.js (App Router) frontend — see apps/web/README.md
  backend/   Spring Boot backend — see apps/backend/README.md
docs/
  KYC documentation updated.pdf
```

Managed with npm workspaces — a single `npm install` at the repo root
installs `apps/web`'s dependencies. `apps/backend` is an independent
Maven project (see its README for run instructions).

## Getting started

```bash
npm install                          # installs apps/web
npm run dev --workspace=apps/web     # frontend on http://localhost:3000

cd apps/backend && ./mvnw spring-boot:run   # backend on http://localhost:8081
```
