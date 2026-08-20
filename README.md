# Class Scheduler

Next.js (App Router) + TypeScript + Prisma + local PostgreSQL.

## Requirements

- Node.js 20+
- [pnpm](https://pnpm.io)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local Postgres)

## Local setup (Postgres via Docker)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment

```bash
cp .env.example .env
```

`.env` should include (defaults match `docker-compose.yml`):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=class_scheduler
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/class_scheduler
```

`DATABASE_URL` points Prisma at the **local** Docker Postgres on `localhost:5432`.

### 3. Start local Postgres

```bash
docker compose up -d
```

Check it is running:

```bash
docker compose ps
```

### 4. Apply schema + seed

```bash
pnpm exec prisma generate
pnpm db:migrate
pnpm db:seed
```

Or reset DB, migrate, and seed in one step:

```bash
pnpm db:reset
```

Seed creates: 2 organizations, a parent with kids, an instructor, an upcoming open session, a full session, and a past session.

### 5. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. (Optional) Browse data

```bash
pnpm exec prisma studio
```

## Useful commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js |
| `pnpm test` | Run Vitest |
| `docker compose up -d` | Start local Postgres |
| `docker compose down` | Stop Postgres |
| `pnpm db:migrate` | Create/apply migrations |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:reset` | Reset DB + migrate + seed |

## Notes

- This project uses **local Postgres in Docker**, not a hosted DB.
- If port `5432` is already in use, change the host port in `docker-compose.yml` (e.g. `"5433:5432"`) and update `DATABASE_URL` to match.
- Fake signed-in user (env id / cookie) is added during the assessment, not as part of this setup.
