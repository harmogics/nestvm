// The module manifest of HUID 02 §1 — the first seated piece of the device
// layer's code. A module declares what it reads, which parameters it uses,
// and which gestures it shapes; the host (arriving with migration step 2,
// HUID 03 §6) will enforce `reads` physically by filtering the feed. Until
// then the manifest is the review surface beside each module.

import type { WaveTuple } from "@/nest/wave/envelope";

export type ModuleDock = "strip" | "left" | "centre" | "right" | "composer";

export type ModuleManifest = {
  id: string;
  title: string;
  dock: ModuleDock;
  order?: number;
  reads: {
    kinds?: readonly string[];
    factTypes: readonly string[] | "*"; // '*' is the observer-class claim
    joins: readonly string[];
  };
  derives?: readonly ("projection" | "canvas" | "trace" | "strata")[];
  params?: readonly string[];
  commits?: readonly string[];
  navigates?: readonly string[];
  // reserved key: claims — obligation sockets (ADR-005 §1.4), not yet open
};

// The manifest's `reads`, executable (HUID 02 §8): the single source both
// halves share — a projector's claims filter is derived from it here, so
// declaration and enforcement cannot drift.
export function matchesReads(reads: ModuleManifest["reads"], tuple: WaveTuple): boolean {
  if (reads.kinds?.includes(tuple.kind)) return true;
  if (tuple.kind !== "domain.fact") return false;
  if (reads.factTypes === "*") return true;
  const factType = (tuple.payload as { factType?: string }).factType;
  return typeof factType === "string" && reads.factTypes.includes(factType);
}
