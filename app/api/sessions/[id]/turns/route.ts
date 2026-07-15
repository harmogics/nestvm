import { NextResponse } from "next/server";
import { submitTurn } from "@/lib/machine";
import { loadSession } from "@/lib/store";
import type { TurnBody } from "@/lib/types";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const record = await loadSession(id);
  if (!record) return NextResponse.json({ error: "Unknown session." }, { status: 404 });
  if (record.meta.status === "completed") {
    return NextResponse.json({ error: "The session is completed; open a new one." }, { status: 409 });
  }
  let body: TurnBody;
  try {
    body = (await request.json()) as TurnBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (typeof body.text !== "string") {
    return NextResponse.json({ error: "A turn requires a text field (empty string is a valid plain form)." }, { status: 400 });
  }
  const result = await submitTurn(record, body);
  return NextResponse.json(result, { status: result.refused ? 409 : 200 });
}
