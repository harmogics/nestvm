import { NextResponse } from "next/server";
import { projectorFor, wireProjectors } from "@/huid/projectors/registry";
import { projectorSnapshot } from "@/huid/projectors/runtime";
import { loadSession } from "@/nest/wave/store";

// The panel API (ADR-009 Decision 2): a backend-formed snapshot per panel —
// `{model, asOfOffset}` — never the tuple stream. The projector plane is
// wired to the commit hook here because assembly is the app shell's job.
wireProjectors();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; panelId: string }> }
) {
  const { id, panelId } = await context.params;
  const record = await loadSession(id);
  if (!record) return NextResponse.json({ error: "Unknown session." }, { status: 404 });
  const projector = projectorFor(panelId);
  if (!projector) return NextResponse.json({ error: `Unknown panel "${panelId}".` }, { status: 404 });
  const { model, asOfOffset } = projectorSnapshot(record, projector);
  return NextResponse.json({ model, asOfOffset });
}
