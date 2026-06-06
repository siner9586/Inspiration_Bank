import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { userSettingsSchema } from "@/lib/ai/schemas";
import { getOrCreateUserSettings } from "@/lib/ideas/service";
import { stringifyArray } from "@/lib/utils/text";

export async function GET() {
  const settings = await getOrCreateUserSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const parsed = userSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await getOrCreateUserSettings();
  const settings = await prisma.userSettings.update({
    where: { id: existing.id },
    data: {
      focusDirections: parsed.data.focusDirections,
      platforms: stringifyArray(parsed.data.platforms),
      contentStyle: parsed.data.contentStyle,
      resources: parsed.data.resources,
      skills: parsed.data.skills,
      conversionGoal: parsed.data.conversionGoal
    }
  });

  return NextResponse.json({ settings });
}
