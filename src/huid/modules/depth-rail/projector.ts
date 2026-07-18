// The server half of the depth-rail module (HUID 02 §8, ADR-009): a pure
// fold from the manifest's claims to the wire model. This file states only
// WHAT the panel's formation is; the server-only HOW — commit-hook
// subscription, caches, catch-up, routes — lives in the projector plane
// (src/huid/projectors/) and never inside a module. Claims are derived
// from the manifest (single source): what is declared is exactly what the
// fold is fed. Ownership resolves by provenance joins (`emittedBy`,
// close-bind registration), never adjacency (Vol. 03 §3.3).

import type { DomainFactPayload } from "@/nest/wave/envelope";
import { matchesReads } from "../../manifest";
import type { PanelProjector } from "../../projectors/runtime";
import { depthRailManifest } from "./manifest";
import type { DepthPanelModel, DepthSceneCard } from "./model";

type DepthFoldState = {
  cards: DepthSceneCard[];
  byBind: Map<string, DepthSceneCard>;
  bindOfClose: Map<string, string>; // close-bind id → scene bind id
  bindOfKnot: Map<string, string>; // knot id → scene bind id (via emittedBy)
};

function bindOfUid(uid: string): string {
  return uid.split("#")[0];
}

export const depthProjector: PanelProjector<DepthFoldState, DepthPanelModel> = {
  manifestId: depthRailManifest.id,

  claims: (tuple) => matchesReads(depthRailManifest.reads, tuple),

  init: () => ({ cards: [], byBind: new Map(), bindOfClose: new Map(), bindOfKnot: new Map() }),

  step(state, tuple) {
    if (tuple.kind === "sys.knot.defined") {
      const payload = tuple.payload as { id?: string; emittedBy?: string };
      if (payload.id && payload.emittedBy) state.bindOfKnot.set(payload.id, bindOfUid(payload.emittedBy));
      return state;
    }
    if (tuple.kind === "sys.descriptor.defined") {
      const payload = tuple.payload as { id?: string; emittedBy?: string };
      if (payload.id && payload.emittedBy) state.bindOfClose.set(payload.id, bindOfUid(payload.emittedBy));
      return state;
    }
    const payload = tuple.payload as DomainFactPayload;
    const d = payload.data ?? {};
    switch (payload.factType) {
      case "learning.bind.selected": {
        const card: DepthSceneCard = {
          bindId: String(d.bindId ?? ""),
          parentBindId: d.parentBindId ? String(d.parentBindId) : undefined,
          sourceKnotId: d.sourceKnotId ? String(d.sourceKnotId) : undefined,
          title: String(d.title ?? "Scene forming"),
          status: "projecting",
          awaitingReview: false,
          stalled: false
        };
        state.cards.push(card);
        state.byBind.set(card.bindId, card);
        break;
      }
      case "learning.scene.unfolded": {
        const card = state.byBind.get(String(d.bindId ?? ""));
        const result = (d.result ?? {}) as { title?: string };
        if (card) {
          card.title = result.title ?? card.title;
          card.status = "active";
        }
        break;
      }
      case "learning.integration.candidate":
      case "learning.integration.returned": {
        const closeId = String(d.bindId ?? "");
        const card =
          state.byBind.get(state.bindOfClose.get(closeId) ?? "") ?? state.byBind.get(closeId);
        if (card && card.status !== "integrated") {
          card.status = "candidate";
          card.awaitingReview = true;
        }
        break;
      }
      case "learning.integration.accepted": {
        const card = state.byBind.get(String(d.bindId ?? ""));
        if (card) {
          card.status = "integrated";
          card.awaitingReview = false;
        }
        break;
      }
      case "inference.failed": {
        const card = state.byBind.get(state.bindOfKnot.get(String(d.knotId ?? "")) ?? "");
        if (card) card.stalled = true;
        break;
      }
      case "service.failed": {
        const owner = String(d.bindId ?? "");
        const card =
          state.byBind.get(owner) ?? state.byBind.get(state.bindOfClose.get(owner) ?? "");
        if (card) card.stalled = true;
        break;
      }
      default:
        break;
    }
    return state;
  },

  snapshot: (state) => ({ scenes: state.cards.map((card) => ({ ...card })) })
};
