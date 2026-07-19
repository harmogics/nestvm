// Parity oracle for the produced-texts projector (proposal-centre-dock §6
// step 2): derive block expectations independently from the raw JSONL —
// scene ownership via the `.close` naming convention (the deliberately
// different path, unlike the projector's emittedBy joins), block
// membership straight from the facts — then compare with the snapshot
// API for every stored session.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = new URL("../../var/sessions", import.meta.url).pathname;
const ids = readdirSync(DIR).filter((f) => f.endsWith(".jsonl")).map((f) => f.replace(/\.jsonl$/, ""));

let failures = 0;
let checked = 0;

for (const id of ids) {
  const lines = readFileSync(join(DIR, `${id}.jsonl`), "utf8").split("\n").filter((l) => l.trim());
  const tuples = lines.map((l) => JSON.parse(l));
  const facts = tuples.filter((t) => t.kind === "domain.fact");

  const titleOf = new Map();
  const operatorOf = new Map();
  for (const t of facts) {
    const p = t.payload;
    if (p.factType === "learning.bind.selected") {
      titleOf.set(p.data.bindId, p.data.title ?? "Scene forming");
      operatorOf.set(p.data.bindId, p.data.operatorId ?? "bind");
    }
    if (p.factType === "learning.scene.unfolded" && p.data.result?.title) {
      titleOf.set(p.data.bindId, p.data.result.title);
    }
  }

  const sceneOf = (closeId) => closeId.replace(/\.close$/, ""); // the independent path

  const expected = [];
  const expectedAccepted = {};
  const latestCandidate = new Map();
  const integrated = new Set();
  for (const t of facts) {
    const p = t.payload;
    const d = p.data ?? {};
    if (p.factType === "learning.integration.candidate" || p.factType === "learning.integration.returned") {
      const scene = sceneOf(String(d.bindId ?? ""));
      const returned = p.factType === "learning.integration.returned";
      latestCandidate.set(scene, t.offset);
      expected.push({
        offset: t.offset,
        form: returned ? "integration.returned" : "integration.candidate",
        actor: "world",
        title: titleOf.get(scene),
        bindId: scene,
        body: String(d.result?.statement ?? ""),
        meta: `${scene} · ${operatorOf.get(scene) ?? "bind"}${returned ? " · returned to parent" : ""}`
      });
    } else if (p.factType === "learning.turn.submitted" && !d.operator && !d.targetKnotId && String(d.text ?? "").trim()) {
      expected.push({ offset: t.offset, form: "turn.plain", actor: "learner", body: String(d.text).trim(), meta: "plain signal" });
    } else if (p.factType === "learning.answer.submitted") {
      expected.push({
        offset: t.offset, form: "answer", actor: "learner",
        body: String(d.answer ?? ""), meta: `${d.vector ?? "answer"} → ${d.knotId}`
      });
    } else if (p.factType === "learning.evidence.registered") {
      expected.push({
        offset: t.offset, form: "evidence.excerpts", actor: "world",
        body: (d.excerpts ?? []).map((e) => `${e.volume}, "${e.section}": ${e.excerpt}`).join("\n\n"),
        meta: `evidence → ${d.knotId}`
      });
    } else if (p.factType === "learning.integration.accepted") {
      if (typeof d.candidateOffset === "number" && typeof d.valueId === "string") {
        expectedAccepted[String(d.candidateOffset)] = d.valueId;
      }
      integrated.add(String(d.bindId ?? ""));
    }
  }
  const expectedAwaiting = [...latestCandidate.entries()]
    .filter(([scene]) => !integrated.has(scene))
    .map(([, offset]) => offset)
    .sort((a, b) => a - b);

  const response = await fetch(`http://localhost:3000/api/sessions/${id}/snapshots/produced-texts`);
  if (!response.ok) {
    console.log(`FAIL ${id}: snapshot API ${response.status}`);
    failures += 1;
    continue;
  }
  const { model, asOfOffset } = await response.json();
  const problems = [];
  if (asOfOffset !== tuples.length) problems.push(`asOfOffset ${asOfOffset} != ${tuples.length}`);
  if (model.blocks.length !== expected.length) problems.push(`blocks ${model.blocks.length} != ${expected.length}`);
  expected.forEach((exp, i) => {
    const got = model.blocks[i];
    if (!got) return;
    for (const key of ["offset", "form", "actor", "title", "bindId", "body", "meta"]) {
      const a = got[key] ?? undefined;
      const b = exp[key] ?? undefined;
      if (a !== b) problems.push(`@${exp.offset}.${key}: got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`);
    }
  });
  if (JSON.stringify(model.accepted) !== JSON.stringify(expectedAccepted)) {
    problems.push(`accepted map: got ${JSON.stringify(model.accepted)} expected ${JSON.stringify(expectedAccepted)}`);
  }
  if (JSON.stringify(model.awaiting) !== JSON.stringify(expectedAwaiting)) {
    problems.push(`awaiting: got ${JSON.stringify(model.awaiting)} expected ${JSON.stringify(expectedAwaiting)}`);
  }
  checked += 1;
  if (problems.length > 0) {
    failures += 1;
    console.log(`FAIL ${id}:\n  ${problems.slice(0, 12).join("\n  ")}`);
  }
}

console.log(`\n${checked} sessions checked, ${failures} failures`);
process.exit(failures > 0 ? 1 : 0);
