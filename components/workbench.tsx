"use client";

// The study workspace of ADR-003: one scene in focus (bind heading + knots),
// left rail of root material and released values, right rail of child scenes,
// one composer whose context changes the meaning of a turn. Every durable
// visible state is derived from the committed tuple log via project() — the
// browser holds no semantic history of its own.

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { project } from "@/lib/projection";
import type {
  CommandResult,
  DecisionBody,
  KnotView,
  SceneView,
  SessionMeta,
  TurnBody,
  WaveTuple
} from "@/lib/types";

type ComposerMode =
  | { mode: "plain" }
  | { mode: "answer" | "challenge"; knotId: string }
  | { mode: "unfold" };

function payloadOf(tuple: WaveTuple): Record<string, unknown> {
  return (tuple.payload ?? {}) as Record<string, unknown>;
}

function factDataOf(tuple: WaveTuple): Record<string, unknown> {
  const payload = payloadOf(tuple);
  return (payload.data ?? {}) as Record<string, unknown>;
}

function tupleLabel(tuple: WaveTuple): string {
  if (tuple.kind !== "domain.fact") return tuple.kind;
  return String(payloadOf(tuple).factType ?? "domain.fact");
}

function truncate(text: string, limit: number): string {
  return text.length > limit ? text.slice(0, limit - 1).replace(/\s+\S*$/, "") + "…" : text;
}

// The trace as a stream of thought: who moved (the learner, the machine's
// own structures, or the world behind the membrane) and what the move was.
type TraceActor = "learner" | "machine" | "world";

function describeTuple(tuple: WaveTuple): { actor: TraceActor; summary: string } {
  const p = payloadOf(tuple) as Record<string, unknown>;
  if (tuple.kind === "sys.knot.defined") {
    const config = p.config as { condition?: { questions?: string[] } } | undefined;
    return {
      actor: "machine",
      summary: `knot ${p.id} registered — "${truncate(String(config?.condition?.questions?.[0] ?? ""), 70)}"`
    };
  }
  if (tuple.kind === "sys.descriptor.defined") {
    const operator = p.operator as { demands?: unknown[]; return_to?: string } | undefined;
    return {
      actor: "machine",
      summary: `close bind ${p.id} registered — ${operator?.demands?.length ?? 0} demands${
        operator?.return_to ? `, returns to ${operator.return_to}` : ""
      }`
    };
  }
  if (tuple.kind === "sys.knot.ready") {
    const understanding = p.understanding as { grade?: number } | undefined;
    return {
      actor: "machine",
      summary: `readiness reified — ${p.knotId} (grade ${Number(understanding?.grade ?? 0).toFixed(2)})`
    };
  }
  const d = factDataOf(tuple);
  const type = tupleLabel(tuple);
  const src = d.source ? ` (${d.source})` : "";
  switch (type) {
    case "learning.session.opened": {
      const subject = d.subject as { title?: string; text?: string } | undefined;
      return { actor: "learner", summary: `session opened — ${truncate(String(subject?.title ?? subject?.text ?? ""), 70)}` };
    }
    case "learning.source.declared":
      return { actor: "learner", summary: `source declared on the shelf — ${truncate(String((d.resource as { title?: string })?.title ?? ""), 64)}` };
    case "learning.source.presented":
      return {
        actor: "machine",
        summary: `source presented to ${d.knotId ?? d.bindId} — ${truncate(String((d.resource as { title?: string })?.title ?? ""), 54)}`
      };
    case "learning.turn.submitted":
      if (d.operator) return { actor: "learner", summary: `turn — operator ${(d.operator as { id?: string }).id} requested` };
      if (d.targetKnotId) return { actor: "learner", summary: `turn — ${d.vector ?? "answer"} aimed at ${d.targetKnotId}` };
      return { actor: "learner", summary: `plain signal — "${truncate(String(d.text ?? ""), 70)}"` };
    case "learning.bind.selected":
      return { actor: "machine", summary: `bind ${d.bindId} selected (operator ${d.operatorId})` };
    case "service.request":
      return { actor: "machine", summary: `${d.bindId} gathered its scope and projected intention ${d.uid}` };
    case "service.failed":
      return { actor: "world", summary: `service failed — ${truncate(String(d.reason ?? ""), 70)}` };
    case "learning.knot.seeded":
      return { actor: "machine", summary: `head fact seeded ${d.knot} — angle "${d.angle}"` };
    case "learning.scene.unfolded": {
      const result = d.result as { title?: string } | undefined;
      return { actor: "world", summary: `scene published — "${truncate(String(result?.title ?? ""), 60)}"${src}` };
    }
    case "learning.answer.submitted":
      return { actor: "learner", summary: `${d.vector ?? "answer"} → ${d.knotId}: "${truncate(String(d.answer ?? ""), 60)}"` };
    case "learning.evidence.registered":
      return { actor: "machine", summary: `evidence registered → ${d.knotId} (${(d.excerpts as unknown[])?.length ?? 0} excerpts)` };
    case "inference.request":
      return { actor: "machine", summary: `${d.knotId} projected winding intention ${d.uid} (${(d.deltas as unknown[])?.length ?? 0} deltas)` };
    case "inference.response":
      return { actor: "world", summary: `world integrated → ${d.knotId}, grade ${Number(d.grade ?? 0).toFixed(2)}${src}` };
    case "inference.reasoning":
      return { actor: "world", summary: `reasoning behind ${d.uid}` };
    case "inference.failed":
      return { actor: "world", summary: `winding failed — ${truncate(String(d.reason ?? ""), 70)}` };
    case "learning.knot.marked":
      return { actor: "learner", summary: `marked explicitly unknown — ${d.knotId}` };
    case "learning.integration.candidate":
      return { actor: "world", summary: `${d.bindId} published the integration candidate${src}` };
    case "learning.integration.returned":
      return { actor: "world", summary: `${d.bindId} published the return → ${d.parentKnotId}${src}` };
    case "learning.integration.accepted":
      return { actor: "learner", summary: `accepted — released as ${d.valueId}` };
    case "learning.session.result.candidate":
      return { actor: "machine", summary: "result candidate assembled — the completion gate passed" };
    case "learning.session.completed":
      return { actor: "learner", summary: "session completed — attested" };
    default:
      return { actor: "machine", summary: type };
  }
}

