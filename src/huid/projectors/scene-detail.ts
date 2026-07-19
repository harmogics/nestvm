import "server-only";

// The scene-detail projector — the figure lens's formation
// (design_proposal §3.1): the kneaded product of every scene in depth,
// ported from the client projection at the centre migration's last step.
// Ownership resolves by provenance joins only (`emittedBy`, close-bind
// registration, knotId + uid correlation — Vol. 03 §3.3); registers are
// never read (Vol. 02 §4.7): the wound state and grade come from the
// committed inference.response, readiness from sys.knot.ready. The
// strata group the scene's record by its three causal acts (ADR-005 D3)
// as rows through the shared row-former registry (§12.5.1).

import {
  SCENE_DETAIL,
  type KnotDetail,
  type SceneCandidate,
  type SceneDetail,
  type SceneDetailSnapshot
} from "@/huid/contracts/scene-detail";
import type { TraceRow } from "@/huid/contracts/trace";
import type { DomainFactPayload, EvidenceExcerpt, ResourceRef, WaveTuple } from "@/nest/wave/envelope";
import type { ProjectorManifest } from "./manifest";
import { formRow } from "./row-formers";
import type { SnapshotProjector } from "./runtime";

const manifest: ProjectorManifest = {
  contract: SCENE_DETAIL,
  reads: {
    kinds: ["sys.knot.defined", "sys.descriptor.defined", "sys.knot.ready"],
    factTypes: [
      "learning.turn.submitted",
      "learning.bind.selected",
      "learning.scene.unfolded",
      "learning.knot.seeded",
      "learning.answer.submitted",
      "learning.source.presented",
      "learning.evidence.registered",
      "learning.knot.marked",
      "learning.integration.candidate",
      "learning.integration.returned",
      "learning.integration.accepted",
      "inference.request",
      "inference.response",
      "inference.reasoning",
      "inference.failed",
      "service.request",
      "service.failed"
    ],
    joins: ["bindId", "parentBindId", "sourceKnotId", "knotId", "uid", "emittedBy", "turnId"]
  }
};

type SceneDetailFoldState = {
  scenes: SceneDetail[];
  byBind: Map<string, SceneDetail>;
  byClose: Map<string, SceneDetail>;
  knots: Map<string, KnotDetail>;
  operatorTurnRows: Map<string, TraceRow>; // turnId → its admission row
};

function bindOfUid(uid: string): string {
  return uid.split("#")[0];
}

