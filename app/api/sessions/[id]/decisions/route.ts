import { NextResponse } from "next/server";
import { submitDecision } from "@/lib/machine";
import { loadSession } from "@/lib/store";
import type { DecisionBody } from "@/lib/types";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const record = await loadSession(id);
  if (!record) return NextResponse.json({ error: "Unknown session." }, { status: 404 });
  let body: DecisionBody;
  try {
    body = (await request.json()) as DecisionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (record.meta.status === "completed" && body.kind !== "attest") {
    return NextResponse.json({ error: "The session is completed; open a new one." }, { status: 409 });
  }
  if (!body || typeof body.kind !== "string") {
    return NextResponse.json({ error: "A decision requires a kind." }, { status: 400 });
  }
  const result = await submitDecision(record, body);
  return NextResponse.json(result, { status: result.refused ? 409 : 200 });
}