export function Workbench({ sessionId }: { sessionId: string }) {
  const [meta, setMeta] = useState<SessionMeta | null>(null);
  const [tuples, setTuples] = useState<WaveTuple[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [focusSceneId, setFocusSceneId] = useState<string | null>(null);
  const [composer, setComposer] = useState<ComposerMode>({ mode: "plain" });
  const [input, setInput] = useState("");
  const [traceOpen, setTraceOpen] = useState(false);
  const [traceFilter, setTraceFilter] = useState<TraceActor | "all">("all");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [sourceMenuKnotId, setSourceMenuKnotId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Could not load the session.");
        if (!cancelled) {
          setMeta(data.meta);
          setTuples(data.tuples);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Could not load the session.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const projection = useMemo(() => project(tuples ?? []), [tuples]);
  const completed = projection.status === "completed";

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [focusSceneId]);

  const rootScene = projection.scenes.find((s) => !s.parentBindId) ?? null;
  const focusedScene =
    projection.scenes.find((s) => s.bindId === focusSceneId) ?? rootScene ?? null;
  const childScenes = focusedScene
    ? projection.scenes.filter((s) => s.parentBindId === focusedScene.bindId)
    : [];

  const ancestry: SceneView[] = useMemo(() => {
    const chain: SceneView[] = [];
    let current = focusedScene;
    while (current?.parentBindId) {
      const parent = projection.scenes.find((s) => s.bindId === current?.parentBindId);
      if (!parent) break;
      chain.unshift(parent);
      current = parent;
    }
    return chain;
  }, [focusedScene, projection.scenes]);

  const applyResult = useCallback((result: CommandResult) => {
    if (result.tuples.length > 0) {
      setTuples((current) => [...(current ?? []), ...result.tuples]);
    }
    if (result.refused) setNotice(result.refused.reasons);
    else setNotice(null);
    const selected = [...result.tuples]
      .reverse()
      .find((t) => tupleLabel(t) === "learning.bind.selected");
    if (selected) setFocusSceneId(String(factDataOf(selected).bindId ?? ""));
    return result;
  }, []);

  async function post(path: string, body: TurnBody | DecisionBody): Promise<CommandResult | null> {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok && !data.tuples) {
        setNotice([data.error ?? "The command was not accepted."]);
        return null;
      }
      return applyResult(data as CommandResult);
    } catch {
      setNotice(["The request failed — check the connection and try again."]);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function submitTurn(event?: FormEvent) {
    event?.preventDefault();
    if (busy || completed) return;
    const text = input.trim();
    let body: TurnBody;
    if (composer.mode === "answer" || composer.mode === "challenge") {
      if (!text) return;
      body = { text, targetKnotId: composer.knotId, vector: composer.mode };
    } else if (composer.mode === "unfold") {
      body = {
        text,
        operator: { id: "unfold" },
        sourceRefs: projection.values.map((v) => v.valueId),
        focusRef: "root"
      };
    } else {
      if (!text) return;
      body = { text, focusRef: "root" };
    }
    const result = await post(`/api/sessions/${sessionId}/turns`, body);
    if (result && !result.refused) {
      setInput("");
      if (composer.mode !== "unfold") setComposer({ mode: "plain" });
      else setComposer({ mode: "plain" });
    }
  }

  async function decide(body: DecisionBody, after?: (result: CommandResult) => void) {
    if (busy) return;
    const result = await post(`/api/sessions/${sessionId}/decisions`, body);
    if (result && !result.refused) after?.(result);
  }

  function focusVector(mode: "answer" | "challenge", knot: KnotView) {
    setComposer({ mode, knotId: knot.knotId });
    inputRef.current?.focus();
  }

  function knotById(knotId: string | undefined): KnotView | null {
    if (!knotId) return null;
    for (const scene of projection.scenes) {
      const knot = scene.knots.find((k) => k.knotId === knotId);
      if (knot) return knot;
    }
    return null;
  }

  if (loadError) {
    return (
      <main style={{ padding: "60px 4%" }}>
        <p className="notice">{loadError}</p>
        <p style={{ marginTop: 16 }}>
          <a href="/studio">← Back to the workbench</a>
        </p>
      </main>
    );
  }

  if (!tuples || !meta) {
    return (
      <main style={{ padding: "60px 4%", color: "var(--muted)", font: "500 11px var(--mono)", letterSpacing: ".1em" }}>
        REPLAYING THE LOG…
      </main>
    );
  }

  const subjectLabel =
    projection.subject.kind === "volume" ? projection.subject.title : projection.subject.text;
  const composerChip =
    composer.mode === "plain" ? (
      <>Plain signal → root material</>
    ) : composer.mode === "unfold" ? (
      <>Operator: unfold → new scene</>
    ) : (
      <>
        {composer.mode === "answer" ? "Answer" : "Challenge"} →{" "}
        {truncate(knotById(composer.knotId)?.question ?? "", 46)}
      </>
    );

  return (
    <main>
      <div className="session-strip">
        <span>
          Subject: <b>{truncate(subjectLabel, 70)}</b>
        </span>
        <span>Contract: defended-articulation@1</span>
        <span>
          {projection.counts.tuples} tuples · {projection.counts.unanswered} unanswered ·{" "}
          {projection.counts.failures} failures
        </span>
        <span className="spacer" />
        {completed ? (
          <span className="completed-chip">Session completed · attested</span>
        ) : projection.result ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => decide({ kind: "attest", resultOffset: projection.result!.offset })}
          >
            Attest &amp; complete
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={() => decide({ kind: "finish" })}>
            Request completion
          </button>
        )}
        <button type="button" onClick={() => setTraceOpen((open) => !open)}>
          {traceOpen ? "Hide trace" : "Trace"}
        </button>
        <a href="/studio" style={{ font: "inherit", color: "var(--muted)" }}>
          Exit
        </a>
      </div>

      {notice && (
        <div className="notice">
          The machine refused honestly:
          <ul>
            {notice.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {projection.result && (
        <section className="result-panel">
          <span className="eyebrow">
            {completed ? "Attested result · defended-articulation@1" : "Result candidate — review and attest"}
          </span>
          <h3>Defended articulation</h3>
          <p className="statement">{projection.result.document.statement}</p>
          {projection.result.document.values.map((value) => (
            <div className="value-block" key={value.valueId}>
              <b>
                {value.valueId} · {value.title}
              </b>
              <p>{value.statement}</p>
            </div>
          ))}
          {projection.result.document.openQuestions.length > 0 && (
            <div className="value-block">
              <b>Preserved open questions</b>
              <ul className="open-qs">
                {projection.result.document.openQuestions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          )}
          <p style={{ font: "500 10px var(--mono)", color: "var(--muted)", marginTop: 12 }}>
            {projection.result.document.evidenceCount} evidence excerpt(s) wound across the session ·
            provenance lives in the trace
          </p>
        </section>
      )}

      <div className="workspace">
        <aside className="rail left">
          {projection.sources.length > 0 && (
            <section>
              <h4>Sources on the shelf</h4>
              <div className="chip-column">
                {projection.sources.map((source) => (
                  <span className="src-chip" key={`${source.store}:${source.ref}`}>
                    {source.store === "spec" ? (
                      <a href={`/spec/${source.ref}`} target="_blank" rel="noreferrer">
                        {truncate(source.title ?? source.ref, 54)}
                      </a>
                    ) : (
                      truncate(source.title ?? source.ref, 54)
                    )}
                  </span>
                ))}
              </div>
            </section>
          )}
          <section>
            <h4>Root material</h4>
            {projection.rootMaterials.length === 0 && (
              <p className="root-item">Nothing yet — your words will rest here as plain signals.</p>
            )}
            {projection.rootMaterials.map((material) => (
              <p className="root-item" key={material.offset}>
                {material.text}
                <small>offset {material.offset} · plain signal</small>
              </p>
            ))}
          </section>
          <section>
            <h4>Released values</h4>
            {projection.values.length === 0 && (
              <p className="root-item">Accepted integrations will settle here for later affinity.</p>
            )}
            {projection.values.map((value) => (
              <div className="value-card" key={value.valueId}>
                <b>
                  {value.valueId} · {truncate(value.title, 60)}
                </b>
                <p>{truncate(value.statement, 180)}</p>
                <small>
                  {value.returnedToKnotId ? "returned to parent knot" : "available for affinity"}
                </small>
              </div>
            ))}
          </section>
        </aside>

        <section className="scene">
          {focusedScene ? (
            <>
              <div className="scene-crumbs">
                <button type="button" onClick={() => setFocusSceneId(rootScene?.bindId ?? null)}>
                  Root
                </button>
                {ancestry.map((scene) => (
                  <span key={scene.bindId}>
                    {" / "}
                    <button type="button" onClick={() => setFocusSceneId(scene.bindId)}>
                      {truncate(scene.title, 34)}
                    </button>
                  </span>
                ))}
                <span>{ancestry.length > 0 || focusedScene !== rootScene ? " / " : ""}</span>
                <span>{truncate(focusedScene.title, 44)}</span>
              </div>
              <div className="scene-head">
                <span className="eyebrow">
                  {focusedScene.bindId} · operator {focusedScene.operatorId} · {focusedScene.status}
                </span>
                <h2>{focusedScene.title}</h2>
                {focusedScene.purpose && <p className="purpose">{focusedScene.purpose}</p>}
                {focusedScene.sources.length > 0 && (
                  <div className="chip-row">
                    {focusedScene.sources.map((source) => (
                      <span className="src-chip" key={`${source.store}:${source.ref}`}>
                        {truncate(source.title ?? source.ref, 44)}
                      </span>
                    ))}
                  </div>
                )}
                {focusedScene.status === "active" && focusedScene.knots.length > 0 && (
                  <p className="barrier-note">
                    close bind {focusedScene.closeBindId ?? "—"} · barrier{" "}
                    {focusedScene.knots.filter((k) => k.ready || k.unknown || k.returned).length} /{" "}
                    {focusedScene.knots.length} settled — it publishes its integration itself once
                    every knot is ready, returned, or explicitly unknown
                    {focusedScene.returnTo ? `; the return is addressed to ${focusedScene.returnTo}` : ""}
                  </p>
                )}
              </div>

              <div className="knot-list">
                {focusedScene.knots.map((knot) => (
                  <article
                    className={`knot${knot.ready ? " ready" : ""}${knot.unknown ? " unknown" : ""}${
                      composer.mode !== "plain" && composer.mode !== "unfold" && composer.knotId === knot.knotId
                        ? " focused"
                        : ""
                    }`}
                    key={knot.knotId}
                  >
                    <div className="knot-meta">
                      <span className="angle">{knot.angle || knot.lane}</span>
                      {knot.ready && <span className="ready-chip">ready</span>}
                      {knot.returned && !knot.ready && <span className="ready-chip">returned</span>}
                      {knot.unknown && <span className="unknown-chip">explicitly unknown</span>}
                      <span className="grade-meter">
                        <span className="bar">
                          <b
                            className={knot.grade >= knot.threshold ? "hot" : ""}
                            style={{ width: `${Math.round(knot.grade * 100)}%` }}
                          />
                        </span>
                        <span>
                          grade {knot.grade.toFixed(2)} / {knot.threshold.toFixed(2)}
                        </span>
                      </span>
                    </div>
                    <p className="knot-question">{knot.question}</p>
                    {knot.sources.length > 0 && (
                      <div className="chip-row">
                        {knot.sources.map((source, index) => (
                          <span className="src-chip read" key={index}>
                            read: {truncate(source.title ?? source.ref, 40)}
                          </span>
                        ))}
                      </div>
                    )}
                    {knot.state && <p className="knot-state">{knot.state}</p>}
                    {knot.evidence.length > 0 && (
                      <div className="knot-evidence">
                        {knot.evidence.map((excerpt, index) => (
                          <p key={index}>
                            “{excerpt.excerpt}”{" "}
                            <a href={`/spec/${excerpt.slug}#${excerpt.anchor}`} target="_blank" rel="noreferrer">
                              {excerpt.volume} · {excerpt.section}
                            </a>
                          </p>
                        ))}
                      </div>
                    )}
                    {knot.returned && (
                      <p className="returned-note">
                        ↩ the child scene&rsquo;s integration returned to this knot
                        {knot.returnedValueId ? ` (released as ${knot.returnedValueId})` : ""}
                        {knot.returnOffset !== undefined ? ` · offset ${knot.returnOffset}` : ""}
                      </p>
                    )}
                    <div className="knot-actions">
                      <button
                        type="button"
                        className={`vec-btn${
                          composer.mode === "answer" && composer.knotId === knot.knotId ? " on" : ""
                        }`}
                        disabled={completed}
                        onClick={() => focusVector("answer", knot)}
                      >
                        Answer
                      </button>
                      <button
                        type="button"
                        className={`vec-btn${
                          composer.mode === "challenge" && composer.knotId === knot.knotId ? " on" : ""
                        }`}
                        disabled={completed}
                        onClick={() => focusVector("challenge", knot)}
                      >
                        Challenge
                      </button>
                      <button
                        type="button"
                        className={`vec-btn${sourceMenuKnotId === knot.knotId ? " on" : ""}`}
                        disabled={busy || completed}
                        onClick={() => {
                          if (projection.sources.length === 0) {
                            decide({ kind: "evidence", knotId: knot.knotId });
                          } else {
                            setSourceMenuKnotId((current) =>
                              current === knot.knotId ? null : knot.knotId
                            );
                          }
                        }}
                      >
                        Evidence
                      </button>
                      {knot.childBindId ? (
                        <button
                          type="button"
                          className="vec-btn"
                          onClick={() => setFocusSceneId(knot.childBindId!)}
                        >
                          Open child scene
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="vec-btn"
                          disabled={busy || completed}
                          onClick={() => decide({ kind: "deepen", knotId: knot.knotId })}
                        >
                          Deepen
                        </button>
                      )}
                      {!knot.ready && !knot.unknown && (
                        <button
                          type="button"
                          className="vec-btn"
                          disabled={busy || completed}
                          onClick={() => decide({ kind: "markUnknown", knotId: knot.knotId })}
                        >
                          Mark unknown
                        </button>
                      )}
                    </div>
                    {sourceMenuKnotId === knot.knotId && (
                      <div className="src-menu">
                        <span className="eyebrow">Ground this knot in evidence</span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setSourceMenuKnotId(null);
                            decide({ kind: "evidence", knotId: knot.knotId });
                          }}
                        >
                          Search the specification set for this question
                        </button>
                        {projection.sources.map((source) => (
                          <button
                            type="button"
                            key={`${source.store}:${source.ref}`}
                            disabled={busy}
                            onClick={() => {
                              setSourceMenuKnotId(null);
                              decide({
                                kind: "readSource",
                                knotId: knot.knotId,
                                store: source.store,
                                ref: source.ref
                              });
                            }}
                          >
                            Read into the knot: {truncate(source.title ?? source.ref, 60)}
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>

              {focusedScene.candidate && focusedScene.status !== "integrated" && (
                <div className="candidate-panel">
                  <span className="eyebrow">
                    {focusedScene.returnTo
                      ? `Published by ${focusedScene.closeBindId} — already returned to ${focusedScene.returnTo}; accepting releases it to the left rail`
                      : `Published by ${focusedScene.closeBindId} at its barrier — seams preserved`}
                  </span>
                  <h3>{focusedScene.title}</h3>
                  <p className="statement">{focusedScene.candidate.statement}</p>
                  {focusedScene.candidate.contributions.length > 0 && (
                    <div className="seams">
                      {focusedScene.candidate.contributions.map((contribution, index) => (
                        <p className="seam" key={index}>
                          <b>{contribution.source}</b>
                          {contribution.note}
                        </p>
                      ))}
                    </div>
                  )}
                  {focusedScene.candidate.openQuestions.length > 0 && (
                    <ul className="open-qs">
                      {focusedScene.candidate.openQuestions.map((question, index) => (
                        <li key={index}>open: {question}</li>
                      ))}
                    </ul>
                  )}
                  <div className="scene-actions">
                    <button
                      type="button"
                      className="op-btn terra"
                      disabled={busy || completed}
                      onClick={() =>
                        decide(
                          {
                            kind: "accept",
                            bindId: focusedScene.bindId,
                            candidateOffset: focusedScene.candidate!.offset
                          },
                          () => {
                            if (focusedScene.parentBindId) setFocusSceneId(focusedScene.parentBindId);
                          }
                        )
                      }
                    >
                      Accept — release to the left
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="scene-head">
                <span className="eyebrow">Root · no scene yet</span>
                <h2>{truncate(subjectLabel, 90)}</h2>
                <p className="purpose">
                  Write your root material below — it is committed as a plain signal and rests
                  quietly. When you are ready, switch the composer to the unfold operator to form
                  the first scene of question knots.
                </p>
              </div>
            </>
          )}
        </section>

        <aside className="rail right">
          <section>
            <h4>Depth — child scenes</h4>
            {childScenes.length === 0 && (
              <p className="root-item">Deepen a knot to open a child scene here.</p>
            )}
            {childScenes.map((scene) => (
              <button
                type="button"
                className={`child-link${scene.bindId === focusSceneId ? " active" : ""}`}
                key={scene.bindId}
                onClick={() => setFocusSceneId(scene.bindId)}
              >
                <b>{truncate(scene.title, 52)}</b>
                <small>
                  {scene.bindId} · {scene.status}
                </small>
              </button>
            ))}
          </section>
          {projection.scenes.length > 1 && (
            <section>
              <h4>All scenes</h4>
              {projection.scenes.map((scene) => (
                <button
                  type="button"
                  className={`child-link${scene.bindId === (focusedScene?.bindId ?? "") ? " active" : ""}`}
                  key={scene.bindId}
                  onClick={() => setFocusSceneId(scene.bindId)}
                >
                  <b>{truncate(scene.title, 52)}</b>
                  <small>
                    {scene.bindId} · {scene.status}
                    {scene.parentBindId ? ` · child of ${scene.parentBindId}` : " · root"}
                  </small>
                </button>
              ))}
            </section>
          )}
        </aside>
      </div>

      <form className="composer-bar" onSubmit={submitTurn}>
        <span className={`composer-context${composer.mode === "plain" ? " plain" : ""}`}>{composerChip}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            completed
              ? "The session is completed — its log remains readable."
              : composer.mode === "unfold"
                ? "Optional emphasis for the unfold — or send as is."
                : "Write here. Nothing activates until you choose an operator."
          }
          disabled={completed || busy}
          aria-label="Composer"
        />
        <button
          type="button"
          className={`vec-btn${composer.mode === "unfold" ? " on" : ""}`}
          disabled={completed}
          onClick={() =>
            setComposer((current) => (current.mode === "unfold" ? { mode: "plain" } : { mode: "unfold" }))
          }
        >
          Unfold
        </button>
        <button className="send" type="submit" disabled={busy || completed}>
          {busy ? "Committing…" : "Commit"}
        </button>
      </form>
      <p className="composer-hint">
        one composer · plain signal / knot answer / operator — the context above the field decides
        how this turn is committed
      </p>

      {traceOpen && (
        <section className="trace-drawer">
          <div className="trace-head">
            <div>
              <h4>Trace — the session&rsquo;s wave log</h4>
              <p className="trace-note">
                The stream of thought of the machine you are studying, as it is committed: the
                learner supplies facts and judgement, the machine&rsquo;s structures register,
                wind and gather, and the world behind the membrane answers. Everything on the
                screen above is a derivation of these tuples; click a row for its payload.
              </p>
            </div>
            <div className="trace-filters">
              {(["all", "learner", "machine", "world"] as const).map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={traceFilter === filter ? "on" : ""}
                  onClick={() => setTraceFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          {tuples.map((tuple) => {
            const { actor, summary } = describeTuple(tuple);
            if (traceFilter !== "all" && actor !== traceFilter) return null;
            const data = factDataOf(tuple);
            const uid = typeof data.uid === "string" ? data.uid : null;
            const isOpen = expanded.has(tuple.offset);
            return (
              <div className={`tuple-row actor-${actor}`} key={tuple.offset}>
                <div
                  className="tuple-head"
                  onClick={() =>
                    setExpanded((current) => {
                      const nextSet = new Set(current);
                      if (nextSet.has(tuple.offset)) nextSet.delete(tuple.offset);
                      else nextSet.add(tuple.offset);
                      return nextSet;
                    })
                  }
                >
                  <span className="off">{tuple.offset}</span>
                  <span className={`actor-chip ${actor}`}>{actor}</span>
                  <span className="summary">{summary}</span>
                  {uid && <span className="uid">{uid}</span>}
                  <span className="kind-tag">{tupleLabel(tuple)}</span>
                </div>
                {isOpen && <pre className="tuple-payload">{JSON.stringify(tuple.payload, null, 2)}</pre>}
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
