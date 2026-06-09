import { PrismaClient } from "@prisma/client";

function assertDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? "";

  if (!url) {
    throw new Error(
      "DATABASE_URL is required. Set it to your Neon Postgres connection string in Netlify environment variables."
    );
  }

  if (url.startsWith("file:")) {
    throw new Error(
      "SQLite file DATABASE_URL values are not supported by the active PostgreSQL Prisma schema. Remove file: DATABASE_URL overrides and use Neon Postgres."
    );
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  assertDatabaseUrl();
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });
}

function getPrismaClient() {
  globalForPrisma.prisma ??= createPrismaClient();
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  }
});
