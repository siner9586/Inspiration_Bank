import { NextResponse } from "next/server";
import { seedDemoIdeasIfEmpty } from "@/lib/ideas/demo";

export async function POST() {
  const count = await seedDemoIdeasIfEmpty();
  return NextResponse.json({ count });
}
