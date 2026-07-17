// The session-command bodies of the UI↔backend API (ADR-004 Decision 1) —
// the target session-contract shapes, kept narrow. Interpretation precedence
// (target knot → answer; operator → configured bind request; neither → plain
// signal) is spec/first-turn-log-protocol.md; the handlers live in the
// machine as its folded-in ingress mapper — a documented v0 liberty that
// dissolves at the core swap, when the mapper moves into this region.

import type { OperatorId, VectorId, WaveTuple } from "@/nest/wave/envelope";

export type TurnBody = {
  text: string;
  targetKnotId?: string | null;
  vector?: VectorId | null;
  operator?: { id: OperatorId; parameters?: Record<string, unknown> } | null;
  sourceRefs?: string[];
  excludedSourceRefs?: string[];
  focusRef?: string;
};

// "integrate" is deliberately absent: a scene's close bind publishes itself
// when its barrier settles (Vol. 06 §4); the human decision is acceptance.
export type DecisionBody =
  | { kind: "evidence"; knotId: string; query?: string }
  | { kind: "readSource"; knotId: string; store: string; ref: string }
  | { kind: "deepen"; knotId: string }
  | { kind: "accept"; bindId: string; candidateOffset: number }
  | { kind: "markUnknown"; knotId: string }
  | { kind: "finish" }
  | { kind: "attest"; resultOffset: number };

export type CommandResult = {
  tuples: WaveTuple[];
  refused?: { reasons: string[] };
};
