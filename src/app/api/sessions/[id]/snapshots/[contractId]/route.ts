import { NextResponse } from "next/server";
import { projectorFor, wireProjectors } from "@/huid/projectors/registry";
import { projectorSnapshot } from "@/huid/projectors/runtime";
import { loadSession } from "@/nest/wave/store";

// The snapshot API (ADR-010 Decision 4): one backend-formed snapshot per
// contract — `{model, asOfOffset}` — shared by every consuming panel;
// never the tuple stream. The projector plane is wired to the commit hook
// here because assembly is the app shell's job.
wireProjectors();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; contractId: string }> }
) {
  const { id, contractId } = await context.params;
  const record = await loadSession(id);
  if (!record) return NextResponse.json({ error: "Unknown session." }, { status: 404 });
  const projector = projectorFor(contractId);
  if (!projector) {
    return NextResponse.json({ error: `Unknown snapshot contract "${contractId}".` }, { status: 404 });
  }
  const { model, asOfOffset } = projectorSnapshot(record, projector);
  return NextResponse.json({ model, asOfOffset });
}
