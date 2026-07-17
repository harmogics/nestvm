// The simulated machine: command handlers that turn ingress (turns and
// decisions) into committed tuple batches. Interpretation precedence follows
// spec/first-turn-log-protocol.md: target knot → answer; operator → configured
// bind request; neither → plain signal, no machine work. The server, never the
// browser, mints ids, uids and offsets.
//
// Scene authoring follows the declared-form discipline (Vol. 01 §2.5,
// Vol. 06 §7): the internal agent (lib/guide.ts) supplies content only — a
// ScenePlan — and expandScenePlan turns it into sys.knot.defined records with
// explicit collect rules (seed, answer, evidence sockets and the return
// socket declared at birth), one closing bind descriptor, head facts, and the
// terminal delegated publication, in exactly that order: registration always
// precedes the facts that reach it (Vol. 02 §5.1). Scene integration is not a
// user command: settleScenes() completes each close bind's rendezvous as soon
// as its barrier settles (Vol. 06 §4) — the human decision is acceptance.

import { findEvidence } from "./corpus";
import { authorReframe, authorScene, foldIntegration, windUnderstanding, type ScenePlan } from "./guide";
import { evaluateCompletion, knotSettled, project } from "./projection";
import { resolverFor } from "./resources";
import { commit, fact, readiness, updateMeta, type SessionRecord } from "./store";
import type {
  CommandResult,
  DecisionBody,
  KnotView,
  ResourceRef,
  SceneView,
  SessionProjection,
  TurnBody,
  WaveEmission,
  WaveTuple
} from "./types";

// A winding delta: the committed intention carries a bounded string
// (ref + excerpt form); when the delta references a resource, the full
// content is resolved at discharge time, within a budget, and only the
// resolved text reaches the inference task (ADR-004 Decision 5).
type WindDelta = {
  label: "answer" | "challenge" | "evidence" | "return" | "source";
  text: string;
  resource?: ResourceRef;
};

