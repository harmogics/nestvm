import { SCENE_REGISTRY } from "../../contracts/scene-registry";
import type { ModuleManifest } from "../../manifest";

// The depth rail — chosen depth (ADR-003): child scenes of the focused
// scene, and the whole scene registry once more than one scene exists.
// Presentation-side only (ADR-010): the panel consumes the scene-registry
// contract; the formation declaration lives with the projector
// (src/huid/projectors/scene-registry.ts). Every gesture is navigation —
// the rail never commits.
export const depthRailManifest: ModuleManifest = {
  id: "right.depth",
  title: "Depth — child scenes",
  dock: "right",
  consumes: [SCENE_REGISTRY],
  params: ["focus.bindId"],
  commits: [],
  navigates: ["focus.bindId"]
};
