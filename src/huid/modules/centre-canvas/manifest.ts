import { PRODUCED_TEXTS } from "../../contracts/produced-texts";
import type { ModuleManifest } from "../../manifest";

// The document lens (centre carousel) — the session's produced texts in
// offset order, brought close to a business artefact. Block-kind toggles
// are the module's namespaced parameters (applied in select — the wire
// carries every kind); Accept is its one commit; opening a block's bind
// and retargeting the composer to a reframe are navigation on host keys
// (seed §4.5). Formation lives with the produced-texts projector.
export const centreCanvasManifest: ModuleManifest = {
  id: "centre.canvas",
  title: "canvas",
  dock: "centre",
  consumes: [PRODUCED_TEXTS],
  params: [
    "centre.canvas.turns",
    "centre.canvas.answers",
    "centre.canvas.evidence",
    "session.busy",
    "session.status"
  ],
  commits: ["accept"],
  navigates: [
    "centre.canvas.turns",
    "centre.canvas.answers",
    "centre.canvas.evidence",
    "focus.bindId",
    "centre.view",
    "composer.target"
  ]
};
