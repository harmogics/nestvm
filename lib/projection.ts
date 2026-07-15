// The derived reading of a study session: a pure function of the tuple log.
// No store, no fetch, no browser state — the same function serves the server,
// the client workspace, and replay (Vol. 08 §8 discipline).

import type {
  DomainFactPayload,
  EvidenceExcerpt,
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
    scenes: [],
    values: [],
    openQuestions: [],
    counts: { tuples: tuples.length, unanswered: 0, failures: 0 }
  };

  const scenes = new Map<string, SceneView>();
  const knots = new Map<string, KnotView>();
  const openUids = new Map<string, string>(); // uid → owner id
  let failures = 0;

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
      case "learning.scene.unfolded": {
        const uid = String(d.uid ?? "");
        openUids.delete(uid);
        const bindId = String(d.bindId ?? "");
        const scene = scenes.get(bindId);
        const result = (d.result ?? {}) as {
          title?: string;
          purpose?: string;
          knots?: { knotId: string; question: string; angle: string; lane: string }[];
        };
        if (scene) {
          scene.title = result.title ?? scene.title;
          scene.purpose = result.purpose ?? "";
          scene.status = "active";
          for (const item of result.knots ?? []) {
            const knot: KnotView = {
              knotId: item.knotId,
              bindId,
              question: item.question,
              angle: item.angle,
              lane: item.lane,
              state: "",
              grade: 0,
              ready: false,
              unknown: false,
              tacts: [],
              evidence: [],
              answers: []
            };
            knots.set(knot.knotId, knot);
            scene.knots.push(knot);
          }
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
      case "learning.integration.candidate": {
        const uid = String(d.uid ?? "");
        openUids.delete(uid);
        const scene = scenes.get(String(d.bindId ?? ""));
        const result = (d.result ?? {}) as Partial<IntegrationCandidate>;
        if (scene) {
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
          projection.values.push(value);
        }
        break;
      }
      case "learning.integration.returned": {
        const knot = knots.get(String(d.parentKnotId ?? ""));
        const value = projection.values.find((v) => v.valueId === String(d.valueId ?? ""));
        if (knot) knot.returnedValueId = String(d.valueId ?? "");
        if (value) value.returnedToKnotId = String(d.parentKnotId ?? "");
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

// Deterministic completion gate over the projection (the result contract of
// the "Understand the machine" petal): the root scene must be integrated and
// accepted; every knot of every integrated scene must be ready, explicitly
// unknown, or satisfied by a returned child value.
export function evaluateCompletion(projection: SessionProjection): string[] {
  const reasons: string[] = [];
  const rootScenes = projection.scenes.filter((s) => !s.parentBindId);
  if (rootScenes.length === 0) {
    reasons.push("No scene has been formed yet — apply unfold to the root material first.");
    return reasons;
  }
  const integratedRoot = rootScenes.some((s) => s.status === "integrated");
  if (!integratedRoot) {
    reasons.push("The root scene has no accepted integration yet — integrate and accept it.");
  }
  for (const scene of projection.scenes) {
    if (scene.status !== "integrated") continue;
    for (const knot of scene.knots) {
      const settled = knot.ready || knot.unknown || Boolean(knot.returnedValueId);
      if (!settled) {
        reasons.push(
          `Knot "${knot.question}" is neither ready nor explicitly unknown — answer it, mark it unknown, or integrate its child scene.`
        );
      }
    }
  }
  return reasons;
}
