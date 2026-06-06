import { NextResponse } from "next/server";
import { generateInterestForIdea } from "@/lib/ideas/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idea = await generateInterestForIdea(id);
  return NextResponse.json({ idea });
}
