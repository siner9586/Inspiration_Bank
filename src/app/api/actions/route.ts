import { NextResponse } from "next/server";
import { z } from "zod";
import { recordActionLog } from "@/lib/actions/service";

const schema = z.object({
  ideaId: z.string().min(1),
  actionType: z.string().min(1),
  actionText: z.string().min(1),
  status: z.enum(["done", "skipped", "converted"]),
  resultNote: z.string().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const log = await recordActionLog(parsed.data);
  return NextResponse.json({ log });
}
