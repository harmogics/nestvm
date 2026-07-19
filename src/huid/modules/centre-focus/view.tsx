// The figure lens — presentation side. The model arrives formed as the
// scene-detail snapshot (every scene in depth, parameter-free); `select`
// picks the focus, builds ancestry from parent links, and applies the
// module's disclosure parameters. Every knot card renders model fields
// only — the wound state and grade are the committed record's, never a
// register's (Vol. 02 §4.7); the strata disclosure composes the shared
// row widget (design_proposal §7, trap 4 — a kneaded card composes
// factory widgets, it is not one). Interim liberties, recorded: the
// catalogue (immutable package data, Vol. 08 §8) and the shelf (the
// declared sources, awaiting their own contract) arrive as host-injected
// props.

import type { ResourceRef } from "@/nest/wave/envelope";
import type {
  KnotDetail,
  SceneDetail,
  SceneDetailSnapshot
} from "../../contracts/scene-detail";
import type { ModulePort } from "../../manifest";
import { truncate } from "../../text";
import { resolve, routeForm, ROW, type TupleReader } from "../../widgets/registry";

// The figure lens composes the shared row widget inside its strata
// disclosures — one registration line, same rendering as the record lens.
routeForm({ lens: "focus", form: "row.*", use: [ROW] });

export type Catalogue = {
  volumes: { slug: string; label: string; sections: { anchor: string; heading: string }[] }[];
};

export type ComposerTargetParam =
  | { mode: "answer" | "challenge"; knotId: string }
  | { mode: "unfold" }
  | { mode: "reframe"; targetOffset: number; targetTitle: string }
  | null;

export type CentreFocusModel = {
  scene: SceneDetail | null;
  ancestry: SceneDetail[];
  rootBindId: string | null;
  composerTarget: ComposerTargetParam;
  sourceMenuKnotId: string | null;
  catVolume: string;
  catSection: string;
  busy: boolean;
  completed: boolean;
};

export function selectCentreFocus(
  model: SceneDetailSnapshot,
  params: {
    focusBindId: string | null;
    composerTarget: ComposerTargetParam;
    sourceMenuKnotId: string | null;
    catVolume: string;
    catSection: string;
    busy: boolean;
    completed: boolean;
  }
): CentreFocusModel {
  const root = model.scenes.find((s) => !s.parentBindId) ?? null;
  const scene = model.scenes.find((s) => s.bindId === params.focusBindId) ?? root;
  const ancestry: SceneDetail[] = [];
  let current = scene;
  while (current?.parentBindId) {
    const parent = model.scenes.find((s) => s.bindId === current?.parentBindId);
    if (!parent) break;
    ancestry.unshift(parent);
    current = parent;
  }
  return {
    scene,
    ancestry,
    rootBindId: root?.bindId ?? null,
    composerTarget: params.composerTarget,
    sourceMenuKnotId: params.sourceMenuKnotId,
    catVolume: params.catVolume,
    catSection: params.catSection,
    busy: params.busy,
    completed: params.completed
  };
}

function targetsKnot(target: ComposerTargetParam, mode: "answer" | "challenge", knotId: string) {
  return target?.mode === mode && target.knotId === knotId;
}

