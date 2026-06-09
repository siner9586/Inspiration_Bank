# Neon Postgres Setup

Inspiration Bank now uses PostgreSQL for the active Prisma schema. Neon Postgres is the recommended free production database for the current Netlify deployment.

## Why migrate away from SQLite

SQLite is excellent for local prototypes, but it is not a reliable long-term database for serverless production platforms such as Netlify or Vercel. Serverless functions may run in different instances, and local files can be temporary or non-persistent.

The active Prisma datasource is now:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Environment variable

Set this in Netlify, local `.env`, and any deployment environment:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
```

Use the pooled Neon connection string for Netlify unless you have a specific reason to use a direct connection.

Do not commit the real `DATABASE_URL`.

## Local setup

```bash
pnpm install
pnpm run db:generate
pnpm run db:push
pnpm run db:seed
pnpm run dev
```

## Netlify setup

In Netlify Site settings → Environment variables, set:

```env
DATABASE_URL=<your Neon pooled connection string>
AI_PROVIDER=zero-cost
AI_MODEL=zero-cost-rule-engine
AI_FALLBACK_PROVIDER=mock
AI_ANALYZE_PROVIDER=zero-cost
AI_INTEREST_PROVIDER=zero-cost
AI_OUTPUT_PROVIDER=zero-cost
CRON_AI_PROVIDER=zero-cost
```

Then redeploy the site.

For Git-connected deployments, pushing to `main` is the preferred deployment trigger. Avoid using the MCP proxy upload path for this project unless Netlify support specifically asks for it, because the Git integration provides clearer build logs and uses the configured production environment variables.

## Migration notes

For the current project stage, `prisma db push` is acceptable because this is an MVP. For a production app with important data, prefer Prisma Migrate:

```bash
pnpm prisma migrate dev --name init_postgres
pnpm prisma migrate deploy
```

## Zero-cost AI remains unchanged

The database migration does not require any paid AI API. The default intelligent engine remains `zero-cost`.

## Validation

After setting `DATABASE_URL`, run:

```bash
pnpm run db:generate
pnpm run db:push
pnpm run db:seed
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm run eval:zero
pnpm run cron:idea-interest:dry
```

## Troubleshooting

- If Prisma says the datasource URL is invalid, confirm that `DATABASE_URL` starts with `postgresql://`.
- If Netlify build succeeds but pages fail at runtime, confirm that `DATABASE_URL` is configured in Netlify production environment variables.
- If you see an error about SQLite `file:` URLs, update your `.env` and Netlify settings to use Neon Postgres.
