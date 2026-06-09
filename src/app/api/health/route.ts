import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

function errorInfo(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message.slice(0, 500)
    };
  }
  return { name: "UnknownError", message: String(error).slice(0, 500) };
}

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const payload = {
    status: "ok",
    databaseUrlPresent: url.length > 0,
    databaseUrlProtocol: url.startsWith("postgresql://") ? "postgresql" : url.startsWith("file:") ? "file" : url ? "other" : "missing",
    db: null as null | { ok: boolean; ideaCount?: number; userSettingsCount?: number },
    error: null as null | { name: string; message: string }
  };

  try {
    const ideaCount = await prisma.idea.count();
    const userSettingsCount = await prisma.userSettings.count();
    payload.db = { ok: true, ideaCount, userSettingsCount };
    return NextResponse.json(payload);
  } catch (error) {
    payload.status = "error";
    payload.db = { ok: false };
    payload.error = errorInfo(error);
    return NextResponse.json(payload, { status: 500 });
  }
}