export function CentreFocus({
  model,
  port,
  readTuple,
  catalogue,
  shelf
}: {
  model: CentreFocusModel;
  port: ModulePort;
  readTuple: TupleReader;
  catalogue: Catalogue | null;
  shelf: ResourceRef[];
}) {
  const { scene, busy, completed } = model;
  if (!scene) return null; // the host renders the pre-scene state

  const strataTotal =
    scene.strata.admission.length + scene.strata.sowing.length + scene.strata.harvest.length;

  const knotActions = (knot: KnotDetail) => (
    <div className="knot-actions">
      <button
        type="button"
        className={`vec-btn${targetsKnot(model.composerTarget, "answer", knot.knotId) ? " on" : ""}`}
        disabled={completed}
        onClick={() =>
          port.navigate({ "composer.target": { mode: "answer", knotId: knot.knotId } })
        }
      >
        Answer
      </button>
      <button
        type="button"
        className={`vec-btn${targetsKnot(model.composerTarget, "challenge", knot.knotId) ? " on" : ""}`}
        disabled={completed}
        onClick={() =>
          port.navigate({ "composer.target": { mode: "challenge", knotId: knot.knotId } })
        }
      >
        Challenge
      </button>
      <button
        type="button"
        className={`vec-btn${model.sourceMenuKnotId === knot.knotId ? " on" : ""}`}
        disabled={busy || completed}
        onClick={() => {
          if (shelf.length === 0) {
            void port.commit({ kind: "evidence", knotId: knot.knotId });
          } else {
            port.navigate({
              "centre.focus.sourceMenu": model.sourceMenuKnotId === knot.knotId ? null : knot.knotId
            });
          }
        }}
      >
        Evidence
      </button>
      {knot.childBindId ? (
        <button
          type="button"
          className="vec-btn"
          onClick={() => port.navigate({ "focus.bindId": knot.childBindId! })}
        >
          Open child scene
        </button>
      ) : (
        <button
          type="button"
          className="vec-btn"
          disabled={busy || completed}
          onClick={() => void port.commit({ kind: "deepen", knotId: knot.knotId })}
        >
          Deepen
        </button>
      )}
      {!knot.ready && !knot.unknown && (
        <button
          type="button"
          className="vec-btn"
          disabled={busy || completed}
          onClick={() => void port.commit({ kind: "markUnknown", knotId: knot.knotId })}
        >
          Mark unknown
        </button>
      )}
    </div>
  );

  const sourceMenu = (knot: KnotDetail) => (
    <div className="src-menu">
      <span className="eyebrow">Ground this knot in evidence</span>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          port.navigate({ "centre.focus.sourceMenu": null });
          void port.commit({ kind: "evidence", knotId: knot.knotId });
        }}
      >
        Search the specification set for this question
      </button>
      {shelf.map((source) => (
        <button
          type="button"
          key={`${source.store}:${source.ref}`}
          disabled={busy}
          onClick={() => {
            port.navigate({ "centre.focus.sourceMenu": null });
            void port.commit({
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
      {catalogue && (
        <div className="cat-browse">
          <span className="eyebrow">Or pick a chapter from the catalogue</span>
          <select
            value={model.catVolume}
            onChange={(event) =>
              port.navigate({
                "centre.focus.catVolume": event.target.value,
                "centre.focus.catSection": ""
              })
            }
          >
            {catalogue.volumes.map((volume) => (
              <option key={volume.slug} value={volume.slug}>
                {volume.label}
              </option>
            ))}
          </select>
          <select
            value={model.catSection}
            onChange={(event) => port.navigate({ "centre.focus.catSection": event.target.value })}
          >
            <option value="">Whole volume</option>
            {catalogue.volumes
              .find((volume) => volume.slug === model.catVolume)
              ?.sections.map((section) => (
                <option key={section.anchor} value={section.anchor}>
                  {section.heading}
                </option>
              ))}
          </select>
          <button
            type="button"
            className="op-btn"
            disabled={busy || !model.catVolume}
            onClick={() => {
              port.navigate({ "centre.focus.sourceMenu": null });
              void port.commit({
                kind: "readSource",
                knotId: knot.knotId,
                store: "spec",
                ref: model.catSection ? `${model.catVolume}#${model.catSection}` : model.catVolume
              });
            }}
          >
            Read the chapter into the knot
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="scene-crumbs">
        <button type="button" onClick={() => port.navigate({ "focus.bindId": model.rootBindId })}>
          Root
        </button>
        {model.ancestry.map((ancestor) => (
          <span key={ancestor.bindId}>
            {" / "}
            <button type="button" onClick={() => port.navigate({ "focus.bindId": ancestor.bindId })}>
              {truncate(ancestor.title, 34)}
            </button>
          </span>
        ))}
        <span>{model.ancestry.length > 0 || scene.bindId !== model.rootBindId ? " / " : ""}</span>
        <span>{truncate(scene.title, 44)}</span>
      </div>
      <div className="scene-head">
        <span className="eyebrow">
          {scene.bindId} · operator {scene.operatorId} · {scene.status}
        </span>
        <h2>{scene.title}</h2>
        {scene.purpose && <p className="purpose">{scene.purpose}</p>}
        {scene.sources.length > 0 && (
          <div className="chip-row">
            {scene.sources.map((source) => (
              <span className="src-chip" key={`${source.store}:${source.ref}`}>
                {truncate(source.title ?? source.ref, 44)}
              </span>
            ))}
          </div>
        )}
        {scene.status === "active" && scene.barrier.total > 0 && (
          <p className="barrier-note">
            close bind {scene.closeBindId ?? "—"} · barrier {scene.barrier.settled} /{" "}
            {scene.barrier.total} settled — it publishes its integration itself once every knot is
            ready, returned, or explicitly unknown
            {scene.returnTo ? `; the return is addressed to ${scene.returnTo}` : ""}
          </p>
        )}
      </div>

      <details className="produced">
        <summary>
          The scene&rsquo;s record — {strataTotal} tuples in three strata (admission · sowing ·
          harvest)
        </summary>
        {(["admission", "sowing", "harvest"] as const).map(
          (stratum) =>
            scene.strata[stratum].length > 0 && (
              <div className="stratum" key={stratum}>
                <span className="stratum-label">{stratum}</span>
                {scene.strata[stratum].map((row) => {
                  const Row = resolve("focus", row.form)[0];
                  return <Row key={row.offset} item={row} readTuple={readTuple} />;
                })}
              </div>
            )
        )}
      </details>

      <div className="knot-list">
        {scene.knots.map((knot) => (
          <article
            className={`knot${knot.ready ? " ready" : ""}${knot.unknown ? " unknown" : ""}${
              targetsKnot(model.composerTarget, "answer", knot.knotId) ||
              targetsKnot(model.composerTarget, "challenge", knot.knotId)
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
                  <span className="src-chip read" key={`${source.store}:${source.ref}:${index}`}>
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
            {knotActions(knot)}
            {model.sourceMenuKnotId === knot.knotId && sourceMenu(knot)}
          </article>
        ))}
      </div>

      {scene.candidate && scene.status !== "integrated" && (
        <div className="candidate-panel">
          <span className="eyebrow">
            {scene.returnTo
              ? `Published by ${scene.closeBindId} — already returned to ${scene.returnTo}; accepting releases it to the left rail`
              : `Published by ${scene.closeBindId} at its barrier — seams preserved`}
          </span>
          <h3>{scene.title}</h3>
          <p className="statement">{scene.candidate.statement}</p>
          {scene.candidate.contributions.length > 0 && (
            <div className="seams">
              {scene.candidate.contributions.map((contribution, index) => (
                <p className="seam" key={index}>
                  <b>{contribution.source}</b>
                  {contribution.note}
                </p>
              ))}
            </div>
          )}
          {scene.candidate.openQuestions.length > 0 && (
            <ul className="open-qs">
              {scene.candidate.openQuestions.map((question, index) => (
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
                void port
                  .commit({
                    kind: "accept",
                    bindId: scene.bindId,
                    candidateOffset: scene.candidate!.offset
                  })
                  .then((result) => {
                    if (result && !result.refused && scene.parentBindId) {
                      port.navigate({ "focus.bindId": scene.parentBindId });
                    }
                  })
              }
            >
              Accept — release to the left
            </button>
          </div>
        </div>
      )}
    </>
  );
}
