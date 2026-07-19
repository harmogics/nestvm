// Parity oracle for the scene-detail projector (design_proposal §6
// step 3): derive scene expectations independently from the raw JSONL —
// ownership via the `.close` naming convention and the `<bindId>.k*` knot
// naming (the deliberately different path, unlike the projector's
// emittedBy joins), the barrier by direct counting, the grade from the
// last inference.response — then compare with the snapshot API.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = new URL("../../var/sessions", import.meta.url).pathname;
const ids = readdirSync(DIR).filter((f) => f.endsWith(".jsonl")).map((f) => f.replace(/\.jsonl$/, ""));

let failures = 0;
let checked = 0;

for (const id of ids) {
  const lines = readFileSync(join(DIR, `${id}.jsonl`), "utf8").split("\n").filter((l) => l.trim());
  const tuples = lines.map((l) => JSON.parse(l));

  // independent per-knot expectations
  const knots = new Map(); // knotId → {ready, unknown, returned, grade, tacts, evidence}
  const sceneOfKnot = (knotId) => knotId.replace(/\.k\d+$/, "");
  for (const t of tuples) {
    if (t.kind === "sys.knot.defined") {
      knots.set(t.payload.id, { ready: false, unknown: false, returned: false, grade: 0, tacts: 0, evidence: 0 });
    }
    if (t.kind === "sys.knot.ready") {
      const k = knots.get(t.payload.knotId);
      if (k) k.ready = true;
    }
    if (t.kind !== "domain.fact") continue;
    const p = t.payload;
    const d = p.data ?? {};
    const k = d.knotId ? knots.get(d.knotId) : undefined;
    if (p.factType === "inference.request" && k) k.tacts += 1;
    if (p.factType === "inference.response" && k) k.grade = Number(d.grade ?? 0);
    if (p.factType === "learning.knot.marked" && k && d.mark === "unknown") k.unknown = true;
    if (p.factType === "learning.evidence.registered" && k) k.evidence += (d.excerpts ?? []).length;
    if (p.factType === "learning.integration.returned" && d.parentKnotId) {
      const pk = knots.get(d.parentKnotId);
      if (pk) pk.returned = true;
    }
  }

  // independent per-scene expectations
  const expected = new Map(); // bindId → {status, settled, total, candidateOffset}
  for (const t of tuples) {
    if (t.kind !== "domain.fact") continue;
    const p = t.payload;
    const d = p.data ?? {};
    if (p.factType === "learning.bind.selected") {
      expected.set(d.bindId, { status: "projecting", candidateOffset: undefined, strata: 0 });
    }
    if (p.factType === "learning.scene.unfolded") {
      const e = expected.get(d.bindId);
      if (e) e.status = "active";
    }
    if (p.factType === "learning.integration.candidate" || p.factType === "learning.integration.returned") {
      const scene = String(d.bindId ?? "").replace(/\.close$/, "");
      const e = expected.get(scene);
      if (e && e.status !== "integrated") {
        e.status = "candidate";
        if (e.candidateOffset === undefined) e.candidateOffset = t.offset;
      }
    }
    if (p.factType === "learning.integration.accepted") {
      const e = expected.get(d.bindId);
      if (e) e.status = "integrated";
    }
  }

  const response = await fetch(`http://localhost:3000/api/sessions/${id}/snapshots/scene-detail`);
  if (!response.ok) {
    console.log(`FAIL ${id}: snapshot API ${response.status}`);
    failures += 1;
    continue;
  }
  const { model, asOfOffset } = await response.json();
  const problems = [];
  if (asOfOffset !== tuples.length) problems.push(`asOfOffset ${asOfOffset} != ${tuples.length}`);
  if (model.scenes.length !== expected.size) problems.push(`scenes ${model.scenes.length} != ${expected.size}`);

  for (const scene of model.scenes) {
    const exp = expected.get(scene.bindId);
    if (!exp) {
      problems.push(`unexpected scene ${scene.bindId}`);
      continue;
    }
    if (scene.status !== exp.status) {
      problems.push(`${scene.bindId}.status: got ${scene.status} expected ${exp.status}`);
    }
    if (exp.candidateOffset !== undefined && scene.candidate?.offset !== exp.candidateOffset) {
      problems.push(`${scene.bindId}.candidate.offset: got ${scene.candidate?.offset} expected ${exp.candidateOffset}`);
    }
    // knots: membership by the naming convention, fields by correlation
    const expectedKnots = [...knots.keys()].filter((kid) => sceneOfKnot(kid) === scene.bindId);
    if (scene.knots.length !== expectedKnots.length) {
      problems.push(`${scene.bindId}.knots: got ${scene.knots.length} expected ${expectedKnots.length}`);
    }
    let settled = 0;
    for (const knot of scene.knots) {
      const ek = knots.get(knot.knotId);
      if (!ek) {
        problems.push(`${scene.bindId}: unexpected knot ${knot.knotId}`);
        continue;
      }
      for (const key of ["ready", "unknown", "returned", "grade"]) {
        if (knot[key] !== ek[key]) {
          problems.push(`${knot.knotId}.${key}: got ${knot[key]} expected ${ek[key]}`);
        }
      }
      if (knot.tacts.length !== ek.tacts) problems.push(`${knot.knotId}.tacts: got ${knot.tacts.length} expected ${ek.tacts}`);
      if (knot.evidence.length !== ek.evidence) problems.push(`${knot.knotId}.evidence: got ${knot.evidence.length} expected ${ek.evidence}`);
      for (const tact of knot.tacts) {
        if ("deltas" in tact) problems.push(`${knot.knotId}: delta bodies leaked onto the wire`);
      }
      if (ek.ready || ek.unknown || ek.returned) settled += 1;
    }
    if (scene.barrier.settled !== settled || scene.barrier.total !== expectedKnots.length) {
      problems.push(
        `${scene.bindId}.barrier: got ${scene.barrier.settled}/${scene.barrier.total} expected ${settled}/${expectedKnots.length}`
      );
    }
    const strataCount = scene.strata.admission.length + scene.strata.sowing.length + scene.strata.harvest.length;
    if (strataCount === 0) problems.push(`${scene.bindId}: empty strata`);
  }
  checked += 1;
  if (problems.length > 0) {
    failures += 1;
    console.log(`FAIL ${id}:\n  ${problems.slice(0, 12).join("\n  ")}`);
  }
}

console.log(`\n${checked} sessions checked, ${failures} failures`);
process.exit(failures > 0 ? 1 : 0);
