import { prisma } from "@/lib/db/client";
import { recommendTodayActions } from "@/lib/actions/recommend";

export async function getTodayActions() {
  const ideas = await prisma.idea.findMany({
    orderBy: [{ currentValue: "desc" }, { createdAt: "desc" }],
    include: {
      outputs: { select: { id: true } },
      actionLogs: { select: { status: true, createdAt: true } }
    }
  });
  return recommendTodayActions(ideas);
}

export async function recordActionLog(input: {
  ideaId: string;
  actionType: string;
  actionText: string;
  status: "done" | "skipped" | "converted";
  resultNote?: string;
}) {
  const completed = input.status === "done" || input.status === "converted";
  const log = await prisma.actionLog.create({
    data: {
      ideaId: input.ideaId,
      actionType: input.actionType,
      actionText: input.actionText,
      status: input.status,
      resultNote: input.resultNote ?? "",
      completedAt: completed ? new Date() : null
    }
  });

  if (input.status === "converted") {
    await prisma.idea.update({ where: { id: input.ideaId }, data: { status: "converted" } });
  }

  return log;
}
