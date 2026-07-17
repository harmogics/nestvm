// The text canvas: the third central view — the log brought close to a plain
// document. A pure, programmable projection: `canvasRenderers` decides which
// tuples appear as blocks and how each renders; `CanvasOptions` toggles whole
// renderer groups. This is deliberately configuration-as-code first — the
// display form is meant to be reshaped programmatically before it is ever a
// user-facing setting.

import type {
  DomainFactPayload,
  EvidenceExcerpt,
  SessionProjection,
  WaveTuple
} from "./types";

export type CanvasOptions = {
  turns: boolean; // learner plain signals as texts
  answers: boolean; // learner answers/challenges as texts
  evidence: boolean; // registered evidence as material blocks
};

export const defaultCanvasOptions: CanvasOptions = {
  turns: true,
  answers: false,
  evidence: false
};

export type CanvasBlock = {
  offset: number;
  kind: "integration" | "turn" | "answer" | "evidence";
  actor: "learner" | "world";
  title?: string;
  body: string;
  meta?: string;
  bindId?: string; // owner bind — the jump target of "open its bind"
  isCandidate?: boolean; // an unaccepted integration candidate
  valueId?: string; // set when the integration was accepted
};

type CanvasRenderer = {
  id: string;
  enabled: (options: CanvasOptions) => boolean;
  build: (tuple: WaveTuple, projection: SessionProjection) => CanvasBlock | null;
};

function factOf(tuple: WaveTuple): { type: string; data: Record<string, unknown> } | null {
  if (tuple.kind !== "domain.fact") return null;
  const payload = tuple.payload as DomainFactPayload;
  return { type: payload.factType, data: payload.data ?? {} };
}

// The programmable display form. Order in this array is not display order —
// blocks always follow log order (offset).
export const canvasRenderers: CanvasRenderer[] = [
  {
    id: "integrations",
    enabled: () => true,
    build: (tuple, projection) => {
      const fact = factOf(tuple);
      if (!fact) return null;
      if (
        fact.type !== "learning.integration.candidate" &&
        fact.type !== "learning.integration.returned"
      ) {
        return null;
      }
      const result = (fact.data.result ?? {}) as { statement?: string };
      const scene = projection.scenes.find(
        (s) => s.closeBindId === String(fact.data.bindId) || s.bindId === String(fact.data.bindId)
      );
      const value = projection.values.find((v) => v.candidateOffset === tuple.offset);
      return {
        offset: tuple.offset,
        kind: "integration",
        actor: "world",
        title: scene?.title,
        body: String(result.statement ?? ""),
        meta: `${scene?.bindId ?? fact.data.bindId} · ${scene?.operatorId ?? "bind"}${
          fact.type === "learning.integration.returned" ? " · returned to parent" : ""
        }`,
        bindId: scene?.bindId,
        isCandidate: Boolean(scene && scene.candidate?.offset === tuple.offset && scene.status !== "integrated"),
        valueId: value?.valueId
      };
    }
  },
  {
    id: "turns",
    enabled: (options) => options.turns,
    build: (tuple) => {
      const fact = factOf(tuple);
      if (!fact || fact.type !== "learning.turn.submitted") return null;
      if (fact.data.operator || fact.data.targetKnotId) return null; // plain signals only
      const text = String(fact.data.text ?? "").trim();
      if (!text) return null;
      return {
        offset: tuple.offset,
        kind: "turn",
        actor: "learner",
        body: text,
        meta: "plain signal"
      };
    }
  },
  {
    id: "answers",
    enabled: (options) => options.answers,
    build: (tuple) => {
      const fact = factOf(tuple);
      if (!fact || fact.type !== "learning.answer.submitted") return null;
      return {
        offset: tuple.offset,
        kind: "answer",
        actor: "learner",
        body: String(fact.data.answer ?? ""),
        meta: `${fact.data.vector ?? "answer"} → ${fact.data.knotId}`
      };
    }
  },
  {
    id: "evidence",
    enabled: (options) => options.evidence,
    build: (tuple) => {
      const fact = factOf(tuple);
      if (!fact || fact.type !== "learning.evidence.registered") return null;
      const excerpts = (fact.data.excerpts as EvidenceExcerpt[]) ?? [];
      return {
        offset: tuple.offset,
        kind: "evidence",
        actor: "world",
        body: excerpts.map((e) => `${e.volume}, "${e.section}": ${e.excerpt}`).join("\n\n"),
        meta: `evidence → ${fact.data.knotId}`
      };
    }
  }
];

export function buildCanvas(
  tuples: readonly WaveTuple[],
  projection: SessionProjection,
  options: CanvasOptions
): CanvasBlock[] {
  const active = canvasRenderers.filter((renderer) => renderer.enabled(options));
  const blocks: CanvasBlock[] = [];
  for (const tuple of tuples) {
    for (const renderer of active) {
      const block = renderer.build(tuple, projection);
      if (block) {
        blocks.push(block);
        break;
      }
    }
  }
  return blocks;
}
