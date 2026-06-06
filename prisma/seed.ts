import { prisma } from "../src/lib/db/client";
import { getOrCreateUserSettings } from "../src/lib/ideas/service";
import { seedDemoIdeasIfEmpty } from "../src/lib/ideas/demo";

async function main() {
  await getOrCreateUserSettings();
  const count = await seedDemoIdeasIfEmpty();
  console.log(`Seed complete. Ideas available: ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
