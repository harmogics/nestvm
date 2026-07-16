// The derived reading of a study session: a pure function of the tuple log.
// No store, no fetch, no browser state — the same function serves the server,
// the client workspace, and replay (Vol. 08 §8 discipline).

import type {
  DomainFactPayload,
  EvidenceExcerpt,
  ResourceRef,
  IntegrationCandidate,
  KnotView,
  ResultDocument,
  SceneView,
  SessionProjection,
  SessionSubject,
  ValueView,
  WaveTuple,
  WindingTact
} from "./types";

function data(tuple: WaveTuple): Record<string, unknown> {
  return (tuple.payload as DomainFactPayload).data ?? {};
}

function factType(tuple: WaveTuple): string | null {
  if (tuple.kind !== "domain.fact") return null;
  return (tuple.payload as DomainFactPayload).factType ?? null;
}

export function project(tuples: readonly WaveTuple[]): SessionProjection {
  const projection: SessionProjection = {
    sessionId: "",
    petal: "",
    subject: { kind: "question", text: "" },
    resultContract: "",
    status: "open",
    rootMaterials: [],
    sources: [],
    scenes: [],
    values: [],
    openQuestions: [],
    counts: { tuples: tuples.length, unanswered: 0, failures: 0 }
  };

  const scenes = new Map<string, SceneView>();
  const scenesByCloseBind = new Map<string, SceneView>();
  const knots = new Map<string, KnotView>();
  const openUids = new Map<string, string>(); // uid → owner id
  let failures = 0;

  const sceneOfUid = (uid: string): SceneView | undefined => scenes.get(uid.split("#")[0]);

  for (const tuple of tuples) {
    if (tuple.kind === "sys.knot.ready") {
      const payload = tuple.payload as { knotId: string; understanding?: unknown };
      const knot = knots.get(payload.knotId);
      if (knot) {
        knot.ready = true;
        knot.readyOffset = tuple.offset;
      }
      continue;
    }

    // Sown topology records: the knot definitions and the closing bind of a
    // scene, stamped emittedBy with the sowing service uid (Vol. 06 §7).
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
      const knot: KnotView = {
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
      knots.set(knot.knotId, knot);
      scene?.knots.push(knot);
      continue;
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
        scenesByCloseBind.set(payload.id, scene);
      }
      continue;
    }

    const type = factType(tuple);
    if (!type) continue;
    const d = data(tuple);

    switch (type) {
      case "learning.session.opened": {
        projection.sessionId = String(d.sessionId ?? "");
        projection.petal = String(d.petal ?? "");
        projection.subject = (d.subject as SessionSubject) ?? projection.subject;
        projection.resultContract = String(d.resultContract ?? "");
        break;
      }
      case "learning.turn.submitted": {
        const hasOperator = d.operator != null;
        const hasTarget = d.targetKnotId != null && d.targetKnotId !== "";
        if (!hasOperator && !hasTarget) {
          projection.rootMaterials.push({
            turnId: String(d.turnId ?? ""),
            offset: tuple.offset,
            text: String(d.text ?? "")
          });
        }
        break;
      }
      case "learning.bind.selected": {
        const bindId = String(d.bindId ?? "");
        const scene: SceneView = {
          bindId,
          parentBindId: d.parentBindId ? String(d.parentBindId) : undefined,
          sourceKnotId: d.sourceKnotId ? String(d.sourceKnotId) : undefined,
          title: String(d.title ?? "Scene forming"),
          purpose: "",
          operatorId: (d.operatorId as SceneView["operatorId"]) ?? "unfold",
          selectedOffset: tuple.offset,
          status: "projecting",
          sources: [],
          knots: []
        };
        scenes.set(bindId, scene);
        projection.scenes.push(scene);
        if (scene.sourceKnotId) {
          const parentKnot = knots.get(scene.sourceKnotId);
          if (parentKnot) parentKnot.childBindId = bindId;
        }
        break;
      }
      case "service.request": {
        const owner = String(d.bindId ?? "");
        const uid = String(d.uid ?? "");
        openUids.set(uid, owner);
        const scene = scenes.get(owner);
        if (scene) scene.requestUid = uid;
        break;
      }
      case "service.failed": {
        openUids.delete(String(d.uid ?? ""));
        failures += 1;
        break;
      }
      case "learning.knot.seeded": {
        const knot = knots.get(String(d.knot ?? ""));
        if (knot) knot.angle = String(d.angle ?? knot.angle);
        break;
      }
      case "learning.scene.unfolded": {
        const uid = String(d.uid ?? "");
        openUids.delete(uid);
        const scene = scenes.get(String(d.bindId ?? ""));
        const result = (d.result ?? {}) as { title?: string; purpose?: string };
        if (scene) {
          scene.title = result.title ?? scene.title;
          scene.purpose = result.purpose ?? "";
          scene.status = "active";
        }
        break;
      }
      case "learning.answer.submitted": {
        const knot = knots.get(String(d.knotId ?? ""));
        if (knot) {
          knot.answers.push({
            text: String(d.answer ?? ""),
            vector: String(d.vector ?? "answer"),
            offset: tuple.offset
          });
        }
        break;
      }
      case "learning.source.declared": {
        const resource = d.resource as ResourceRef | undefined;
        if (resource) projection.sources.push(resource);
        break;
      }
      case "learning.source.presented": {
        const resource = d.resource as ResourceRef | undefined;
        if (!resource) break;
        if (d.knotId) {
          const knot = knots.get(String(d.knotId));
          if (knot) knot.sources.push(resource);
        } else if (d.bindId) {
          const scene = scenes.get(String(d.bindId));
          if (scene) scene.sources.push(resource);
        }
        break;
      }
      case "learning.evidence.registered": {
        const knot = knots.get(String(d.knotId ?? ""));
        if (knot) knot.evidence.push(...((d.excerpts as EvidenceExcerpt[]) ?? []));
        break;
      }
      case "inference.request": {
        const knotId = String(d.knotId ?? "");
        const uid = String(d.uid ?? "");
        openUids.set(uid, knotId);
        const knot = knots.get(knotId);
        if (knot) {
          const tact: WindingTact = {
            uid,
            requestOffset: tuple.offset,
            deltas: (d.deltas as string[]) ?? []
          };
          knot.tacts.push(tact);
        }
        break;
      }
      case "inference.response": {
        const uid = String(d.uid ?? "");
        openUids.delete(uid);
        const knot = knots.get(String(d.knotId ?? ""));
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
        const knot = knots.get(String(d.knotId ?? ""));
        const tact = knot?.tacts.find((t) => t.uid === String(d.uid ?? ""));
        if (tact) tact.reasoningOffset = tuple.offset;
        break;
      }
      case "inference.failed": {
        const uid = String(d.uid ?? "");
        openUids.delete(uid);
        failures += 1;
        const knot = knots.get(String(d.knotId ?? ""));
        const tact = knot?.tacts.find((t) => t.uid === uid);
        if (tact) {
          tact.failedOffset = tuple.offset;
          tact.failedReason = String(d.reason ?? "");
        }
        break;
      }
      case "learning.knot.marked": {
        const knot = knots.get(String(d.knotId ?? ""));
        if (knot && d.mark === "unknown") knot.unknown = true;
        break;
      }
      case "learning.integration.candidate":
      case "learning.integration.returned": {
        const uid = String(d.uid ?? "");
        openUids.delete(uid);
        // Published by the scene's close bind; the owning scene is resolved
        // through the close-bind registration, never by adjacency.
        const closeBindId = String(d.bindId ?? "");
        const scene = scenesByCloseBind.get(closeBindId) ?? scenes.get(closeBindId);
        const result = (d.result ?? {}) as Partial<IntegrationCandidate>;
        if (scene && !scene.candidate) {
          scene.candidate = {
            offset: tuple.offset,
            uid,
            statement: String(result.statement ?? ""),
            contributions: result.contributions ?? [],
            openQuestions: result.openQuestions ?? [],
            uncertainties: result.uncertainties ?? []
          };
          scene.status = "candidate";
        }
        if (type === "learning.integration.returned") {
          const parentKnot = knots.get(String(d.parentKnotId ?? ""));
          if (parentKnot) {
            parentKnot.returned = true;
            parentKnot.returnOffset = tuple.offset;
          }
        }
        break;
      }
      case "learning.integration.accepted": {
        const bindId = String(d.bindId ?? "");
        const scene = scenes.get(bindId);
        const valueId = String(d.valueId ?? "");
        if (scene?.candidate) {
          scene.status = "integrated";
          scene.integratedValueId = valueId;
          const value: ValueView = {
            valueId,
            title: String(d.title ?? scene.title),
            statement: scene.candidate.statement,
            bindId,
            candidateOffset: scene.candidate.offset,
            acceptedOffset: tuple.offset,
            contributions: scene.candidate.contributions,
            openQuestions: scene.candidate.openQuestions
          };
          if (scene.sourceKnotId) {
            const parentKnot = knots.get(scene.sourceKnotId);
            if (parentKnot) parentKnot.returnedValueId = valueId;
            value.returnedToKnotId = scene.sourceKnotId;
          }
          projection.values.push(value);
        }
        break;
      }
      case "learning.session.result.candidate": {
        projection.result = {
          offset: tuple.offset,
          document: (d.document as ResultDocument) ?? {
            statement: "",
            values: [],
            openQuestions: [],
            evidenceCount: 0
          }
        };
        break;
      }
      case "learning.session.completed": {
        projection.status = "completed";
        projection.completedOffset = tuple.offset;
        break;
      }
      default:
        break;
    }
  }

  const open = new Set<string>();
  for (const scene of projection.scenes) {
    for (const q of scene.candidate?.openQuestions ?? []) open.add(q);
    for (const knot of scene.knots) {
      if (knot.unknown) open.add(knot.question);
    }
  }
  projection.openQuestions = [...open];
  projection.counts.unanswered = openUids.size;
  projection.counts.failures = failures;
  return projection;
}

