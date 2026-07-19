import "server-only";

// The shared row-former registry (proposal-centre-dock §12.5.1 — the third
// append-shaped consumer arrived, so the registry lives once in the
// plane): each former claims tuples the way collection rules and
// controller claims do elsewhere in the machine; first claim wins in
// declared order; the generic former closes the chain, so no tuple is
// ever without a row (Vol. 04 §1.2). Consumed by the trace projector
// (every row) and the scene-detail projector (strata and tact rows).
// Matched, readable templates grow here (ADR-008 Decision 3).

import type { TraceActor, TraceRow, TraceRowForm } from "@/huid/contracts/trace";
import type { WaveTuple } from "@/nest/wave/envelope";

function payloadOf(tuple: WaveTuple): Record<string, unknown> {
  return (tuple.payload ?? {}) as Record<string, unknown>;
}

function factDataOf(tuple: WaveTuple): Record<string, unknown> {
  return (payloadOf(tuple).data ?? {}) as Record<string, unknown>;
}

function labelOf(tuple: WaveTuple): string {
  if (tuple.kind !== "domain.fact") return tuple.kind;
  return String(payloadOf(tuple).factType ?? "domain.fact");
}

function truncate(text: string, limit: number): string {
  return text.length > limit ? text.slice(0, limit - 1).replace(/\s+\S*$/, "") + "…" : text;
}

// The form key is stamped mechanically by namespace — the light mirror of
// the factType reservation table (Vol. 04 §6).
function formOf(tuple: WaveTuple): TraceRowForm {
  if (tuple.kind === "sys.knot.defined" || tuple.kind === "sys.descriptor.defined") {
    return "row.topology";
  }
  if (tuple.kind === "sys.knot.ready") return "row.readiness";
  const label = labelOf(tuple);
  if (label.startsWith("inference.")) return "row.inference";
  if (label.startsWith("service.")) return "row.service";
  if (label.startsWith("learning.")) return "row.learning";
  return "row.generic";
}

// — the row-former registry: each former claims tuples the way collection
// rules and controller claims do elsewhere in the machine; first claim
// wins in declared order; the generic former closes the chain —
type RowFormer = {
  id: string;
  claims: (tuple: WaveTuple) => boolean;
  describe: (tuple: WaveTuple) => { actor: TraceActor; summary: string };
};

const factFormer = (
  factType: string,
  describe: (d: Record<string, unknown>, tuple: WaveTuple) => { actor: TraceActor; summary: string }
): RowFormer => ({
  id: factType,
  claims: (tuple) => labelOf(tuple) === factType && tuple.kind === "domain.fact",
  describe: (tuple) => describe(factDataOf(tuple), tuple)
});

const sourceNote = (d: Record<string, unknown>): string =>
  d.source ? ` (${d.source})` : "";

