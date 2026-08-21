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

Defaults match `docker-compose.yml`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=class_scheduler
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/class_scheduler
CURRENT_USER_ID=
```

`DATABASE_URL` points Prisma at the **local** Docker Postgres on `localhost:5432`.

### 3. Start local Postgres

```bash
docker compose up -d
```

Check it is running:

```bash
pnpm exec prisma generate
pnpm db:reset
```

Seed creates: 2 organizations, parent (`parent@example.com`) with kids Amy/Ben, instructor (`instructor@example.com`), an open upcoming session, a full session, and a past session.

After seed, put the parent id in `.env`:

```env
CURRENT_USER_ID=<id of parent@example.com>
```

Get the id from the seed log (`parentId`) or Prisma Studio → User → `parent@example.com`.

Restart `pnpm dev`, open http://localhost:3000/sessions.

To see the enrol form: page must say Pat Parent. Under Beginner Soccer you get Child + Enrol. Yoga shows full (no form).

To see instructor view: set `CURRENT_USER_ID` to Ira Instructor’s id, restart, refresh. List only, no enrol form.

### 5. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (`/` redirects to `/sessions`).

### 6. Tests

```bash
pnpm test
```

### 7. (Optional) Browse data

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

- Uses **local Postgres in Docker**, not a hosted DB.
- If port `5432` is taken, change the host port in `docker-compose.yml` and update `DATABASE_URL`.
- Prefer `pnpm db:reset` over re-running seed alone (seed emails are unique).
- After `db:reset`, ids change — copy the new parent id into `CURRENT_USER_ID` again.
