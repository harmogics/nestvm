import { NextResponse } from "next/server";
import { loadSession } from "@/nest/wave/store";

// The raw-tuple endpoint (proposal-centre-dock §10 P4): a Class L materialised
// reading (Vol. 14 §1) — one committed tuple by offset, verbatim. The
// precondition for bounded panel snapshots (payloads never ride the panel
// wire) and for the lazy raw-JSON widget: raw truth stays one disclosure
// away (HUID 04 §3.3). Reads only; commits nothing; panels are not its
// consumers — the host's resolveTuple reader is (§12.5.4).
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; offset: string }> }
) {
  const { id, offset } = await context.params;
  const record = await loadSession(id);
  if (!record) return NextResponse.json({ error: "Unknown session." }, { status: 404 });
  const parsed = Number(offset);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return NextResponse.json({ error: "Offset must be a non-negative integer." }, { status: 400 });
  }
  const tuple = record.tuples[parsed];
  if (!tuple) {
    return NextResponse.json(
      { error: `Offset ${parsed} is beyond this session's log (${record.tuples.length} tuples).` },
      { status: 404 }
    );
  }
  return NextResponse.json({ tuple });
}
