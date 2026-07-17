// The wire vocabulary of the simulated NestVM study machine — the wave level.
//
// The envelope reuses the wave-tuple shape of Vol. 03 §1 verbatim so that the
// UI built against this simulation can later consume real Nest logs unchanged.
// Product facts live in the `learning.*` namespace (the Nest Education seed,
// Vol. 13 §5); the simulated winding and service protocols reuse the
// `inference.*` / `service.*` payload contracts of Vol. 04 §4–5. Payload
// conventions carried inside tuples (resource references, evidence excerpts,
// operator and vector ids) live here too: they are the log's language, shared
// by every level above. Run metadata is marked `simulated` — this store is a
// rehearsal of the machine, not the machine.

export type WaveTuple<P = unknown> = Readonly<{
  offset: number;
  kind: string; // 'domain.fact' | 'sys.knot.ready'
  key: string | null;
  payload: P;
}>;

export type WaveEmission<P = unknown> = Omit<WaveTuple<P>, "offset">;

export type DomainFactPayload = {
  factType: string;
  data: Record<string, unknown>;
};

export type SessionSubject =
  | { kind: "volume"; ref: string; title: string }
  | { kind: "question"; text: string };

export type SessionMeta = {
  id: string;
  createdAt: string;
  petal: string;
  subject: SessionSubject;
  resultContract: string;
  status: "open" | "completed";
  class: "simulated";
  tuples: number;
};

export type OperatorId = "unfold" | "deepen" | "reframe";
export type VectorId = "answer" | "challenge" | "evidence" | "unknown";

export type EvidenceExcerpt = {
  volume: string;
  section: string;
  slug: string;
  anchor: string;
  excerpt: string;
};

// A reference to an internal document carried by a tuple: the log stays
// bounded (ref + digest + excerpt); content is resolved at attention time
// through the pluggable ResourceResolver (ADR-004 Decision 5).
export type ResourceRef = {
  store: "spec" | "workshop" | "wave";
  ref: string; // '05-activation-knots#3-…' | draftId | 'offset:42'
  digest?: string;
  title?: string;
  excerpt?: string;
};
