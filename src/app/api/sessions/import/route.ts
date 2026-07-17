import { NextResponse } from "next/server";
import { project } from "@/nest/readings/projection";
import { createSessionFromLog, parseLog } from "@/nest/wave/store";
import type { SessionMeta } from "@/nest/wave/envelope";

const MAX_BYTES = 4_000_000;

// Import a recorded wave log and continue it as a live session — the
// continuation instrument of ADR-005 Decision 2 offered as a product act.
// The log enters verbatim (nothing re-keyed, nothing renumbered, nothing
// re-discharged, Vol. 08 §9); the meta sidecar is derived from the log
// itself, because sidecars are convenience, never a second truth
// (Vol. 03 §6.3). The log carries no wall clock, so `createdAt` records the
// import moment. This route orchestrates across regions — parse (wave),
// derive (readings), register (wave) — which is exactly the app shell's job.
export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > MAX_BYTES) {
    return NextResponse.json(
      { error: "The recording is larger than this workbench accepts (4 MB)." },
      { status: 413 }
    );
  }
  const parsed = parseLog(text);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const projection = project(parsed.tuples);
  if (!projection.sessionId) {
    return NextResponse.json(
      { error: "The log carries no learning.session.opened fact — not a study-session recording." },
      { status: 400 }
    );
  }
  const meta: SessionMeta = {
    id: projection.sessionId,
    createdAt: new Date().toISOString(),
    petal: projection.petal || "understand-the-machine",
    subject: projection.subject,
    resultContract: projection.resultContract || "defended-articulation@1",
    status: projection.status,
    class: "simulated",
    tuples: parsed.tuples.length
  };
  const created = await createSessionFromLog(meta, parsed.tuples);
  if (!created.ok) return NextResponse.json({ error: created.error }, { status: 409 });
  return NextResponse.json({ sessionId: meta.id }, { status: 201 });
}
