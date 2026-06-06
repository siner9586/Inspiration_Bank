import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { PrismaClient } from "@prisma/client";

function prepareSqlitePath() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.startsWith("file:/tmp/")) return;
  const dbPath = url.replace(/^file:/, "");
  mkdirSync(dirname(dbPath), { recursive: true });
}

prepareSqlitePath();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaReady?: Promise<void>;
};

const rawPrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

async function ensureSchema() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.startsWith("file:")) return;

  await rawPrisma.$executeRawUnsafe("CREATE TABLE IF NOT EXISTS UserSettings (id TEXT NOT NULL PRIMARY KEY, focusDirections TEXT NOT NULL DEFAULT '', platforms TEXT NOT NULL DEFAULT '[]', contentStyle TEXT NOT NULL DEFAULT '', resources TEXT NOT NULL DEFAULT '', skills TEXT NOT NULL DEFAULT '', conversionGoal TEXT NOT NULL DEFAULT 'content', createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);");
  await rawPrisma.$executeRawUnsafe("CREATE TABLE IF NOT EXISTS Idea (id TEXT NOT NULL PRIMARY KEY, title TEXT NOT NULL, rawContent TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', type TEXT NOT NULL DEFAULT 'other', tags TEXT NOT NULL DEFAULT '[]', source TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'analyzing', initialValue INTEGER NOT NULL DEFAULT 0, currentValue INTEGER NOT NULL DEFAULT 0, valueTier TEXT NOT NULL DEFAULT '闪念', valueExplanation TEXT NOT NULL DEFAULT '', valueComponents TEXT NOT NULL DEFAULT '{}', feasibilityLevel TEXT NOT NULL DEFAULT '中', commercialValue INTEGER NOT NULL DEFAULT 0, contentValue INTEGER NOT NULL DEFAULT 0, viralityLevel TEXT NOT NULL DEFAULT '中', viralityScore INTEGER NOT NULL DEFAULT 0, productizationLevel TEXT NOT NULL DEFAULT '中', productizationScore INTEGER NOT NULL DEFAULT 0, shortVideoFit TEXT NOT NULL DEFAULT '中', longTermFit TEXT NOT NULL DEFAULT '中', personalFitScore INTEGER NOT NULL DEFAULT 55, riskLevel TEXT NOT NULL DEFAULT '中', priority TEXT NOT NULL DEFAULT '中', targetUsers TEXT NOT NULL DEFAULT '[]', monetizationMethods TEXT NOT NULL DEFAULT '[]', risks TEXT NOT NULL DEFAULT '[]', requiredResources TEXT NOT NULL DEFAULT '[]', nextMinimalAction TEXT NOT NULL DEFAULT '', recommendedPlatforms TEXT NOT NULL DEFAULT '[]', productSuggestions TEXT NOT NULL DEFAULT '[]', createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, archivedAt DATETIME);");
  await rawPrisma.$executeRawUnsafe("CREATE TABLE IF NOT EXISTS IdeaTitle (id TEXT NOT NULL PRIMARY KEY, ideaId TEXT NOT NULL, title TEXT NOT NULL, platform TEXT NOT NULL DEFAULT '', score INTEGER NOT NULL DEFAULT 0, CONSTRAINT IdeaTitle_ideaId_fkey FOREIGN KEY (ideaId) REFERENCES Idea (id) ON DELETE CASCADE ON UPDATE CASCADE);");
  await rawPrisma.$executeRawUnsafe("CREATE TABLE IF NOT EXISTS IdeaInterest (id TEXT NOT NULL PRIMARY KEY, ideaId TEXT NOT NULL, daysSinceCreated INTEGER NOT NULL, interestType TEXT NOT NULL, content TEXT NOT NULL, suggestedAction TEXT NOT NULL, milestone TEXT, generatedBy TEXT, engineType TEXT, estimatedValueChange INTEGER, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT IdeaInterest_ideaId_fkey FOREIGN KEY (ideaId) REFERENCES Idea (id) ON DELETE CASCADE ON UPDATE CASCADE);");
  await rawPrisma.$executeRawUnsafe("CREATE TABLE IF NOT EXISTS IdeaOutput (id TEXT NOT NULL PRIMARY KEY, ideaId TEXT NOT NULL, outputType TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT IdeaOutput_ideaId_fkey FOREIGN KEY (ideaId) REFERENCES Idea (id) ON DELETE CASCADE ON UPDATE CASCADE);");
  await rawPrisma.$executeRawUnsafe("CREATE TABLE IF NOT EXISTS AiCallLog (id TEXT NOT NULL PRIMARY KEY, provider TEXT NOT NULL, model TEXT NOT NULL, taskType TEXT NOT NULL, ideaId TEXT, success BOOLEAN NOT NULL, latencyMs INTEGER NOT NULL, inputTokens INTEGER, outputTokens INTEGER, estimatedCost REAL, engineType TEXT, apiCost REAL, estimatedSavedCost REAL, ruleHitCount INTEGER, templateHitCount INTEGER, lexiconHitCount INTEGER, fallbackUsed BOOLEAN NOT NULL DEFAULT false, errorMessage TEXT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);");
}

function ready() {
  globalForPrisma.prismaReady ??= ensureSchema();
  return globalForPrisma.prismaReady;
}

const modelNames = new Set(["userSettings", "idea", "ideaTitle", "ideaInterest", "ideaOutput", "aiCallLog"]);

export const prisma = new Proxy(rawPrisma, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof prop !== "string" || !modelNames.has(prop) || typeof value !== "object" || value === null) {
      return value;
    }

    return new Proxy(value, {
      get(delegateTarget, delegateProp, delegateReceiver) {
        const delegateValue = Reflect.get(delegateTarget, delegateProp, delegateReceiver);
        if (typeof delegateValue !== "function") return delegateValue;
        return async (...args: unknown[]) => {
          await ready();
          return delegateValue.apply(delegateTarget, args);
        };
      }
    });
  }
}) as PrismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
