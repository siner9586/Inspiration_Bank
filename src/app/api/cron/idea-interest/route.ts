import { NextResponse } from "next/server";
import { runIdeaInterestJob } from "@/lib/cron/idea-interest-job";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(100, Math.round(limitParam))) : 20;
  const dryRun = searchParams.get("dryRun") === "1" || searchParams.get("dryRun") === "true";
  const provider = searchParams.get("provider") || process.env.CRON_AI_PROVIDER || "zero-cost";

  const result = await runIdeaInterestJob({
    dryRun,
    limit,
    provider
  });

  return NextResponse.json({
    ok: true,
    ...result
  });
}
