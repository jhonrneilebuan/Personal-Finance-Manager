# Database Setup

PesoPilot uses PostgreSQL through Prisma.

## Local PostgreSQL

```bash
createdb financedb
```

Set `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/financedb?schema=public"
```

Apply migrations and seed demo data:

```bash
npm run prisma:migrate --workspace backend
npm run seed --workspace backend
```

Demo login after seeding:

```text
Email: demo@pesopilot.app
Password: Password123!
```
