# PesoPilot

PesoPilot is an AI-ready personal finance manager for income, expenses, savings, budgets, dashboard analytics, and reports.

## Folder Structure

```text
pesopilot/
├── frontend/          Expo + React Native + TypeScript mobile app
├── backend/           Express + Prisma + PostgreSQL REST API
├── database/          PostgreSQL setup notes
├── docs/              API and roadmap documentation
├── package.json       npm workspaces
└── README.md
```

## Installation Commands

```bash
npm install
npm run prisma:generate --workspace backend
```

## Run Commands

```bash
npm run dev:backend
npm run dev:frontend
```

## PostgreSQL Setup

Create a local database named `financedb`, then update `backend/.env` if your credentials differ.

```bash
createdb financedb
npm run prisma:migrate --workspace backend
npm run seed --workspace backend
```

## Prisma Commands

```bash
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
npm run prisma:studio --workspace backend
npm run seed --workspace backend
```

## Environment Variables

See [backend/.env.example](backend/.env.example).

## API Documentation

See [docs/API.md](docs/API.md).

## Development Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).

## Suggested Git Commit Structure

1. `chore: initialize pesopilot monorepo`
2. `feat(backend): add auth and finance api`
3. `feat(frontend): add expo finance manager screens`
4. `docs: add setup and api documentation`
5. `chore: configure prisma and project tooling`

## Best Practices

- Keep feature code inside the matching `src/features/*` folder.
- Keep backend controllers thin; add business rules in services and database access in repositories.
- Add request validation before every mutating route.
- Never commit production secrets.
- Add tests around auth, reports, and transaction ownership before production release.
