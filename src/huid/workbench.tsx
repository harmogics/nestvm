"use client";

// The study workspace of ADR-003, playing the host (HUID 01) until step 2
// of the migration completes: snapshot transport per contract, the named
// parameter space, the one port, the centre carousel registry, dock
// chrome. The centre lenses are contract-backed modules (scene-detail /
// produced-texts / trace); the client projection below serves only the
// strip, the left rail and the result panel until their contracts land
// (recorded interim — refimpl 03 §3). The browser holds no semantic
// history of its own.

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRODUCED_TEXTS, type ProducedTextsSnapshot } from "@/huid/contracts/produced-texts";
import { SCENE_REGISTRY, type SceneRegistrySnapshot } from "@/huid/contracts/scene-registry";
import { TRACE, type TraceSnapshot } from "@/huid/contracts/trace";
import type { ModuleManifest, ModulePort } from "@/huid/manifest";
import { SCENE_DETAIL, type SceneDetailSnapshot } from "@/huid/contracts/scene-detail";
import { centreCanvasManifest } from "@/huid/modules/centre-canvas/manifest";
import { CentreCanvas, selectCentreCanvas } from "@/huid/modules/centre-canvas/view";
import { centreFocusManifest } from "@/huid/modules/centre-focus/manifest";
import {
  CentreFocus,
  selectCentreFocus,
  type Catalogue,
  type ComposerTargetParam
} from "@/huid/modules/centre-focus/view";
import { centreLogManifest } from "@/huid/modules/centre-log/manifest";
import { CentreLog, selectCentreLog } from "@/huid/modules/centre-log/view";
import { depthRailManifest } from "@/huid/modules/depth-rail/manifest";
import { DepthRail, selectDepthRail } from "@/huid/modules/depth-rail/view";
import { sessionArchiveManifest } from "@/huid/modules/session-archive/manifest";
import { SessionArchiveChip } from "@/huid/modules/session-archive/strip";
import type { TupleReader } from "@/huid/widgets/registry";
import { project } from "@/nest/readings/projection";
import type { ResourceRef, SessionMeta, WaveTuple } from "@/nest/wave/envelope";
import type { CommandResult, DecisionBody, TurnBody } from "@/product/commands";

type ComposerTarget = NonNullable<ComposerTargetParam>;

type ComposerMode = { mode: "plain" } | ComposerTarget;

// The named parameter space (HUID 01 §4, preparation P2): one flat record
// of navigation state — client-held, never committed, never on the wire.
// Host keys are fixed here; `composer.target` is the promoted shared key
// (proposal-centre-dock §12.5.3): written by centre surfaces, read by the
// composer; absent → the composer rests in plain mode. Module keys are
// namespaced `<moduleId>.<key>` and ride the same record.
type HostParams = {
  "focus.bindId": string | null;
  "centre.view": string; // a centre-registry entry id
  "composer.target": ComposerTarget | null;
};

type Params = HostParams & Record<string, unknown>;

const initialParams: Params = {
  "focus.bindId": null,
  "centre.view": "focus",
  "composer.target": null
};

// One backend-formed snapshot per contract (ADR-010 Decision 4).
type ContractSnapshot = { model: unknown; asOfOffset: number };

// Everything a seated centre module receives from the board: the formed
// snapshots, the parameter space, the port, and the Class L tuple reader
// (proposal-centre-dock §12.5.4 — modules and widgets never fetch).
type CentreContext = {
  snapshots: Record<string, ContractSnapshot>;
  params: Params;
  port: ModulePort;
  readTuple: TupleReader;
  // Interim host facilities (recorded liberties, centre-focus lid): the
  // corpus catalogue (immutable package data) and the declared-sources
  // shelf, until a shelf/session-meta contract lands.
  catalogue: Catalogue | null;
  shelf: ResourceRef[];
};

