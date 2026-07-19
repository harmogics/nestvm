// The scene-detail contract — the figure lens's data product
// (design_proposal §3.1; seed §4.1): every scene in depth, kneaded,
// parameter-free — `select` picks the focus client-side. Cards are
// projections of committed tuples only (Vol. 02 §4.7): definition
// records, winding-protocol tuples and readiness snapshots. The strata
// carry the scene's own record as summarised rows (ADR-005 D3, one lid
// per bind) in the shared row vocabulary — a deliberate, recorded
// coupling to the trace row shape (§12.5.1: one row-former registry in
// the plane). Bounded at formation: tact rows carry counts and grades,
// never delta bodies; the raw record is one disclosure away. Types only;
// erased at build (ADR-010 D1).

import type { EvidenceExcerpt, ResourceRef } from "@/nest/wave/envelope";
import type { TraceRow } from "./trace";

export const SCENE_DETAIL = "scene-detail";

export type WindingTactDetail = {
  uid: string;
  requestOffset: number;
  responseOffset?: number;
  grade?: number;
  reasoningOffset?: number;
  failedOffset?: number;
  failedReason?: string;
  deltaCount: number; // bounded: bodies never ride the wire
  source?: string;
};

export type KnotDetail = {
  knotId: string;
  bindId: string;
  question: string;
  angle: string;
  lane: string;
  threshold: number;
  budget?: number;
  state: string; // the last integrated understanding the world returned
  grade: number;
  ready: boolean;
  readyOffset?: number;
  unknown: boolean;
  returned: boolean;
  returnOffset?: number;
  returnedValueId?: string;
  childBindId?: string;
  tacts: WindingTactDetail[];
  evidence: EvidenceExcerpt[];
  sources: ResourceRef[];
  answers: { text: string; vector: string; offset: number }[];
};

export type SceneCandidate = {
  offset: number;
  uid: string;
  statement: string;
  contributions: { source: string; note: string }[];
  openQuestions: string[];
  uncertainties: string[];
};

export type SceneStrata = {
  admission: TraceRow[]; // the human gesture and its deterministic admission
  sowing: TraceRow[]; // the intention, the sown topology, the terminal publication, presented sources
  harvest: TraceRow[]; // the close bind's own publications and the acceptance
};

export type SceneDetail = {
  bindId: string;
  parentBindId?: string;
  sourceKnotId?: string;
  title: string;
  purpose: string;
  operatorId: string;
  selectedOffset: number;
  requestUid?: string;
  closeBindId?: string;
  closeInstruction?: string;
  returnTo?: string;
  status: "projecting" | "active" | "candidate" | "integrated";
  stalled: boolean;
  reframeOffset?: number;
  sources: ResourceRef[]; // presented to the scene (the context registry)
  knots: KnotDetail[];
  barrier: { settled: number; total: number };
  strata: SceneStrata;
  candidate?: SceneCandidate;
  integratedValueId?: string;
};

export type SceneDetailSnapshot = { scenes: SceneDetail[] };
