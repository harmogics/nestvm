// The simulated machine: command handlers that turn ingress (turns and
// decisions) into committed tuple batches. Interpretation precedence follows
// spec/first-turn-log-protocol.md: target knot → answer; operator → configured
// bind request; neither → plain signal, no machine work. The server, never the
// browser, mints ids, uids and offsets.

import { findEvidence } from "./corpus";
import { foldIntegration, unfoldScene, windUnderstanding } from "./guide";
import { evaluateCompletion, project } from "./projection";
import { commit, fact, readiness, updateMeta, type SessionRecord } from "./store";
import type {
  CommandResult,
  DecisionBody,
  KnotView,
  TurnBody,
  WaveEmission,
  WaveTuple
} from "./types";

const READY_THRESHOLD = 0.7;

function countFacts(record: SessionRecord, factType: string): number {
  let count = 0;
  for (const tuple of record.tuples) {
    if (tuple.kind !== "domain.fact") continue;
    if ((tuple.payload as { factType?: string }).factType === factType) count += 1;
  }
  return count;
}

function rootText(record: SessionRecord, turnText: string): string {
  const projection = project(record.tuples);
  const signals = projection.rootMaterials.map((m) => m.text);
  if (turnText.trim()) signals.push(turnText.trim());
  if (signals.length > 0) return signals.join("\n");
  const subject = projection.subject;
  return subject.kind === "volume" ? subject.title : subject.text;
}

function subjectLabel(record: SessionRecord): string {
  const projection = project(record.tuples);
  return projection.subject.kind === "volume"
    ? `${projection.subject.title} (${projection.subject.ref})`
    : projection.subject.text;
}

function knotOrNull(record: SessionRecord, knotId: string): KnotView | null {
  const projection = project(record.tuples);
  for (const scene of projection.scenes) {
    const knot = scene.knots.find((k) => k.knotId === knotId);
    if (knot) return knot;
  }
  return null;
}

// One winding tact: intention → integration → possible readiness reification.
async function windKnot(
  record: SessionRecord,
  knot: KnotView,
  deltas: string[]
): Promise<WaveTuple[]> {
  const key = record.meta.id;
  const uid = `${knot.knotId}#${knot.tacts.length + 1}`;
  const committed: WaveTuple[] = [];
  committed.push(
    ...(await commit(record, [
      fact(key, "inference.request", {
        knotId: knot.knotId,
        uid,
        questions: [knot.question, `Angle: ${knot.angle}`],
        state: knot.state,
        deltas,
        lane: knot.lane
      })
    ]))
  );
  const wound = await windUnderstanding({
    questions: [knot.question],
    state: knot.state,
    priorGrade: knot.grade,
    deltas
  });
  const emissions: WaveEmission[] = [
    fact(key, "inference.response", {
      knotId: knot.knotId,
      uid,
      state: wound.result.state,
      grade: wound.result.grade,
      lane: knot.lane,
      source: wound.source
    })
  ];
  if (wound.result.reasoning) {
    emissions.push(
      fact(key, "inference.reasoning", { knotId: knot.knotId, uid, reasoning: wound.result.reasoning })
    );
  }
  if (wound.result.grade >= READY_THRESHOLD) {
    emissions.push(
      readiness(key, knot.knotId, { state: wound.result.state, grade: wound.result.grade })
    );
  }
  committed.push(...(await commit(record, emissions)));
  return committed;
}

// A scene-forming bind: selection → service intention → delegated publication.
async function formScene(
  record: SessionRecord,
  input: {
    operatorId: "unfold" | "deepen";
    turnId: string | null;
    text: string;
    sourceRefs: string[];
    parentBindId?: string;
    sourceKnotId?: string;
    focusQuestion?: string;
    focusState?: string;
  }
): Promise<WaveTuple[]> {
  const key = record.meta.id;
  const bindId = `bind-${countFacts(record, "learning.bind.selected") + 1}`;
  const committed: WaveTuple[] = [];
  committed.push(
    ...(await commit(record, [
      fact(key, "learning.bind.selected", {
        bindId,
        operatorId: input.operatorId,
        operatorVersion: "1",
        parameters: {},
        sourceSnapshot: input.sourceRefs,
        focusRef: input.sourceKnotId ?? "root",
        turnId: input.turnId,
        parentBindId: input.parentBindId ?? null,
        sourceKnotId: input.sourceKnotId ?? null,
        title: input.focusQuestion ? `Deepen: ${input.focusQuestion.slice(0, 80)}` : "Unfold the inquiry"
      })
    ]))
  );
  const uid = `${bindId}#1`;
  committed.push(
    ...(await commit(record, [
      fact(key, "service.request", {
        bindId,
        uid,
        instruction:
          input.operatorId === "deepen"
            ? "Unfold the deepened knot into 3-4 question knots for a child scene."
            : "Unfold the learner's root material into 3-4 question knots.",
        scope: {
          subject: subjectLabel(record),
          root: input.focusQuestion ?? rootText(record, input.text),
          sources: input.sourceRefs
        },
        emit: { writes: "learning.scene.unfolded" }
      })
    ]))
  );
  const unfolded = await unfoldScene({
    subjectLabel: subjectLabel(record),
    rootText: rootText(record, input.text),
    emphasis: input.text || undefined,
    focusQuestion: input.focusQuestion,
    focusState: input.focusState
  });
  committed.push(
    ...(await commit(record, [
      fact(key, "learning.scene.unfolded", {
        bindId,
        uid,
        result: {
          title: unfolded.result.title,
          purpose: unfolded.result.purpose,
          knots: unfolded.result.knots.map((k, i) => ({
            knotId: `${bindId}.k${i + 1}`,
            question: k.question,
            angle: k.angle,
            lane: `${bindId}.q${i + 1}`
          }))
        },
        source: unfolded.source
      })
    ]))
  );
  return committed;
}