// A knot is settled when it is ready, explicitly unknown, or has received its
// child scene's returned integration — the barrier condition of the scene's
// close bind.
export function knotSettled(knot: KnotView): boolean {
  return knot.ready || knot.unknown || knot.returned;
}

// Deterministic completion gate over the projection (the result contract of
// the "Understand the machine" petal): the root scene must be integrated and
// accepted; every knot of every integrated scene must be settled.
export function evaluateCompletion(projection: SessionProjection): string[] {
  const reasons: string[] = [];
  const rootScenes = projection.scenes.filter((s) => !s.parentBindId);
  if (rootScenes.length === 0) {
    reasons.push("No scene has been formed yet — apply unfold to the root material first.");
    return reasons;
  }
  const integratedRoot = rootScenes.some((s) => s.status === "integrated");
  if (!integratedRoot) {
    reasons.push(
      "The root scene has no accepted integration yet — the close bind publishes its candidate when every knot settles; accept it."
    );
  }
  for (const scene of projection.scenes) {
    if (scene.status !== "integrated") continue;
    for (const knot of scene.knots) {
      if (!knotSettled(knot)) {
        reasons.push(
          `Knot "${knot.question}" is neither ready nor explicitly unknown — answer it, mark it unknown, or let its child scene return.`
        );
      }
    }
  }
  return reasons;
}
