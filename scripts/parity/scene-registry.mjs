// Parity oracle for the depth projector (ADR-009 D3 step 6): derive card
// expectations independently from the raw JSONL (using the `.close` naming
// convention as an independent path, unlike the projector's provenance
// joins), then compare with the panel API for every stored session.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = new URL("../../var/sessions", import.meta.url).pathname;
const ids = readdirSync(DIR).filter((f) => f.endsWith(".jsonl")).map((f) => f.replace(/\.jsonl$/, ""));
let failures = 0;
let checked = 0;

for (const id of ids) {
  const lines = readFileSync(join(DIR, `${id}.jsonl`), "utf8").split("\n").filter((l) => l.trim());
  const tuples = lines.map((l) => JSON.parse(l));
  const facts = tuples.filter((t) => t.kind === "domain.fact").map((t) => t.payload);

  const expected = facts
    .filter((p) => p.factType === "learning.bind.selected")
    .map((p) => {
      const d = p.data;
      const unfolded = facts.filter((q) => q.factType === "learning.scene.unfolded" && q.data.bindId === d.bindId).pop();
      const accepted = facts.some((q) => q.factType === "learning.integration.accepted" && q.data.bindId === d.bindId);
      const published = facts.some(
        (q) =>
          (q.factType === "learning.integration.candidate" || q.factType === "learning.integration.returned") &&
          q.data.bindId === `${d.bindId}.close`
      );
      return {
        bindId: d.bindId,
        parentBindId: d.parentBindId ?? undefined,
        sourceKnotId: d.sourceKnotId ?? undefined,
        title: unfolded?.data?.result?.title ?? d.title ?? "Scene forming",
        status: accepted ? "integrated" : published ? "candidate" : unfolded ? "active" : "projecting",
        awaitingReview: published && !accepted
      };
    });

  const response = await fetch(`http://localhost:3000/api/sessions/${id}/snapshots/scene-registry`);
  if (!response.ok) {
    console.log(`FAIL ${id}: panel API ${response.status}`);
    failures += 1;
    continue;
  }
  const { model, asOfOffset } = await response.json();
  const problems = [];
  if (asOfOffset !== tuples.length) problems.push(`asOfOffset ${asOfOffset} != ${tuples.length}`);
  if (model.scenes.length !== expected.length) problems.push(`cards ${model.scenes.length} != ${expected.length}`);
  expected.forEach((exp, i) => {
    const got = model.scenes[i];
    if (!got) return;
    for (const key of ["bindId", "parentBindId", "sourceKnotId", "title", "status", "awaitingReview"]) {
      const a = got[key] ?? undefined;
      const b = exp[key] ?? undefined;
      if (a !== b) problems.push(`${exp.bindId}.${key}: got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`);
    }
  });
  checked += 1;
  if (problems.length > 0) {
    failures += 1;
    console.log(`FAIL ${id}:\n  ${problems.join("\n  ")}`);
  }
}

console.log(`\n${checked} sessions checked, ${failures} failures`);
process.exit(failures > 0 ? 1 : 0);
