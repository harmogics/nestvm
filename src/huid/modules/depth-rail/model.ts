// The wire model of the depth-rail panel — the contract between the
// module's server half (the projector) and its client half (select +
// view). Parameter-independent: focus is applied client-side by `select`.
// The attention flags serve the rail's recorded successor, the attention
// queue (manifest-of-conscious-movement §7.3).

export type DepthSceneCard = {
  bindId: string;
  parentBindId?: string;
  sourceKnotId?: string;
  title: string;
  status: "projecting" | "active" | "candidate" | "integrated";
  awaitingReview: boolean; // a published integration not yet accepted
  stalled: boolean; // a *.failed answer landed within the scene
};

export type DepthPanelModel = {
  scenes: DepthSceneCard[];
};
