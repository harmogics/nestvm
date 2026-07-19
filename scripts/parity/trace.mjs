// Parity oracle for the trace projector (proposal-centre-dock §6 step 1):
// derive row expectations independently from the raw JSONL — actor by a
// producer-class table (stated from Vol. 04's producer thinking, not from
// the formers' code), form by mechanical namespace, uid straight from the
// payload — then compare with the snapshot API for every stored session.
// Summaries are formation and are asserted only for presence and bound.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = new URL("../../var/sessions", import.meta.url).pathname;
const ids = readdirSync(DIR).filter((f) => f.endsWith(".jsonl")).map((f) => f.replace(/\.jsonl$/, ""));

// The independent producer-class table: who commits each fact family.
const LEARNER = new Set([
  "learning.session.opened",
  "learning.source.declared",
  "learning.turn.submitted",
  "learning.answer.submitted",
  "learning.knot.marked",
  "learning.integration.accepted",
  "learning.session.completed"
]);
const WORLD = new Set([
  "service.failed",
  "learning.scene.unfolded",
  "inference.response",
  "inference.reasoning",
  "inference.failed",
  "learning.integration.candidate",
  "learning.integration.returned"
]);

function expectedRow(tuple) {
  const label = tuple.kind === "domain.fact" ? (tuple.payload.factType ?? "domain.fact") : tuple.kind;
  const actor = tuple.kind !== "domain.fact" ? "machine" : LEARNER.has(label) ? "learner" : WORLD.has(label) ? "world" : "machine";
  const form =
    tuple.kind === "sys.knot.defined" || tuple.kind === "sys.descriptor.defined"
      ? "row.topology"
      : tuple.kind === "sys.knot.ready"
        ? "row.readiness"
        : label.startsWith("inference.")
          ? "row.inference"
          : label.startsWith("service.")
            ? "row.service"
            : label.startsWith("learning.")
              ? "row.learning"
              : "row.generic";
  const uid = tuple.kind === "domain.fact" && typeof tuple.payload?.data?.uid === "string"
    ? tuple.payload.data.uid
    : undefined;
  return { offset: tuple.offset, actor, label, form, uid };
}

let failures = 0;
let checked = 0;

for (const id of ids) {
  const lines = readFileSync(join(DIR, `${id}.jsonl`), "utf8").split("\n").filter((l) => l.trim());
  const tuples = lines.map((l) => JSON.parse(l));

  const response = await fetch(`http://localhost:3000/api/sessions/${id}/snapshots/trace`);
  if (!response.ok) {
    console.log(`FAIL ${id}: snapshot API ${response.status}`);
    failures += 1;
    continue;
  }
  const { model, asOfOffset } = await response.json();
  const problems = [];
  if (asOfOffset !== tuples.length) problems.push(`asOfOffset ${asOfOffset} != ${tuples.length}`);
  if (model.rows.length !== tuples.length) {
    problems.push(`total coverage broken: ${model.rows.length} rows != ${tuples.length} tuples`);
  }
  tuples.forEach((tuple, index) => {
    const got = model.rows[index];
    if (!got) return;
    const exp = expectedRow(tuple);
    for (const key of ["offset", "actor", "label", "form", "uid"]) {
      const a = got[key] ?? undefined;
      const b = exp[key] ?? undefined;
      if (a !== b) problems.push(`@${tuple.offset}.${key}: got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`);
    }
    if (typeof got.summary !== "string" || got.summary.length === 0) {
      problems.push(`@${tuple.offset}: empty summary`);
    }
    if (got.summary && got.summary.length > 200) {
      problems.push(`@${tuple.offset}: summary unbounded (${got.summary.length})`);
    }
    if ("payload" in got) problems.push(`@${tuple.offset}: payload leaked onto the wire`);
  });
  checked += 1;
  if (problems.length > 0) {
    failures += 1;
    console.log(`FAIL ${id}:\n  ${problems.slice(0, 12).join("\n  ")}`);
  }
}

console.log(`\n${checked} sessions checked, ${failures} failures`);
process.exit(failures > 0 ? 1 : 0);