// The centre carousel registry (HUID 01 §6, preparation P3): the switch
// renders from here; exactly one entry is active via `centre.view`. A
// module entry carries its render seat (select + View over the context);
// entries without one are legacy views still rendering inline in the host
// until each extracts (HUID 03 §6 step 2). Adding a centre view = one
// entry here plus its module directory.
type CentreViewEntry = {
  id: string;
  title: string;
  render?: (ctx: CentreContext) => ReactNode;
};

const centreViews: readonly CentreViewEntry[] = [
  {
    id: "focus",
    title: "focus",
    render: (ctx) => (
      <CentreFocus
        model={selectCentreFocus(
          (ctx.snapshots[SCENE_DETAIL]?.model as SceneDetailSnapshot | undefined) ?? {
            scenes: []
          },
          {
            focusBindId: (ctx.params["focus.bindId"] as string | null) ?? null,
            composerTarget: (ctx.params["composer.target"] as ComposerTargetParam) ?? null,
            sourceMenuKnotId: (ctx.params["centre.focus.sourceMenu"] as string | null) ?? null,
            catVolume: String(ctx.params["centre.focus.catVolume"] ?? ""),
            catSection: String(ctx.params["centre.focus.catSection"] ?? ""),
            busy: Boolean(ctx.params["session.busy"] ?? false),
            completed: ctx.params["session.status"] === "completed"
          }
        )}
        port={ctx.port}
        readTuple={ctx.readTuple}
        catalogue={ctx.catalogue}
        shelf={ctx.shelf}
      />
    )
  },
  {
    id: "canvas",
    title: "canvas",
    render: (ctx) => (
      <CentreCanvas
        model={selectCentreCanvas(
          (ctx.snapshots[PRODUCED_TEXTS]?.model as ProducedTextsSnapshot | undefined) ?? {
            blocks: [],
            accepted: {},
            awaiting: []
          },
          {
            turns: Boolean(ctx.params["centre.canvas.turns"] ?? true),
            answers: Boolean(ctx.params["centre.canvas.answers"] ?? false),
            evidence: Boolean(ctx.params["centre.canvas.evidence"] ?? false),
            busy: Boolean(ctx.params["session.busy"] ?? false),
            completed: ctx.params["session.status"] === "completed"
          }
        )}
        port={ctx.port}
      />
    )
  },
  {
    id: "log",
    title: "log",
    render: (ctx) => (
      <CentreLog
        model={selectCentreLog(
          (ctx.snapshots[TRACE]?.model as TraceSnapshot | undefined) ?? { rows: [] },
          { actor: String(ctx.params["centre.log.actor"] ?? "all") }
        )}
        port={ctx.port}
        readTuple={ctx.readTuple}
      />
    )
  }
];

// The capability filter — the flag point (proposal-centre-dock §12.5.2):
// seating is configuration; an absent entry leaves the carousel shorter,
// never a dead tab. A deployment flag filters this list and nothing else.
const seatedCentreViews: readonly CentreViewEntry[] = centreViews;

// The seated modules — the host's interim registry (dock frames still
// render them inline until HUID 03 §6 step 2 completes; the snapshot
// transport below is already driven by it). Seating a contract-backed
// panel = adding its manifest here, nothing else (preparation P1).
const seatedModules: readonly ModuleManifest[] = [
  depthRailManifest,
  sessionArchiveManifest,
  centreFocusManifest,
  centreCanvasManifest,
  centreLogManifest
];

