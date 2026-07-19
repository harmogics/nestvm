// The presentation-side module manifest (HUID 02 §1, ADR-010): a panel
// declares which snapshot contracts it consumes, where it docks, which
// parameters it reads and writes, and which declared bodies its controls
// shape. Formation declarations (`reads`) live with the projectors
// (src/huid/projectors/manifest.ts) — presentation declares what it
// consumes, never what the log contains.

import type { CommandResult, DecisionBody, TurnBody } from "@/product/commands";

export type ModuleDock = "strip" | "left" | "centre" | "right" | "composer";

export type ModuleManifest = {
  id: string;
  title: string;
  dock: ModuleDock;
  order?: number;
  consumes: readonly string[]; // snapshot contract ids the panel is fed
  params?: readonly string[]; // parameter keys read
  commits?: readonly string[]; // decision kinds / operator ids shaped
  navigates?: readonly string[]; // parameter keys written
  // reserved key: claims — obligation sockets (ADR-005 §1.4), not yet open
};

// The module port — the presentation side's two verbs (HUID 01 §5,
// HUID 02 §1): `commit` shapes a declared body through the one session-API
// client, `navigate` patches the parameter space. Nothing else crosses the
// board; a module that fetches has left the contract.
export type ModulePort = {
  commit(body: TurnBody | DecisionBody): Promise<CommandResult | null>;
  navigate(patch: Readonly<Record<string, unknown>>): void;
};
