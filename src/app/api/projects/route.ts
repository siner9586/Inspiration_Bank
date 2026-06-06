import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { mergeIdeasToProject } from "@/lib/projects/merge-ideas";

const schema = z.object({
  ideaIds: z.array(z.string()).min(2)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ideas = await prisma.idea.findMany({ where: { id: { in: parsed.data.ideaIds } } });
  const draft = mergeIdeasToProject(ideas);
  const project = await prisma.projectSeed.create({
    data: {
      name: draft.name,
      description: draft.description,
      positioning: draft.positioning,
      targetUsers: JSON.stringify(draft.targetUsers),
      problem: draft.problem,
      solution: draft.solution,
      mvpScope: JSON.stringify(draft.mvpScope),
      roadmap: JSON.stringify(draft.roadmap),
      relatedIdeaIds: JSON.stringify(draft.relatedIdeaIds)
    }
  });

  return NextResponse.json({ project, warning: draft.warning });
}
