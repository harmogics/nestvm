import { NextResponse } from "next/server";
import { loadSession } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const record = await loadSession(id);
  if (!record) return NextResponse.json({ error: "Unknown session." }, { status: 404 });
  return NextResponse.json({ meta: record.meta, tuples: record.tuples });
}
