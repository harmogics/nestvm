// The document lens — presentation side. The model arrives formed as the
// produced-texts snapshot (every block kind, offset order); `select`
// applies the kind toggles and re-forms acceptance: a candidate whose
// offset is in the accepted map reads as `integration.value` with its
// released valueId; one in the awaiting list carries the candidate mark.
// The view renders blocks and speaks two verbs — Accept commits, the rest
// navigates (open its bind; retarget the composer to a reframe).

import type {
  ProducedBlock,
  ProducedTextsSnapshot
} from "../../contracts/produced-texts";
import type { ModulePort } from "../../manifest";

export type CanvasToggles = {
  turns: boolean;
  answers: boolean;
  evidence: boolean;
};

export type CanvasBlockView = ProducedBlock & {
  isCandidate: boolean; // awaiting review
  valueId?: string; // released value when accepted
};

export type CentreCanvasModel = {
  blocks: CanvasBlockView[];
  toggles: CanvasToggles;
  busy: boolean;
  completed: boolean;
};

export function selectCentreCanvas(
  model: ProducedTextsSnapshot,
  params: { turns: boolean; answers: boolean; evidence: boolean; busy: boolean; completed: boolean }
): CentreCanvasModel {
  const awaiting = new Set(model.awaiting);
  const blocks = model.blocks
    .filter((block) => {
      if (block.form === "turn.plain") return params.turns;
      if (block.form === "answer") return params.answers;
      if (block.form === "evidence.excerpts") return params.evidence;
      return true; // integration blocks always
    })
    .map((block) => ({
      ...block,
      isCandidate: awaiting.has(block.offset),
      valueId: model.accepted[String(block.offset)]
    }));
  return {
    blocks,
    toggles: { turns: params.turns, answers: params.answers, evidence: params.evidence },
    busy: params.busy,
    completed: params.completed
  };
}

export function CentreCanvas({
  model,
  port
}: {
  model: CentreCanvasModel;
  port: ModulePort;
}) {
  return (
    <div className="canvas-view">
      <div className="canvas-head">
        <span className="eyebrow">The log as a text canvas — every block is a tuple</span>
        <div className="canvas-toggles">
          {(
            [
              ["turns", "learner turns"],
              ["answers", "answers"],
              ["evidence", "evidence"]
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={model.toggles[key]}
                onChange={() => port.navigate({ [`centre.canvas.${key}`]: !model.toggles[key] })}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
      {model.blocks.length === 0 && (
        <p className="purpose" style={{ marginTop: 18 }}>
          Nothing to show yet — integrations published by binds will read here as text.
        </p>
      )}
      {model.blocks.map((block) => (
        <article className={`canvas-block ${block.form.split(".")[0]} actor-${block.actor}`} key={block.offset}>
          <div className="canvas-block-meta">
            <span className="off">@{block.offset}</span>
            <span>{block.meta}</span>
            {block.valueId && <span className="value-chip">released as {block.valueId}</span>}
            {block.isCandidate && <span className="cand-chip">candidate — awaiting review</span>}
          </div>
          {block.title && <h3>{block.title}</h3>}
          <p className="canvas-body">{block.body}</p>
          <div className="canvas-actions">
            {block.bindId && (
              <button
                type="button"
                className="vec-btn"
                onClick={() =>
                  port.navigate({ "focus.bindId": block.bindId!, "centre.view": "focus" })
                }
              >
                Open its bind
              </button>
            )}
            {block.isCandidate && block.bindId && (
              <button
                type="button"
                className="vec-btn"
                disabled={model.busy || model.completed}
                onClick={() =>
                  void port.commit({
                    kind: "accept",
                    bindId: block.bindId!,
                    candidateOffset: block.offset
                  })
                }
              >
                Accept — release left
              </button>
            )}
            <button
              type="button"
              className="vec-btn"
              disabled={model.completed}
              onClick={() =>
                port.navigate({
                  "composer.target": {
                    mode: "reframe",
                    targetOffset: block.offset,
                    targetTitle: block.title ?? `@${block.offset}`
                  }
                })
              }
            >
              Reframe
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