function boundText(text: string, limit: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > limit ? flat.slice(0, limit - 1).replace(/\s+\S*$/, "") + "…" : flat;
}

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
  deltas: WindDelta[]
): Promise<WaveTuple[]> {
  const key = record.meta.id;
  const uid = `${knot.knotId}#${knot.tacts.length + 1}`;
  // The committed intention stays bounded: ref + excerpt, never full bodies.
  const factDeltas = deltas.map((delta) => {
    const refSuffix = delta.resource ? ` (${delta.resource.store}:${delta.resource.ref})` : "";
    return `[${delta.label}] ${boundText(delta.text, 300)}${refSuffix}`;
  });
  const committed: WaveTuple[] = [];
  committed.push(
    ...(await commit(record, [
      fact(key, "inference.request", {
        knotId: knot.knotId,
        uid,
        questions: [knot.question, `Angle: ${knot.angle}`],
        state: knot.state,
        deltas: factDeltas,
        lane: knot.lane
      })
    ]))
  );
  // Attention-time assembly: resolve referenced resources into content for
  // the integration task only.
  const resolver = resolverFor(record);
  const resolvedDeltas = await Promise.all(
    deltas.map(async (delta) => {
      if (!delta.resource) return `[${delta.label}] ${delta.text}`;
      const resolved = await resolver.resolve(delta.resource);
      if (!resolved) return `[${delta.label}] ${delta.text}`;
      return `[${delta.label}] ${resolved.title}: ${resolved.content}`;
    })
  );
  const wound = await windUnderstanding({
    questions: [knot.question],
    state: knot.state,
    priorGrade: knot.grade,
    deltas: resolvedDeltas
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
  if (wound.result.grade >= knot.threshold) {
    emissions.push(
      readiness(key, knot.knotId, { state: wound.result.state, grade: wound.result.grade })
    );
  }
  committed.push(...(await commit(record, emissions)));
  return committed;
}

// ---------------------------------------------------------------------------
// Scene authoring: plan → records → close → heads → delegated publication
// ---------------------------------------------------------------------------

function expandScenePlan(input: {
  key: string;
  bindId: string;
  uid: string;
  plan: ScenePlan;
  source: string;
  returnTo?: string;
}): WaveEmission[] {
  const emissions: WaveEmission[] = [];
  const knotIds: string[] = [];

  // 1. Knot records: the declared form. Each knot carries, from birth, its
  //    seed rule, the learner-facing sockets (answer, evidence) and the
  //    return socket a future child scene may write into (no retroactive
  //    subscriptions exist — Vol. 02 §5.1).
  input.plan.knots.forEach((planKnot, index) => {
    const knotId = `${input.bindId}.k${index + 1}`;
    knotIds.push(knotId);
    emissions.push({
      kind: "sys.knot.defined",
      key: null,
      payload: {
        id: knotId,
        strategy: "semantic_evaluator",
        config: {
          wind: {
            collect: [
              {
                as: "seed",
                match_type: "learning.knot.seeded",
                reduce: "append",
                field: "question",
                where: [{ field: "knot", equals: knotId }]
              },
              {
                as: "answer",
                match_type: "learning.answer.submitted",
                reduce: "append",
                field: "answer",
                where: [{ field: "knotId", equals: knotId }]
              },
              {
                as: "evidence",
                match_type: "learning.evidence.registered",
                reduce: "append",
                where: [{ field: "knotId", equals: knotId }]
              },
              {
                as: "return",
                match_type: "learning.integration.returned",
                reduce: "append",
                where: [{ field: "parentKnotId", equals: knotId }]
              }
            ],
            integrate: "through_world",
            lane: `${input.bindId}.q${index + 1}`,
            budget: planKnot.budget
          },
          condition: {
            evaluate_understanding: true,
            questions: [planKnot.question],
            threshold_grade: planKnot.threshold_grade
          }
        },
        emittedBy: input.uid
      }
    });
  });

  // 2. The closing bind, once: demands on every sown knot; its publication
  //    target is fixed here — the candidate type for a root scene, the
  //    parent-addressed return type for a deepened scene. `return_to` is
  //    template-fixed, never model-supplied.
  const closeBindId = `${input.bindId}.close`;
  emissions.push({
    kind: "sys.descriptor.defined",
    key: null,
    payload: {
      id: closeBindId,
      operator: {
        demands: knotIds.map((knotId, index) => ({ as: `k${index + 1}`, knot: knotId })),
        service: {
          instruction: input.plan.close_instruction,
          emit: {
            writes: input.returnTo ? "learning.integration.returned" : "learning.integration.candidate"
          }
        },
        ...(input.returnTo ? { return_to: input.returnTo } : {})
      },
      emittedBy: input.uid
    }
  });

  // 3. Head facts, last: they seed the sown knots and inject the angle of
  //    perception. (Simulation liberty: the seed itself does not project a
  //    winding intention; grades stay honest at 0 until learner material or
  //    a returned integration arrives.)
  input.plan.knots.forEach((planKnot, index) => {
    emissions.push(
      fact(input.key, "learning.knot.seeded", {
        knot: knotIds[index],
        question: planKnot.question,
        angle: planKnot.angle,
        emittedBy: input.uid
      })
    );
  });

  // 4. The terminal delegated publication for the sowing service uid.
  emissions.push(
    fact(input.key, "learning.scene.unfolded", {
      bindId: input.bindId,
      uid: input.uid,
      result: {
        title: input.plan.title,
        purpose: input.plan.purpose,
        knotIds,
        closeBindId
      },
      source: input.source
    })
  );

  return emissions;
}

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
  const projection = project(record.tuples);
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
            ? "Author a bounded child scene for the deepened knot: 3-4 question knots and a closing instruction."
            : "Author a bounded scene over the learner's root material: 3-4 question knots and a closing instruction.",
        scope: {
          subject: subjectLabel(record),
          root: input.focusQuestion ?? rootText(record, input.text),
          sources: input.sourceRefs
        },
        emit: { writes: "learning.scene.unfolded" }
      })
    ]))
  );
  // The scene's sources: the session shelf (declared at opening) plus the
  // included released values, re-presented as wave references.
  const valueResources: ResourceRef[] = input.sourceRefs
    .map((ref) => projection.values.find((v) => v.valueId === ref))
    .filter((v): v is NonNullable<typeof v> => Boolean(v))
    .map((v) => ({
      store: "wave" as const,
      ref: `offset:${v.candidateOffset}`,
      title: `${v.valueId} · ${v.title}`,
      excerpt: boundText(v.statement, 240)
    }));
  const sceneResources: ResourceRef[] = [...projection.sources, ...valueResources];

  // Attention-time assembly for the authoring task itself.
  const resolver = resolverFor(record, 900);
  const resolvedSources = (
    await Promise.all(
      sceneResources.map(async (resource) => {
        const resolved = await resolver.resolve(resource);
        return resolved ? `${resolved.title}: ${resolved.content}` : null;
      })
    )
  ).filter((s): s is string => Boolean(s));

  const authored = await authorScene({
    subjectLabel: subjectLabel(record),
    rootText: rootText(record, input.text),
    emphasis: input.text || undefined,
    focusQuestion: input.focusQuestion,
    focusState: input.focusState,
    sources: resolvedSources
  });
  committed.push(
    ...(await commit(
      record,
      expandScenePlan({
        key,
        bindId,
        uid,
        plan: authored.result,
        source: authored.source,
        returnTo: input.sourceKnotId
      })
    ))
  );
  // Presentation facts, after registration: the scene's context registry.
  if (sceneResources.length > 0) {
    committed.push(
      ...(await commit(
        record,
        sceneResources.map((resource) =>
          fact(key, "learning.source.presented", { bindId, resource })
        )
      ))
    );

    // Grounding tact: every sown knot winds the presented sources once, so
    // the scene starts from the material the session is built on. Windings
    // run in parallel; their batches interleave on the log and stay joined
    // by correlation, never adjacency (Vol. 03 §3.3).
    const sourceDeltas: WindDelta[] = sceneResources.map((resource) => ({
      label: "source",
      text: resource.excerpt || resource.title || resource.ref,
      resource
    }));
    const scene = project(record.tuples).scenes.find((s) => s.bindId === bindId);
    if (scene) {
      const groundings = await Promise.all(
        scene.knots.map((knot) => windKnot(record, knot, sourceDeltas))
      );
      for (const batch of groundings) committed.push(...batch);
      committed.push(...(await settleScenes(record)));
    }
  }
  return committed;
}

