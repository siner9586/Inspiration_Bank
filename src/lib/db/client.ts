import { PrismaClient } from "@prisma/client";

function assertDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? "";

  if (!url) {
    throw new Error(
      "DATABASE_URL is required. This project now uses PostgreSQL in production; set DATABASE_URL to your Neon Postgres connection string."
    );
  }

  if (url.startsWith("file:")) {
    throw new Error(
      "SQLite file DATABASE_URL values are no longer supported by the active Prisma schema. Use a PostgreSQL connection string, for example a Neon pooled DATABASE_URL."
    );
  }
}

assertDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
