// The trace contract — the record lens's data product (proposal-centre-dock
// §3.3; seed §4.3): one bounded row per committed tuple, actor-classified,
// in offset order. Payloads never ride this wire (Vol. 03 §8; CONVENTIONS
// §1.4) — the raw record is one disclosure away through the Class L
// tuples-by-offset endpoint. Types only; erased at build (ADR-010 D1).

export const TRACE = "trace";

// Who moved: the learner supplies facts and judgement, the machine's own
// structures register, wind and gather, the world behind the membrane
// answers.
export type TraceActor = "learner" | "machine" | "world";

// The form-key vocabulary of this contract — a light mirror of the
// factType namespaces (Vol. 04 §6; the factType idiom, CONVENTIONS §1.5).
// Stamped mechanically by namespace; richer per-factType forms grow by
// former registration (ADR-008 D3), additively. Governance:
// proposal-centre-dock §12.3.6 — keys live beside their contract.
export type TraceRowForm =
  | "row.topology" // sys.knot.defined · sys.descriptor.defined
  | "row.readiness" // sys.knot.ready
  | "row.inference" // the winding protocol
  | "row.service" // the operator protocol
  | "row.learning" // the learning.* product facts
  | "row.generic"; // the total-coverage floor

export type TraceRow = {
  offset: number; // the truth anchor; raw truth one disclosure away
  actor: TraceActor;
  summary: string; // bounded at formation
  label: string; // envelope kind, or factType for domain facts
  uid?: string; // correlation identity where the payload carries one
  form: TraceRowForm;
};

export type TraceSnapshot = { rows: TraceRow[] };