const rowFormers: readonly RowFormer[] = [
  {
    id: "sys.knot.defined",
    claims: (t) => t.kind === "sys.knot.defined",
    describe: (t) => {
      const p = payloadOf(t);
      const config = p.config as { condition?: { questions?: string[] } } | undefined;
      return {
        actor: "machine",
        summary: `knot ${p.id} registered — "${truncate(String(config?.condition?.questions?.[0] ?? ""), 70)}"`
      };
    }
  },
  {
    id: "sys.descriptor.defined",
    claims: (t) => t.kind === "sys.descriptor.defined",
    describe: (t) => {
      const p = payloadOf(t);
      const operator = p.operator as { demands?: unknown[]; return_to?: string } | undefined;
      return {
        actor: "machine",
        summary: `close bind ${p.id} registered — ${operator?.demands?.length ?? 0} demands${
          operator?.return_to ? `, returns to ${operator.return_to}` : ""
        }`
      };
    }
  },
  {
    id: "sys.knot.ready",
    claims: (t) => t.kind === "sys.knot.ready",
    describe: (t) => {
      const p = payloadOf(t);
      const understanding = p.understanding as { grade?: number } | undefined;
      return {
        actor: "machine",
        summary: `readiness reified — ${p.knotId} (grade ${Number(understanding?.grade ?? 0).toFixed(2)})`
      };
    }
  },
  factFormer("learning.session.opened", (d) => {
    const subject = d.subject as { title?: string; text?: string } | undefined;
    return {
      actor: "learner",
      summary: `session opened — ${truncate(String(subject?.title ?? subject?.text ?? ""), 70)}`
    };
  }),
  factFormer("learning.source.declared", (d) => ({
    actor: "learner",
    summary: `source declared on the shelf — ${truncate(String((d.resource as { title?: string })?.title ?? ""), 64)}`
  })),
  factFormer("learning.source.presented", (d) => ({
    actor: "machine",
    summary: `source presented to ${d.knotId ?? d.bindId} — ${truncate(String((d.resource as { title?: string })?.title ?? ""), 54)}`
  })),
  factFormer("learning.turn.submitted", (d) => {
    if (d.operator) {
      return { actor: "learner", summary: `turn — operator ${(d.operator as { id?: string }).id} requested` };
    }
    if (d.targetKnotId) {
      return { actor: "learner", summary: `turn — ${d.vector ?? "answer"} aimed at ${d.targetKnotId}` };
    }
    return { actor: "learner", summary: `plain signal — "${truncate(String(d.text ?? ""), 70)}"` };
  }),
  factFormer("learning.bind.selected", (d) => ({
    actor: "machine",
    summary: `bind ${d.bindId} selected (operator ${d.operatorId})`
  })),
  factFormer("service.request", (d) => ({
    actor: "machine",
    summary: `${d.bindId} gathered its scope and projected intention ${d.uid}`
  })),
  factFormer("service.failed", (d) => ({
    actor: "world",
    summary: `service failed — ${truncate(String(d.reason ?? ""), 70)}`
  })),
  factFormer("learning.knot.seeded", (d) => ({
    actor: "machine",
    summary: `head fact seeded ${d.knot} — angle "${d.angle}"`
  })),
  factFormer("learning.scene.unfolded", (d) => {
    const result = d.result as { title?: string } | undefined;
    return {
      actor: "world",
      summary: `scene published — "${truncate(String(result?.title ?? ""), 60)}"${sourceNote(d)}`
    };
  }),
  factFormer("learning.answer.submitted", (d) => ({
    actor: "learner",
    summary: `${d.vector ?? "answer"} → ${d.knotId}: "${truncate(String(d.answer ?? ""), 60)}"`
  })),
  factFormer("learning.evidence.registered", (d) => ({
    actor: "machine",
    summary: `evidence registered → ${d.knotId} (${(d.excerpts as unknown[])?.length ?? 0} excerpts)`
  })),
  factFormer("inference.request", (d) => ({
    actor: "machine",
    summary: `${d.knotId} projected winding intention ${d.uid} (${(d.deltas as unknown[])?.length ?? 0} deltas)`
  })),
  factFormer("inference.response", (d) => ({
    actor: "world",
    summary: `world integrated → ${d.knotId}, grade ${Number(d.grade ?? 0).toFixed(2)}${sourceNote(d)}`
  })),
  factFormer("inference.reasoning", (d) => ({
    actor: "world",
    summary: `reasoning behind ${d.uid}`
  })),
  factFormer("inference.failed", (d) => ({
    actor: "world",
    summary: `winding failed — ${truncate(String(d.reason ?? ""), 70)}`
  })),
  factFormer("learning.knot.marked", (d) => ({
    actor: "learner",
    summary: `marked explicitly unknown — ${d.knotId}`
  })),
  factFormer("learning.integration.candidate", (d) => ({
    actor: "world",
    summary: `${d.bindId} published the integration candidate${sourceNote(d)}`
  })),
  factFormer("learning.integration.returned", (d) => ({
    actor: "world",
    summary: `${d.bindId} published the return → ${d.parentKnotId}${sourceNote(d)}`
  })),
  factFormer("learning.integration.accepted", (d) => ({
    actor: "learner",
    summary: `accepted — released as ${d.valueId}`
  })),
  factFormer("learning.session.result.candidate", () => ({
    actor: "machine",
    summary: "result candidate assembled — the completion gate passed"
  })),
  factFormer("learning.session.completed", () => ({
    actor: "learner",
    summary: "session completed — attested"
  })),
  // The total-coverage floor: an unknown future factType still rows
  // (Vol. 04 §1.2 tolerant reading).
  {
    id: "generic",
    claims: () => true,
    describe: (t) => ({ actor: "machine", summary: labelOf(t) })
  }
];

export function formRow(tuple: WaveTuple): TraceRow {
  const former = rowFormers.find((f) => f.claims(tuple)) ?? rowFormers[rowFormers.length - 1];
  const { actor, summary } = former.describe(tuple);
  const uid = factDataOf(tuple).uid;
  return {
    offset: tuple.offset,
    actor,
    summary,
    label: labelOf(tuple),
    ...(typeof uid === "string" ? { uid } : {}),
    form: formOf(tuple)
  };
}