export async function submitTurn(record: SessionRecord, body: TurnBody): Promise<CommandResult> {
  const key = record.meta.id;
  const turnId = `t${countFacts(record, "learning.turn.submitted") + 1}`;
  const targetKnotId = body.targetKnotId ?? null;
  const operator = body.operator ?? null;

  if (targetKnotId && operator) {
    return { tuples: [], refused: { reasons: ["A turn cannot both answer a knot and request an operator — choose one."] } };
  }

  const tuples: WaveTuple[] = [];
  tuples.push(
    ...(await commit(record, [
      fact(key, "learning.turn.submitted", {
        turnId,
        actor: "learner",
        text: body.text,
        targetKnotId,
        vector: body.vector ?? null,
        operator,
        sourceRefs: body.sourceRefs ?? [],
        excludedSourceRefs: body.excludedSourceRefs ?? [],
        focusRef: body.focusRef ?? "root"
      })
    ]))
  );

  if (targetKnotId) {
    const knot = knotOrNull(record, targetKnotId);
    if (!knot) return { tuples, refused: { reasons: [`Unknown knot ${targetKnotId}.`] } };
    if (!body.text.trim()) return { tuples, refused: { reasons: ["An answer needs text."] } };
    const vector = body.vector === "challenge" ? "challenge" : "answer";
    tuples.push(
      ...(await commit(record, [
        fact(key, "learning.answer.submitted", {
          turnId,
          knotId: targetKnotId,
          answer: body.text.trim(),
          vector
        })
      ]))
    );
    const refreshed = knotOrNull(record, targetKnotId);
    if (refreshed) tuples.push(...(await windKnot(record, refreshed, [`[${vector}] ${body.text.trim()}`])));
    return { tuples };
  }

  if (operator?.id === "unfold") {
    tuples.push(
      ...(await formScene(record, {
        operatorId: "unfold",
        turnId,
        text: body.text,
        sourceRefs: body.sourceRefs ?? []
      }))
    );
    return { tuples };
  }

  // Plain signal: committed, quiet, no machine work (successful quiescence).
  return { tuples };
}

