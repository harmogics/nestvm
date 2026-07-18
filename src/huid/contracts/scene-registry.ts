// The scene-registry snapshot contract (ADR-010): the wire shape formed
// by its projector (src/huid/projectors/scene-registry.ts) and consumed
// by any number of panels — the depth rail today, a graphical map
// tomorrow. Types plus the contract id constant only — erased at build;
// the sole compile-time join between formation and presentation. Shapes
// evolve additively; a breaking change is a new contract id.

export const SCENE_REGISTRY = "scene-registry";

export type SceneCard = {
  bindId: string;
  parentBindId?: string;
  sourceKnotId?: string;
  title: string;
  status: "projecting" | "active" | "candidate" | "integrated";
  awaitingReview: boolean; // a published integration not yet accepted
  stalled: boolean; // a *.failed answer landed within the scene
};

export type SceneRegistrySnapshot = {
  scenes: SceneCard[];
};