export const sceneDetailProjector: SnapshotProjector<SceneDetailFoldState, SceneDetailSnapshot> = {
  manifest,

  init: () => ({
    scenes: [],
    byBind: new Map(),
    byClose: new Map(),
    knots: new Map(),
    operatorTurnRows: new Map()
  }),

  step(state, tuple) {
    const sceneOfUid = (uid: string) => state.byBind.get(bindOfUid(uid));

    if (tuple.kind === "sys.knot.ready") {
      const payload = tuple.payload as { knotId: string };
      const knot = state.knots.get(payload.knotId);
      if (knot) {
        knot.ready = true;
        knot.readyOffset = tuple.offset;
      }
      return state;
    }

    if (tuple.kind === "sys.knot.defined") {
      const payload = tuple.payload as {
        id: string;
        config?: {
          wind?: { lane?: string; budget?: number };
          condition?: { questions?: string[]; threshold_grade?: number };
        };
        emittedBy?: string;
      };
      const scene = payload.emittedBy ? sceneOfUid(payload.emittedBy) : undefined;
      const knot: KnotDetail = {
        knotId: payload.id,
        bindId: scene?.bindId ?? "",
        question: payload.config?.condition?.questions?.[0] ?? payload.id,
        angle: "",
        lane: payload.config?.wind?.lane ?? "",
        threshold: payload.config?.condition?.threshold_grade ?? 0.7,
        budget: payload.config?.wind?.budget,
        state: "",
        grade: 0,
        ready: false,
        unknown: false,
        returned: false,
        tacts: [],
        evidence: [],
        sources: [],
        answers: []
      };
      state.knots.set(knot.knotId, knot);
      if (scene) {
        scene.knots.push(knot);
        scene.strata.sowing.push(formRow(tuple));
      }
      return state;
    }

    if (tuple.kind === "sys.descriptor.defined") {
      const payload = tuple.payload as {
        id: string;
        operator?: { service?: { instruction?: string }; return_to?: string };
        emittedBy?: string;
      };
      const scene = payload.emittedBy ? sceneOfUid(payload.emittedBy) : undefined;
      if (scene) {
        scene.closeBindId = payload.id;
        scene.closeInstruction = payload.operator?.service?.instruction;
        scene.returnTo = payload.operator?.return_to;
        state.byClose.set(payload.id, scene);
        scene.strata.sowing.push(formRow(tuple));
      }
      return state;
    }

    const payload = tuple.payload as DomainFactPayload;
    const d = (payload.data ?? {}) as Record<string, unknown>;

    switch (payload.factType) {
      case "learning.turn.submitted": {
        // Operator turns open scenes: their admission row waits for the
        // bind selection that references the turn id.
        if (d.operator && d.turnId) {
          state.operatorTurnRows.set(String(d.turnId), formRow(tuple));
        }
        break;
      }
      case "learning.bind.selected": {
        const bindId = String(d.bindId ?? "");
        const parameters = (d.parameters ?? {}) as { targetOffset?: number };
        const scene: SceneDetail = {
          bindId,
          parentBindId: d.parentBindId ? String(d.parentBindId) : undefined,
          sourceKnotId: d.sourceKnotId ? String(d.sourceKnotId) : undefined,
          title: String(d.title ?? "Scene forming"),
          purpose: "",
          operatorId: String(d.operatorId ?? "unfold"),
          selectedOffset: tuple.offset,
          status: "projecting",
          stalled: false,
          reframeOffset: Number.isInteger(parameters.targetOffset)
            ? (parameters.targetOffset as number)
            : undefined,
          sources: [],
          knots: [],
          barrier: { settled: 0, total: 0 },
          strata: { admission: [], sowing: [], harvest: [] }
        };
        const turnRow = state.operatorTurnRows.get(String(d.turnId ?? ""));
        if (turnRow) scene.strata.admission.push(turnRow);
        scene.strata.admission.push(formRow(tuple));
        state.scenes.push(scene);
        state.byBind.set(bindId, scene);
        if (scene.sourceKnotId) {
          const parentKnot = state.knots.get(scene.sourceKnotId);
          if (parentKnot) parentKnot.childBindId = bindId;
        }
        break;
      }
      case "service.request": {
        const scene = state.byBind.get(String(d.bindId ?? ""));
        if (scene) {
          scene.requestUid = String(d.uid ?? "");
          scene.strata.sowing.push(formRow(tuple));
        }
        break;
      }
      case "service.failed": {
        const owner = String(d.bindId ?? "");
        const scene = state.byBind.get(owner) ?? state.byClose.get(owner);
        if (scene) {
          scene.stalled = true;
          scene.strata.sowing.push(formRow(tuple));
        }
        break;
      }
      case "learning.knot.seeded": {
        const knot = state.knots.get(String(d.knot ?? ""));
        if (knot) {
          knot.angle = String(d.angle ?? knot.angle);
          const scene = state.byBind.get(knot.bindId);
          scene?.strata.sowing.push(formRow(tuple));
        }
        break;
      }
      case "learning.scene.unfolded": {
        const scene = state.byBind.get(String(d.bindId ?? ""));
        const result = (d.result ?? {}) as { title?: string; purpose?: string };
        if (scene) {
          scene.title = result.title ?? scene.title;
          scene.purpose = result.purpose ?? "";
          scene.status = "active";
          scene.strata.sowing.push(formRow(tuple));
        }
        break;
      }
      case "learning.answer.submitted": {
        const knot = state.knots.get(String(d.knotId ?? ""));
        if (knot) {
          knot.answers.push({
            text: String(d.answer ?? ""),
            vector: String(d.vector ?? "answer"),
            offset: tuple.offset
          });
        }
        break;
      }
      case "learning.source.presented": {
        const resource = d.resource as ResourceRef | undefined;
        if (!resource) break;
        if (d.knotId) {
          state.knots.get(String(d.knotId))?.sources.push(resource);
        } else if (d.bindId) {
          const scene = state.byBind.get(String(d.bindId));
          if (scene) {
            scene.sources.push(resource);
            scene.strata.sowing.push(formRow(tuple));
          }
        }
        break;
      }
      case "learning.evidence.registered": {
        const knot = state.knots.get(String(d.knotId ?? ""));
        if (knot) knot.evidence.push(...(((d.excerpts as EvidenceExcerpt[]) ?? [])));
        break;
      }
      case "inference.request": {
        const knot = state.knots.get(String(d.knotId ?? ""));
        if (knot) {
          knot.tacts.push({
            uid: String(d.uid ?? ""),
            requestOffset: tuple.offset,
            deltaCount: ((d.deltas as unknown[]) ?? []).length
          });
        }
        break;
      }
      case "inference.response": {
        const uid = String(d.uid ?? "");
        const knot = state.knots.get(String(d.knotId ?? ""));
        if (knot) {
          const tact = knot.tacts.find((t) => t.uid === uid);
          if (tact) {
            tact.responseOffset = tuple.offset;
            tact.grade = Number(d.grade ?? 0);
            tact.source = d.source ? String(d.source) : undefined;
          }
          knot.state = String(d.state ?? knot.state);
          knot.grade = Number(d.grade ?? knot.grade);
        }
        break;
      }
      case "inference.reasoning": {
        const knot = state.knots.get(String(d.knotId ?? ""));
        const tact = knot?.tacts.find((t) => t.uid === String(d.uid ?? ""));
        if (tact) tact.reasoningOffset = tuple.offset;
        break;
      }
      case "inference.failed": {
        const uid = String(d.uid ?? "");
        const knot = state.knots.get(String(d.knotId ?? ""));
        if (knot) {
          const tact = knot.tacts.find((t) => t.uid === uid);
          if (tact) {
            tact.failedOffset = tuple.offset;
            tact.failedReason = String(d.reason ?? "");
          }
          const scene = state.byBind.get(knot.bindId);
          if (scene) scene.stalled = true;
        }
        break;
      }
      case "learning.knot.marked": {
        const knot = state.knots.get(String(d.knotId ?? ""));
        if (knot && d.mark === "unknown") knot.unknown = true;
        break;
      }
      case "learning.integration.candidate":
      case "learning.integration.returned": {
        const closeId = String(d.bindId ?? "");
        const scene = state.byClose.get(closeId) ?? state.byBind.get(closeId);
        const result = (d.result ?? {}) as Partial<SceneCandidate>;
        if (scene) {
          scene.strata.harvest.push(formRow(tuple));
          if (!scene.candidate) {
            scene.candidate = {
              offset: tuple.offset,
              uid: String(d.uid ?? ""),
              statement: String(result.statement ?? ""),
              contributions: result.contributions ?? [],
              openQuestions: result.openQuestions ?? [],
              uncertainties: result.uncertainties ?? []
            };
            scene.status = "candidate";
          }
        }
        if (payload.factType === "learning.integration.returned") {
          const parentKnot = state.knots.get(String(d.parentKnotId ?? ""));
          if (parentKnot) {
            parentKnot.returned = true;
            parentKnot.returnOffset = tuple.offset;
          }
        }
        break;
      }
      case "learning.integration.accepted": {
        const scene = state.byBind.get(String(d.bindId ?? ""));
        if (scene?.candidate) {
          scene.status = "integrated";
          scene.integratedValueId = String(d.valueId ?? "");
          scene.strata.harvest.push(formRow(tuple));
          if (scene.sourceKnotId) {
            const parentKnot = state.knots.get(scene.sourceKnotId);
            if (parentKnot) parentKnot.returnedValueId = String(d.valueId ?? "");
          }
        }
        break;
      }
      default:
        break;
    }
    return state;
  },

  snapshot: (state) => ({
    scenes: state.scenes.map((scene) => ({
      ...scene,
      barrier: {
        settled: scene.knots.filter((k) => k.ready || k.unknown || k.returned).length,
        total: scene.knots.length
      },
      sources: [...scene.sources],
      knots: scene.knots.map((knot) => ({
        ...knot,
        tacts: knot.tacts.map((t) => ({ ...t })),
        evidence: [...knot.evidence],
        sources: [...knot.sources],
        answers: [...knot.answers]
      })),
      strata: {
        admission: [...scene.strata.admission],
        sowing: [...scene.strata.sowing],
        harvest: [...scene.strata.harvest]
      },
      candidate: scene.candidate ? { ...scene.candidate } : undefined
    }))
  })
};
