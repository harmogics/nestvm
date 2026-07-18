import "server-only";

// The formation-side manifest (ADR-010 Decision 3): a projector declares
// the contract it forms and the reads its fold consumes. The claims
// filter is derived from the declaration mechanically (`matchesReads`),
// so declaration and enforcement cannot drift — the single-source rule.

import type { WaveTuple } from "@/nest/wave/envelope";

export type ReadsDeclaration = {
  kinds?: readonly string[]; // envelope kinds beyond domain.fact
  factTypes: readonly string[] | "*"; // '*' is the observer-class claim
  joins: readonly string[]; // correlation fields the fold uses
};

export type ProjectorManifest = {
  contract: string; // the snapshot contract id, e.g. 'scene-registry'
  reads: ReadsDeclaration;
};

export function matchesReads(reads: ReadsDeclaration, tuple: WaveTuple): boolean {
  if (reads.kinds?.includes(tuple.kind)) return true;
  if (tuple.kind !== "domain.fact") return false;
  if (reads.factTypes === "*") return true;
  const factType = (tuple.payload as { factType?: string }).factType;
  return typeof factType === "string" && reads.factTypes.includes(factType);
}