// A reframe scene: a bounded lens figure over one produced tuple. Its knots
// are grounded on the source artefact through the wave resolver; its close
// publishes the reframed text as an ordinary integration candidate.
async function formReframeScene(
  record: SessionRecord,
  input: { turnId: string | null; lens: string; targetOffset: number }
): Promise<CommandResult> {
  const key = record.meta.id;
  const resolver = resolverFor(record, 1600);
  const targetRef: ResourceRef = { store: "wave", ref: `offset:${input.targetOffset}` };
  const resolved = await resolver.resolve(targetRef);
  if (!resolved) {
    return {
      tuples: [],
      refused: { reasons: [`Offset ${input.targetOffset} does not resolve to a readable artefact.`] }
    };
  }
  const resource: ResourceRef = {
    ...targetRef,
    title: resolved.title,
    excerpt: boundText(resolved.content, 240)
  };

  const bindId = `bind-${countFacts(record, "learning.bind.selected") + 1}`;
  const committed: WaveTuple[] = [];
  committed.push(
    ...(await commit(record, [
      fact(key, "learning.bind.selected", {
        bindId,
        operatorId: "reframe",
        operatorVersion: "1",
        parameters: { targetOffset: input.targetOffset, lens: input.lens || null },
        sourceSnapshot: [targetRef.ref],
        focusRef: targetRef.ref,
        turnId: input.turnId,
        parentBindId: null,
        sourceKnotId: null,
        title: `Reframe: ${boundText(resolved.title, 60)}`
      })
    ]))
  );
  const uid = `${bindId}#1`;
  committed.push(
    ...(await commit(record, [
      fact(key, "service.request", {
        bindId,
        uid,
        instruction: "Author a bounded lens scene that reads one produced artefact and publishes a reframed text.",
        scope: { subject: subjectLabel(record), target: targetRef.ref, lens: input.lens || null },
        emit: { writes: "learning.scene.unfolded" }
      })
    ]))
  );
  const authored = await authorReframe({
    subjectLabel: subjectLabel(record),
    sourceTitle: resolved.title,
    sourceExcerpt: boundText(resolved.content, 900),
    lens: input.lens
  });
  committed.push(
    ...(await commit(
      record,
      expandScenePlan({ key, bindId, uid, plan: authored.result, source: authored.source })
    ))
  );
  committed.push(
    ...(await commit(record, [fact(key, "learning.source.presented", { bindId, resource })]))
  );
  // Grounding: the lens knots read the source artefact itself.
  const scene = project(record.tuples).scenes.find((s) => s.bindId === bindId);
  if (scene) {
    const groundings = await Promise.all(
      scene.knots.map((knot) =>
        windKnot(record, knot, [
          { label: "source", text: resource.excerpt || resolved.title, resource }
        ])
      )
    );
    for (const batch of groundings) committed.push(...batch);
    committed.push(...(await settleScenes(record)));
  }
  return { tuples: committed };
}

