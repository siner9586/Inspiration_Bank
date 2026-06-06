import { NextResponse } from "next/server";
import { createIdeaSchema } from "@/lib/ai/schemas";
import { createIdeaAndAnalyze, listIdeas } from "@/lib/ideas/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ideas = await listIdeas({
    query: searchParams.get("q") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    sort: searchParams.get("sort") ?? undefined
  });

  return NextResponse.json({ ideas });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createIdeaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const idea = await createIdeaAndAnalyze(parsed.data);
  return NextResponse.json({ id: idea.id, idea });
}
