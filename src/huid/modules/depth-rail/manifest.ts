import type { ModuleManifest } from "../../manifest";

// The depth rail — chosen depth (ADR-003): child scenes of the focused
// scene, and the whole scene registry once more than one scene exists.
// Projector-backed since ADR-009: `reads` below are the executable claims
// of its server half (src/huid/projectors/depth.ts) — exactly what the
// fold consumes; the client half receives the formed snapshot and applies
// only the focus parameter. Every gesture is navigation — the rail never
// commits.
export const depthRailManifest: ModuleManifest = {
  id: "right.depth",
  title: "Depth — child scenes",
  dock: "right",
  reads: {
    kinds: ["sys.knot.defined", "sys.descriptor.defined"],
    factTypes: [
      "learning.bind.selected",
      "learning.scene.unfolded",
      "learning.integration.candidate",
      "learning.integration.returned",
      "learning.integration.accepted",
      "inference.failed",
      "service.failed"
    ],
    joins: ["bindId", "parentBindId", "emittedBy", "knotId", "uid"]
  },
  derives: [],
  params: ["focus.bindId"],
  commits: [],
  navigates: ["focus.bindId"]
};
