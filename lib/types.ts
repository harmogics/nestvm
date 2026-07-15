// Shared vocabulary of the simulated NestVM study machine.
//
// The envelope reuses the wave-tuple shape of Vol. 03 §1 verbatim so that the
// UI built against this simulation can later consume real Nest logs unchanged.
// Product facts live in the `learning.*` namespace (the Nest Education seed,
// Vol. 13 §5); the simulated winding and service protocols reuse the
// `inference.*` / `service.*` payload contracts of Vol. 04 §4–5. Run metadata
// is marked `simulated` — this store is a rehearsal of the machine, not the
// machine.

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

export type OperatorId = "unfold" | "deepen" | "integrate";
export type VectorId = "answer" | "challenge" | "evidence" | "unknown";

// ---------------------------------------------------------------------------
// Projection (derived reading) — a pure function of the tuple log builds this.
// ---------------------------------------------------------------------------

export type EvidenceExcerpt = {
  volume: string;
  section: string;
  slug: string;
  anchor: string;
  excerpt: string;
};

export type WindingTact = {
  uid: string;
  requestOffset: number;
  responseOffset?: number;
  grade?: number;
  reasoningOffset?: number;
  failedOffset?: number;
  failedReason?: string;
  deltas: string[];
  source?: string;
};

export type KnotView = {
  knotId: string;
  bindId: string;
  question: string;
  angle: string;
  lane: string;
  state: string;
  grade: number;
  ready: boolean;
  readyOffset?: number;
  unknown: boolean;
  tacts: WindingTact[];
  evidence: EvidenceExcerpt[];
  answers: { text: string; vector: string; offset: number }[];
  childBindId?: string;
  returnedValueId?: string;
};

export type IntegrationCandidate = {
  offset: number;
  uid: string;
  statement: string;
  contributions: { source: string; note: string }[];
  openQuestions: string[];
  uncertainties: string[];
};

export type SceneView = {
  bindId: string;
  parentBindId?: string;
  sourceKnotId?: string;
  title: string;
  purpose: string;
  operatorId: OperatorId;
  selectedOffset: number;
  requestUid?: string;
  status: "projecting" | "active" | "candidate" | "integrated";
  knots: KnotView[];
  candidate?: IntegrationCandidate;
  integratedValueId?: string;
};

export type ValueView = {
  valueId: string;
  title: string;
  statement: string;
  bindId: string;
  candidateOffset: number;
  acceptedOffset: number;
  contributions: { source: string; note: string }[];
  openQuestions: string[];
  returnedToKnotId?: string;
};

export type RootMaterial = {
  turnId: string;
  offset: number;
  text: string;
};

export type ResultDocument = {
  statement: string;
  values: { valueId: string; title: string; statement: string }[];
  openQuestions: string[];
  evidenceCount: number;
};

export type SessionProjection = {
  sessionId: string;
  petal: string;
  subject: SessionSubject;
  resultContract: string;
  status: "open" | "completed";
  rootMaterials: RootMaterial[];
  scenes: SceneView[];
  values: ValueView[];
  openQuestions: string[];
  result?: { offset: number; document: ResultDocument };
  completedOffset?: number;
  counts: { tuples: number; unanswered: number; failures: number };
};

// ---------------------------------------------------------------------------
// API request bodies (the target session-contract shapes, kept narrow).
// ---------------------------------------------------------------------------

export type TurnBody = {
  text: string;
  targetKnotId?: string | null;
  vector?: VectorId | null;
  operator?: { id: OperatorId; parameters?: Record<string, unknown> } | null;
  sourceRefs?: string[];
  excludedSourceRefs?: string[];
  focusRef?: string;
};

export type DecisionBody =
  | { kind: "evidence"; knotId: string; query?: string }
  | { kind: "deepen"; knotId: string }
  | { kind: "integrate"; bindId: string }
  | { kind: "accept"; bindId: string; candidateOffset: number }
  | { kind: "markUnknown"; knotId: string }
  | { kind: "finish" }
  | { kind: "attest"; resultOffset: number };

export type CommandResult = {
  tuples: WaveTuple[];
  refused?: { reasons: string[] };
};
