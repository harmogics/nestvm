// The derived-reading view shapes: what project() builds from the tuple log.
// Pure data produced only by the readings of this region — no store, no
// fetch, no browser state (Vol. 08 §8 derivation discipline; ADR-005
// Decision 1). Surfaces consume these shapes; they never reconstruct them.

import type {
  EvidenceExcerpt,
  OperatorId,
  ResourceRef,
  SessionSubject
} from "@/nest/wave/envelope";

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
  threshold: number;
  budget?: number;
  state: string;
  grade: number;
  ready: boolean;
  readyOffset?: number;
  unknown: boolean;
  returned: boolean;
  returnOffset?: number;
  tacts: WindingTact[];
  evidence: EvidenceExcerpt[];
  sources: ResourceRef[];
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
  closeBindId?: string;
  closeInstruction?: string;
  returnTo?: string;
  status: "projecting" | "active" | "candidate" | "integrated";
  reframeOffset?: number; // for reframe scenes: the produced tuple being read
  sources: ResourceRef[];
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
  sources: ResourceRef[];
  scenes: SceneView[];
  values: ValueView[];
  openQuestions: string[];
  result?: { offset: number; document: ResultDocument };
  completedOffset?: number;
  counts: { tuples: number; unanswered: number; failures: number };
};
