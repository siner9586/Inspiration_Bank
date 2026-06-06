import { prisma } from "@/lib/db/client";
import { createIdeaAndAnalyze } from "@/lib/ideas/service";
import { demoIdeas } from "@/lib/ideas/demo-data";

export async function seedDemoIdeasIfEmpty() {
  const count = await prisma.idea.count();
  if (count > 0) return count;

  for (const idea of demoIdeas) {
    await createIdeaAndAnalyze(idea);
  }

  return demoIdeas.length;
}
