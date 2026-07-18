import "server-only";

// The scene-registry projector — forms the scene-registry contract from
// the wave log (ADR-010): every bind's card with parent/child links and
// attention flags. Claims are the manifest below, applied mechanically by
// the runtime; ownership resolves by provenance joins (`emittedBy`,
// close-bind registration), never adjacency (Vol. 03 §3.3). Pure over the
// log: replay reproduces the snapshot byte-identically.

import type { DomainFactPayload } from "@/nest/wave/envelope";
import {
  SCENE_REGISTRY,
  type SceneCard,
  type SceneRegistrySnapshot
} from "@/huid/contracts/scene-registry";
import type { ProjectorManifest } from "./manifest";
import type { SnapshotProjector } from "./runtime";

const manifest: ProjectorManifest = {
  contract: SCENE_REGISTRY,
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
  }
};

type SceneRegistryFoldState = {
  cards: SceneCard[];
  byBind: Map<string, SceneCard>;
  bindOfClose: Map<string, string>; // close-bind id → scene bind id
  bindOfKnot: Map<string, string>; // knot id → scene bind id (via emittedBy)
};

function bindOfUid(uid: string): string {
  return uid.split("#")[0];
}

export const sceneRegistryProjector: SnapshotProjector<SceneRegistryFoldState, SceneRegistrySnapshot> = {
  manifest,

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
        const card: SceneCard = {
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