// ---------------------------------------------------------------------------
// Barrier settlement: every close bind whose demands have all settled
// completes its rendezvous and publishes — cascading, since a child's return
// may ripen its parent knot and settle the parent's own barrier.
// ---------------------------------------------------------------------------

function closeEntries(scene: SceneView, projection: SessionProjection) {
  return scene.knots.map((knot) => {
    if (knot.returned && knot.childBindId) {
      const childScene = projection.scenes.find((s) => s.bindId === knot.childBindId);
      return {
        name: knot.question,
        kind: "returned integration",
        text: childScene?.candidate?.statement ?? knot.state ?? "",
        grade: 1
      };
    }
    if (knot.unknown) {
      return {
        name: knot.question,
        kind: "explicitly unknown",
        text: "Held open as unknown by the learner.",
        grade: 0
      };
    }
    return {
      name: knot.question,
      kind: knot.ready ? "ready knot" : "unripe knot",
      text: knot.state || knot.answers.map((a) => a.text).join("\n") || "(no material)",
      grade: knot.grade
    };
  });
}

async function settleScenes(record: SessionRecord): Promise<WaveTuple[]> {
  const key = record.meta.id;
  const committed: WaveTuple[] = [];
  for (let round = 0; round < 4; round += 1) {
    const projection = project(record.tuples);
    let fired = false;
    for (const scene of projection.scenes) {
      if (scene.status !== "active" || !scene.closeBindId || scene.knots.length === 0) continue;
      if (scene.candidate) continue; // one-shot rendezvous (Vol. 06 §4.2)
      if (!scene.knots.every(knotSettled)) continue;

      const uid = `${scene.closeBindId}#1`;
      const entries = closeEntries(scene, projection);
      const emitTarget = scene.returnTo
        ? "learning.integration.returned"
        : "learning.integration.candidate";
      committed.push(
        ...(await commit(record, [
          fact(key, "service.request", {
            bindId: scene.closeBindId,
            uid,
            instruction:
              scene.closeInstruction ??
              "Integrate the ripened understandings into one seam-preserving articulation.",
            scope: { entries: entries.map((e) => ({ name: e.name, kind: e.kind })) },
            emit: { writes: emitTarget }
          })
        ]))
      );
      const folded = await foldIntegration({
        title: scene.title,
        purpose: scene.purpose,
        rootText: rootText(record, ""),
        entries
      });
      committed.push(
        ...(await commit(record, [
          fact(key, emitTarget, {
            bindId: scene.closeBindId,
            uid,
            ...(scene.returnTo ? { parentKnotId: scene.returnTo } : {}),
            result: folded.result,
            source: folded.source
          })
        ]))
      );
      // The returned integration winds the parent knot through the return
      // socket the parent has carried since birth.
      if (scene.returnTo) {
        const parentKnot = knotOrNull(record, scene.returnTo);
        if (parentKnot && !parentKnot.ready) {
          committed.push(
            ...(await windKnot(record, parentKnot, [{ label: "return", text: folded.result.statement }]))
          );
        }
      }
      fired = true;
    }
    if (!fired) break;
  }
  return committed;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

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
    if (refreshed) {
      tuples.push(...(await windKnot(record, refreshed, [{ label: vector, text: body.text.trim() }])));
    }
    tuples.push(...(await settleScenes(record)));
    return { tuples };
  }

  if (operator?.id === "reframe") {
    const targetOffset = Number((operator.parameters as { targetOffset?: unknown } | undefined)?.targetOffset);
    if (!Number.isInteger(targetOffset) || targetOffset < 0) {
      return { tuples, refused: { reasons: ["Reframe requires parameters.targetOffset — the produced tuple to read."] } };
    }
    const result = await formReframeScene(record, {
      turnId,
      lens: body.text.trim(),
      targetOffset
    });
    tuples.push(...result.tuples);
    return result.refused ? { tuples, refused: result.refused } : { tuples };
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
      const projection = project(record.tuples);
      const preferSlugs = projection.sources
        .filter((s) => s.store === "spec")
        .map((s) => s.ref.split("#")[0]);
      const excerpts = await findEvidence(query, 3, preferSlugs);
      if (excerpts.length === 0) {
        return { tuples: [], refused: { reasons: ["No sufficiently relevant sections found in the specification set for this question."] } };
      }
      const tuples: WaveTuple[] = [];
      tuples.push(
        ...(await commit(record, [
          fact(key, "learning.evidence.registered", { knotId: knot.knotId, query, excerpts })
        ]))
      );
      const deltas: WindDelta[] = excerpts.map((e) => ({
        label: "evidence" as const,
        text: `${e.volume}, "${e.section}": ${e.excerpt}`,
        resource: { store: "spec" as const, ref: `${e.slug}#${e.anchor}`, title: `${e.volume} · ${e.section}` }
      }));
      const refreshed = knotOrNull(record, knot.knotId);
      if (refreshed) tuples.push(...(await windKnot(record, refreshed, deltas)));
      tuples.push(...(await settleScenes(record)));
      return { tuples };
    }

    case "readSource": {
      const knot = knotOrNull(record, body.knotId);
      if (!knot) return { tuples: [], refused: { reasons: [`Unknown knot ${body.knotId}.`] } };
      const projection = project(record.tuples);
      let resource = projection.sources.find(
        (s) => s.store === body.store && s.ref === body.ref
      );
      const tuples: WaveTuple[] = [];
      if (!resource) {
        // A catalogue selection beyond the shelf: validate that it resolves,
        // then declare it on the shelf first — the shelf grows only through
        // explicit, committed human acts.
        if (body.store !== "spec") {
          return { tuples: [], refused: { reasons: ["Only specification catalogue refs can be declared mid-session."] } };
        }
        const resolved = await resolverFor(record).resolve({ store: "spec", ref: body.ref });
        if (!resolved) {
          return { tuples: [], refused: { reasons: [`Unknown catalogue ref "${body.ref}".`] } };
        }
        resource = {
          store: "spec",
          ref: body.ref,
          title: resolved.title,
          excerpt: boundText(resolved.content, 240)
        };
        tuples.push(
          ...(await commit(record, [
            fact(key, "learning.source.declared", { resource, actor: "learner" })
          ]))
        );
      }
      tuples.push(
        ...(await commit(record, [
          fact(key, "learning.source.presented", { knotId: knot.knotId, resource })
        ]))
      );
      const refreshed = knotOrNull(record, knot.knotId);
      if (refreshed) {
        tuples.push(
          ...(await windKnot(record, refreshed, [
            {
              label: "source",
              text: resource.excerpt || resource.title || resource.ref,
              resource
            }
          ]))
        );
      }
      tuples.push(...(await settleScenes(record)));
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

    case "accept": {
      const projection = project(record.tuples);
      const scene = projection.scenes.find((s) => s.bindId === body.bindId);
      if (!scene?.candidate) return { tuples: [], refused: { reasons: ["The scene has no published integration to accept."] } };
      if (scene.candidate.offset !== body.candidateOffset) {
        return { tuples: [], refused: { reasons: ["The candidate changed since it was shown — review the current candidate."] } };
      }
      if (scene.status === "integrated") return { tuples: [], refused: { reasons: ["This scene is already integrated."] } };
      const valueId = `v${projection.values.length + 1}`;
      const tuples = await commit(record, [
        fact(key, "learning.integration.accepted", {
          valueId,
          bindId: body.bindId,
          candidateOffset: body.candidateOffset,
          title: scene.title,
          actor: "learner"
        })
      ]);
      return { tuples };
    }

    case "markUnknown": {
      const knot = knotOrNull(record, body.knotId);
      if (!knot) return { tuples: [], refused: { reasons: [`Unknown knot ${body.knotId}.`] } };
      const tuples: WaveTuple[] = [];
      tuples.push(
        ...(await commit(record, [
          fact(key, "learning.knot.marked", { knotId: body.knotId, mark: "unknown", actor: "learner" })
        ]))
      );
      tuples.push(...(await settleScenes(record)));
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
