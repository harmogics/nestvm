import { NextResponse } from "next/server";
import { loadSession, serialiseLog } from "@/nest/wave/store";

// The session's wave log in the persisted wire format (Vol. 03 §6) — a
// materialised reading, not a command: the download creates nothing,
// commits nothing, discharges nothing (replay is reading, Vol. 03 §6.4).
// History is not publication (ECOSYSTEM boundary 2): the file remains the
// owner's private record; entering any commons is a separate reviewed act
// (PHILOSOPHY §9).
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const record = await loadSession(id);
  if (!record) return NextResponse.json({ error: "Unknown session." }, { status: 404 });
  return new Response(serialiseLog(record.tuples), {
    headers: {
      "Content-Type": "application/jsonl; charset=utf-8",
      "Content-Disposition": `attachment; filename="${id}.jsonl"`
    }
  });
}
