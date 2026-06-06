import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { ideaPatchSchema } from "@/lib/ai/schemas";
import { ideaInclude } from "@/lib/ideas/service";
import { stringifyArray } from "@/lib/utils/text";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idea = await prisma.idea.findUnique({
    where: { id },
    include: ideaInclude
  });

  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  return NextResponse.json({ idea });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = ideaPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const idea = await prisma.idea.update({
    where: { id },
    data: {
      title: data.title,
      status: data.status,
      source: data.source,
      tags: data.tags ? stringifyArray(data.tags) : undefined,
      archivedAt: data.status === "archived" ? new Date() : data.status ? null : undefined
    },
    include: ideaInclude
  });

  return NextResponse.json({ idea });
}
