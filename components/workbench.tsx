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
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
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
                <div className="scene-actions">
                  {focusedScene.status !== "integrated" && (
                    <button
                      type="button"
                      className="op-btn primary"
                      disabled={busy || completed}
                      onClick={() => decide({ kind: "integrate", bindId: focusedScene.bindId })}
                    >
                      {focusedScene.candidate ? "Re-integrate" : "Integrate the scene"}
                    </button>
                  )}
                </div>
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
                      <span className="angle">{knot.angle}</span>
                      {knot.ready && <span className="ready-chip">ready</span>}
                      {knot.unknown && <span className="unknown-chip">explicitly unknown</span>}
                      <span className="grade-meter">
                        <span className="bar">
                          <b className={knot.grade >= 0.7 ? "hot" : ""} style={{ width: `${Math.round(knot.grade * 100)}%` }} />
                        </span>
                        <span>grade {knot.grade.toFixed(2)}</span>
                      </span>
                    </div>
                    <p className="knot-question">{knot.question}</p>
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
                    {knot.returnedValueId && (
                      <p className="returned-note">
                        ↩ child scene integrated — value {knot.returnedValueId} returned to this knot
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
                        className="vec-btn"
                        disabled={busy || completed}
                        onClick={() => decide({ kind: "evidence", knotId: knot.knotId })}
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
                  </article>
                ))}
              </div>

              {focusedScene.candidate && focusedScene.status !== "integrated" && (
                <div className="candidate-panel">
                  <span className="eyebrow">Integration candidate — seams preserved</span>
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
          <h4>Trace — the session&rsquo;s wave log</h4>
          <p className="trace-note">
            Every element of the scene above is a derivation of these committed tuples (offset ·
            kind/factType · correlation). This is the machine you are studying, reading its own
            passage: winding intentions and integrations join by uid, readiness is reified as
            sys.knot.ready, and nothing you see lives outside this log.
          </p>
          {tuples.map((tuple) => {
            const data = factDataOf(tuple);
            const label = tupleLabel(tuple);
            const uid = typeof data.uid === "string" ? data.uid : null;
            const owner =
              typeof data.knotId === "string"
                ? data.knotId
                : typeof data.bindId === "string"
                  ? data.bindId
                  : null;
            const grade = typeof data.grade === "number" ? data.grade : null;
            const isOpen = expanded.has(tuple.offset);
            return (
              <div className="tuple-row" key={tuple.offset}>
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
                  <span className={`kind${tuple.kind !== "domain.fact" ? " sys" : ""}`}>{label}</span>
                  {owner && <span className="uid">{owner}</span>}
                  {uid && <span className="uid">{uid}</span>}
                  {grade !== null && <span className="gr">grade {grade.toFixed(2)}</span>}
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