export async function submitDecision(record: SessionRecord, body: DecisionBody): Promise<CommandResult> {
  const key = record.meta.id;

  switch (body.kind) {
    case "evidence": {
      const knot = knotOrNull(record, body.knotId);
      if (!knot) return { tuples: [], refused: { reasons: [`Unknown knot ${body.knotId}.`] } };
      const query = body.query?.trim() || `${subjectLabel(record)} ${knot.question} ${knot.angle}`;
      const excerpts = await findEvidence(query, 3);
      if (excerpts.length === 0) {
        return { tuples: [], refused: { reasons: ["No sufficiently relevant sections found in the specification set for this question."] } };
      }
      const tuples: WaveTuple[] = [];
      tuples.push(
        ...(await commit(record, [
          fact(key, "learning.evidence.registered", { knotId: knot.knotId, query, excerpts })
        ]))
      );
      const deltas = excerpts.map((e) => `[evidence] ${e.volume}, "${e.section}": ${e.excerpt}`);
      const refreshed = knotOrNull(record, knot.knotId);
      if (refreshed) tuples.push(...(await windKnot(record, refreshed, deltas)));
      return { tuples };
    }

    case "deepen": {
      const knot = knotOrNull(record, body.knotId);
      if (!knot) return { tuples: [], refused: { reasons: [`Unknown knot ${body.knotId}.`] } };
      if (knot.childBindId) return { tuples: [], refused: { reasons: ["This knot already has a child scene."] } };
      const tuples = await formScene(record, {
        operatorId: "deepen",
        turnId: null,
        text: "",
        sourceRefs: [],
        parentBindId: knot.bindId,
        sourceKnotId: knot.knotId,
        focusQuestion: knot.question,
        focusState: knot.state
      });
      return { tuples };
    }

    case "integrate": {
      const projection = project(record.tuples);
      const scene = projection.scenes.find((s) => s.bindId === body.bindId);
      if (!scene) return { tuples: [], refused: { reasons: [`Unknown scene ${body.bindId}.`] } };
      if (scene.knots.length === 0) return { tuples: [], refused: { reasons: ["The scene has no knots yet."] } };
      const worked = scene.knots.some((k) => k.ready || k.unknown || k.returnedValueId || k.state);
      if (!worked) {
        return { tuples: [], refused: { reasons: ["Nothing has been wound yet — answer, evidence, or deepen at least one knot first."] } };
      }
      const uid = `${body.bindId}#${countFacts(record, "service.request") + 1}`;
      const entries = scene.knots.map((k) => {
        if (k.returnedValueId) {
          const value = projection.values.find((v) => v.valueId === k.returnedValueId);
          return { name: k.question, kind: "returned value", text: value?.statement ?? "", grade: 1 };
        }
        if (k.unknown) return { name: k.question, kind: "explicitly unknown", text: "Held open as unknown by the learner.", grade: 0 };
        return {
          name: k.question,
          kind: k.ready ? "ready knot" : "unripe knot",
          text: k.state || k.answers.map((a) => a.text).join("\n") || "(no material)",
          grade: k.grade
        };
      });
      const tuples: WaveTuple[] = [];
      tuples.push(
        ...(await commit(record, [
          fact(key, "service.request", {
            bindId: body.bindId,
            uid,
            instruction: "Integrate the ripened understandings into one seam-preserving articulation.",
            scope: { entries: entries.map((e) => ({ name: e.name, kind: e.kind })) },
            emit: { writes: "learning.integration.candidate" }
          })
        ]))
      );
      const folded = await foldIntegration({
        title: scene.title,
        purpose: scene.purpose,
        rootText: rootText(record, ""),
        entries
      });
      tuples.push(
        ...(await commit(record, [
          fact(key, "learning.integration.candidate", {
            bindId: body.bindId,
            uid,
            result: folded.result,
            source: folded.source
          })
        ]))
      );
      return { tuples };
    }

    case "accept": {
      const projection = project(record.tuples);
      const scene = projection.scenes.find((s) => s.bindId === body.bindId);
      if (!scene?.candidate) return { tuples: [], refused: { reasons: ["The scene has no integration candidate to accept."] } };
      if (scene.candidate.offset !== body.candidateOffset) {
        return { tuples: [], refused: { reasons: ["The candidate changed since it was shown — review the current candidate."] } };
      }
      if (scene.status === "integrated") return { tuples: [], refused: { reasons: ["This scene is already integrated."] } };
      const valueId = `v${projection.values.length + 1}`;
      const tuples: WaveTuple[] = [];
      tuples.push(
        ...(await commit(record, [
          fact(key, "learning.integration.accepted", {
            valueId,
            bindId: body.bindId,
            candidateOffset: body.candidateOffset,
            title: scene.title,
            actor: "learner"
          })
        ]))
      );
      if (scene.parentBindId && scene.sourceKnotId) {
        tuples.push(
          ...(await commit(record, [
            fact(key, "learning.integration.returned", {
              childBindId: body.bindId,
              parentBindId: scene.parentBindId,
              parentKnotId: scene.sourceKnotId,
              valueId
            })
          ]))
        );
        const parentKnot = knotOrNull(record, scene.sourceKnotId);
        if (parentKnot) {
          tuples.push(...(await windKnot(record, parentKnot, [`[return] ${scene.candidate.statement}`])));
        }
      }
      return { tuples };
    }

    case "markUnknown": {
      const knot = knotOrNull(record, body.knotId);
      if (!knot) return { tuples: [], refused: { reasons: [`Unknown knot ${body.knotId}.`] } };
      const tuples = await commit(record, [
        fact(key, "learning.knot.marked", { knotId: body.knotId, mark: "unknown", actor: "learner" })
      ]);
      return { tuples };
    }

    case "finish": {
      const projection = project(record.tuples);
      const reasons = evaluateCompletion(projection);
      if (reasons.length > 0) return { tuples: [], refused: { reasons } };
      const rootValue = projection.values.find((v) => {
        const scene = projection.scenes.find((s) => s.bindId === v.bindId);
        return scene && !scene.parentBindId;
      });
      const openQuestions = [
        ...new Set([...projection.openQuestions, ...projection.values.flatMap((v) => v.openQuestions)])
      ];
      const evidenceCount = projection.scenes.reduce(
        (sum, s) => sum + s.knots.reduce((k, knot) => k + knot.evidence.length, 0),
        0
      );
      const tuples = await commit(record, [
        fact(key, "learning.session.result.candidate", {
          resultId: "result-1",
          document: {
            statement: rootValue?.statement ?? "",
            values: projection.values.map((v) => ({ valueId: v.valueId, title: v.title, statement: v.statement })),
            openQuestions,
            evidenceCount
          }
        })
      ]);
      return { tuples };
    }

    case "attest": {
      const projection = project(record.tuples);
      if (!projection.result || projection.result.offset !== body.resultOffset) {
        return { tuples: [], refused: { reasons: ["No result candidate at the given offset — request completion first."] } };
      }
      if (projection.status === "completed") return { tuples: [], refused: { reasons: ["The session is already completed."] } };
      const tuples = await commit(record, [
        fact(key, "learning.session.completed", {
          resultOffset: body.resultOffset,
          actor: "learner",
          attestation: "accepted"
        })
      ]);
      await updateMeta(record, { status: "completed" });
      return { tuples };
    }

    default:
      return { tuples: [], refused: { reasons: ["Unknown decision kind."] } };
  }
}
