import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { generateOutputRequestSchema } from "@/lib/ai/schemas";
import { generateOutputForIdea } from "@/lib/ideas/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const outputs = await prisma.ideaOutput.findMany({
    where: { ideaId: id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ outputs });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = generateOutputRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const output = await generateOutputForIdea(id, parsed.data.outputType);
  return NextResponse.json({ output });
}