const consumedContracts: readonly string[] = [
  ...new Set(seatedModules.flatMap((manifest) => manifest.consumes))
];

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
  const [snapshots, setSnapshots] = useState<Record<string, ContractSnapshot>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [params, setParams] = useState<Params>(initialParams);
  const [input, setInput] = useState("");
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Every parameter write funnels through navigate (HUID 01 §4.4); reads
  // go through the declared keys. Parameters never reach the wire or the
  // log — consequence-bearing coordinates seal inside committed payloads.
  const navigate = useCallback((patch: Readonly<Record<string, unknown>>) => {
    setParams((current) => ({ ...current, ...patch }));
  }, []);

  const focusSceneId = params["focus.bindId"];

  // The composer is host chrome: when a centre surface retargets it
  // through the promoted key, the input takes focus here.
  const composerTargetParam = params["composer.target"];
  useEffect(() => {
    if (composerTargetParam && (composerTargetParam as ComposerTarget).mode !== "unfold") {
      inputRef.current?.focus();
    }
  }, [composerTargetParam]);
  // Never a dead tab: a `centre.view` pointing at an unseated entry falls
  // back to the first seated one (seed §9 degradation discipline).
  const centreView = seatedCentreViews.some((view) => view.id === params["centre.view"])
    ? params["centre.view"]
    : seatedCentreViews[0]?.id;
  const composer: ComposerMode = params["composer.target"] ?? { mode: "plain" };

  // The catalogue of static study material, fetched once when a knot's
  // evidence menu first opens.
  const sourceMenuOpen = params["centre.focus.sourceMenu"] != null;
  useEffect(() => {
    if (!sourceMenuOpen || catalogue) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/catalogue");
        const data = (await response.json()) as Catalogue;
        if (!cancelled) {
          setCatalogue(data);
          if (data.volumes.length > 0) {
            navigate({ "centre.focus.catVolume": data.volumes[0].slug });
          }
        }
      } catch {
        // the menu stays useful without the catalogue
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceMenuOpen, catalogue, navigate]);

  // The host's snapshot transport (ADR-009/ADR-010, preparation P1): one
  // fetch per contract consumed by a seated module — never the tuple
  // stream — deduplicated, shared by every consuming panel. Refreshed on
  // load and after every command result; SSE replaces the refetch when
  // the events channel lands. Monotonic: a snapshot at or behind the held
  // asOfOffset is dropped (proposal-centre-dock §5; CONVENTIONS §2.4 — the
  // §6.1 deviation retired here).
  const refreshPanels = useCallback(async () => {
    await Promise.all(
      consumedContracts.map(async (contract) => {
        try {
          const response = await fetch(`/api/sessions/${sessionId}/snapshots/${contract}`);
          if (!response.ok) return; // the panel keeps its last snapshot
          const snapshot = (await response.json()) as ContractSnapshot;
          setSnapshots((held) => {
            const current = held[contract];
            if (current && snapshot.asOfOffset <= current.asOfOffset) return held;
            return { ...held, [contract]: snapshot };
          });
        } catch {
          // transport hiccup — the last snapshot stands until the next refresh
        }
      })
    );
  }, [sessionId]);

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
          void refreshPanels();
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Could not load the session.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, refreshPanels]);

  const projection = useMemo(() => project(tuples ?? []), [tuples]);

  // Host keys `session.busy` / `session.status` (HUID 01 §4.1) mirrored
  // into the parameter space for consuming modules.
  useEffect(() => {
    navigate({ "session.busy": busy, "session.status": projection.status });
  }, [busy, projection.status, navigate]);
  const completed = projection.status === "completed";

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [focusSceneId]);

  // The centre's truth arrives formed (scene-detail); the client
  // projection below serves only the strip, the left rail and the result
  // panel until their contracts land (recorded interim).
  const sceneDetail =
    (snapshots[SCENE_DETAIL]?.model as SceneDetailSnapshot | undefined) ?? { scenes: [] };
  const rootSceneId = sceneDetail.scenes.find((scene) => !scene.parentBindId)?.bindId ?? null;
  const focusedBindId = focusSceneId ?? rootSceneId;

  const knotQuestion = (knotId: string): string => {
    for (const scene of sceneDetail.scenes) {
      const knot = scene.knots.find((k) => k.knotId === knotId);
      if (knot) return knot.question;
    }
    return "";
  };

  const applyResult = useCallback((result: CommandResult) => {
    if (result.tuples.length > 0) {
      setTuples((current) => [...(current ?? []), ...result.tuples]);
      void refreshPanels();
    }
    if (result.refused) setNotice(result.refused.reasons);
    else setNotice(null);
    const selected = [...result.tuples]
      .reverse()
      .find((t) => tupleLabel(t) === "learning.bind.selected");
    if (selected) {
      navigate({ "focus.bindId": String(factDataOf(selected).bindId ?? ""), "centre.view": "focus" });
    }
    return result;
  }, [refreshPanels]);

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
    } else if (composer.mode === "reframe") {
      body = {
        text,
        operator: { id: "reframe", parameters: { targetOffset: composer.targetOffset } }
      };
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
      navigate({ "composer.target": null });
    }
  }

  async function decide(body: DecisionBody, after?: (result: CommandResult) => void) {
    if (busy) return;
    const result = await post(`/api/sessions/${sessionId}/decisions`, body);
    if (result && !result.refused) after?.(result);
  }

  // The one port modules receive (HUID 01 §5, preparation P2): two verbs,
  // nothing else. Bodies route by shape — a decision carries `kind`.
  const port: ModulePort = {
    commit: (body) =>
      post(
        "kind" in body
          ? `/api/sessions/${sessionId}/decisions`
          : `/api/sessions/${sessionId}/turns`,
        body
      ),
    navigate
  };

  // The host-owned Class L reader (proposal-centre-dock §12.5.4): raw truth by
  // offset for the widgets' one-disclosure-away rule — modules and
  // widgets themselves never fetch.
  const readTuple: TupleReader = useCallback(
    async (offset: number) => {
      const response = await fetch(`/api/sessions/${sessionId}/tuples/${offset}`);
      if (!response.ok) throw new Error(`tuple ${offset} unavailable`);
      const data = (await response.json()) as { tuple: unknown };
      return data.tuple;
    },
    [sessionId]
  );

  const activeCentreEntry = seatedCentreViews.find((view) => view.id === centreView);

  const centreContext: CentreContext = {
    snapshots,
    params,
    port,
    readTuple,
    catalogue,
    shelf: projection.sources
  };



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
    ) : composer.mode === "reframe" ? (
      <>Reframe → {truncate(composer.targetTitle, 34)}</>
    ) : (
      <>
        {composer.mode === "answer" ? "Answer" : "Challenge"} →{" "}
        {truncate(knotQuestion(composer.knotId), 46)}
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
        <span className="view-switch">
          {seatedCentreViews.map((view) => (
            <button
              type="button"
              key={view.id}
              className={centreView === view.id ? "on" : ""}
              onClick={() => navigate({ "centre.view": view.id })}
            >
              {view.title}
            </button>
          ))}
        </span>
        <SessionArchiveChip sessionId={sessionId} />
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
          {activeCentreEntry?.id === "focus" && sceneDetail.scenes.length === 0 ? (
            <div className="scene-head">
              <span className="eyebrow">Root · no scene yet</span>
              <h2>{truncate(subjectLabel, 90)}</h2>
              <p className="purpose">
                Write your root material below — it is committed as a plain signal and rests
                quietly. When you are ready, switch the composer to the unfold operator to form
                the first scene of question knots.
              </p>
            </div>
          ) : (
            activeCentreEntry?.render?.(centreContext)
          )}
        </section>

        <DepthRail
          model={selectDepthRail(
            (snapshots[SCENE_REGISTRY]?.model as SceneRegistrySnapshot | undefined) ?? {
              scenes: []
            },
            { focusBindId: focusedBindId }
          )}
          port={port}
        />
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
                : composer.mode === "reframe"
                  ? "The lens for the reframe (e.g. \"plain English, one paragraph\") — or send as is."
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
            navigate({ "composer.target": composer.mode === "unfold" ? null : { mode: "unfold" } })
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

    </main>
  );
}
