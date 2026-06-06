import { prisma } from "@/lib/db/client";
import { runIdeaInterestJob } from "@/lib/cron/idea-interest-job";

async function main() {
  const result = await runIdeaInterestJob({
    dryRun: true,
    limit: 20,
    provider: process.env.CRON_AI_PROVIDER || "zero-cost"
  });
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
