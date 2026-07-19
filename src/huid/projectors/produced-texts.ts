import "server-only";

// The produced-texts projector — the document lens's formation
// (design_proposal §3.2): the block-former registry that was the client's
// `canvasRenderers` embryo, moved to the plane — a new block form is a
// registered former here plus a render case in a view (new information is
// a formation change; a new look is a presentation change). Blocks append
// in offset order; every kind is always formed — toggles are client
// select parameters. Ownership resolves by provenance joins (`emittedBy`,
// close-bind registration), never adjacency (Vol. 03 §3.3).

import {
  PRODUCED_TEXTS,
  type ProducedBlock,
  type ProducedTextsSnapshot
} from "@/huid/contracts/produced-texts";
import type { DomainFactPayload, EvidenceExcerpt, WaveTuple } from "@/nest/wave/envelope";
import type { ProjectorManifest } from "./manifest";
import type { SnapshotProjector } from "./runtime";

const manifest: ProjectorManifest = {
  contract: PRODUCED_TEXTS,
  reads: {
    kinds: ["sys.descriptor.defined"],
    factTypes: [
      "learning.bind.selected",
      "learning.scene.unfolded",
      "learning.integration.candidate",
      "learning.integration.returned",
      "learning.integration.accepted",
      "learning.turn.submitted",
      "learning.answer.submitted",
      "learning.evidence.registered"
    ],
    joins: ["bindId", "emittedBy", "candidateOffset", "valueId", "knotId"]
  }
};

type ProducedTextsFoldState = {
  blocks: ProducedBlock[];
  accepted: Record<string, string>; // candidate offset → valueId
  sceneTitle: Map<string, string>;
  operatorOf: Map<string, string>;
  bindOfClose: Map<string, string>; // close-bind id → scene bind id
  latestCandidate: Map<string, number>; // scene bind id → its current candidate offset
  integrated: Set<string>; // scene bind ids whose candidate was accepted
};

function bindOfUid(uid: string): string {
  return uid.split("#")[0];
}

// — the block-former registry: first claim wins in declared order —
type BlockFormer = {
  id: string;
  claims: (factType: string) => boolean;
  build: (
    tuple: WaveTuple,
    d: Record<string, unknown>,
    state: ProducedTextsFoldState
  ) => ProducedBlock | null;
};

const blockFormers: readonly BlockFormer[] = [
  {
    id: "integrations",
    claims: (t) => t === "learning.integration.candidate" || t === "learning.integration.returned",
    build: (tuple, d, state) => {
      const factType = (tuple.payload as DomainFactPayload).factType;
      const returned = factType === "learning.integration.returned";
      const closeId = String(d.bindId ?? "");
      const sceneBind = state.bindOfClose.get(closeId) ?? closeId;
      const result = (d.result ?? {}) as { statement?: string };
      state.latestCandidate.set(sceneBind, tuple.offset);
      return {
        offset: tuple.offset,
        form: returned ? "integration.returned" : "integration.candidate",
        actor: "world",
        title: state.sceneTitle.get(sceneBind),
        body: String(result.statement ?? ""),
        meta: `${sceneBind} · ${state.operatorOf.get(sceneBind) ?? "bind"}${
          returned ? " · returned to parent" : ""
        }`,
        bindId: sceneBind
      };
    }
  },
  {
    id: "turns",
    claims: (t) => t === "learning.turn.submitted",
    build: (tuple, d) => {
      if (d.operator || d.targetKnotId) return null; // plain signals only
      const text = String(d.text ?? "").trim();
      if (!text) return null;
      return {
        offset: tuple.offset,
        form: "turn.plain",
        actor: "learner",
        body: text,
        meta: "plain signal"
      };
    }
  },
  {
    id: "answers",
    claims: (t) => t === "learning.answer.submitted",
    build: (tuple, d) => ({
      offset: tuple.offset,
      form: "answer",
      actor: "learner",
      body: String(d.answer ?? ""),
      meta: `${d.vector ?? "answer"} → ${d.knotId}`
    })
  },
  {
    id: "evidence",
    claims: (t) => t === "learning.evidence.registered",
    build: (tuple, d) => {
      const excerpts = (d.excerpts as EvidenceExcerpt[]) ?? [];
      return {
        offset: tuple.offset,
        form: "evidence.excerpts",
        actor: "world",
        body: excerpts.map((e) => `${e.volume}, "${e.section}": ${e.excerpt}`).join("\n\n"),
        meta: `evidence → ${d.knotId}`
      };
    }
  }
];

export const producedTextsProjector: SnapshotProjector<
  ProducedTextsFoldState,
  ProducedTextsSnapshot
> = {
  manifest,

  init: () => ({
    blocks: [],
    accepted: {},
    sceneTitle: new Map(),
    operatorOf: new Map(),
    bindOfClose: new Map(),
    latestCandidate: new Map(),
    integrated: new Set()
  }),

  step(state, tuple) {
    if (tuple.kind === "sys.descriptor.defined") {
      const payload = tuple.payload as { id?: string; emittedBy?: string };
      if (payload.id && payload.emittedBy) {
        state.bindOfClose.set(payload.id, bindOfUid(payload.emittedBy));
      }
      return state;
    }
    const payload = tuple.payload as DomainFactPayload;
    const d = (payload.data ?? {}) as Record<string, unknown>;
    switch (payload.factType) {
      case "learning.bind.selected": {
        const bindId = String(d.bindId ?? "");
        state.sceneTitle.set(bindId, String(d.title ?? "Scene forming"));
        state.operatorOf.set(bindId, String(d.operatorId ?? "bind"));
        return state;
      }
      case "learning.scene.unfolded": {
        const bindId = String(d.bindId ?? "");
        const result = (d.result ?? {}) as { title?: string };
        if (result.title) state.sceneTitle.set(bindId, result.title);
        return state;
      }
      case "learning.integration.accepted": {
        const candidateOffset = d.candidateOffset;
        if (typeof candidateOffset === "number" && typeof d.valueId === "string") {
          state.accepted[String(candidateOffset)] = d.valueId;
        }
        state.integrated.add(String(d.bindId ?? ""));
        return state;
      }
      default: {
        const former = blockFormers.find((f) => f.claims(payload.factType));
        const block = former?.build(tuple, d, state);
        if (block) state.blocks.push(block);
        return state;
      }
    }
  },

  snapshot: (state) => ({
    blocks: state.blocks.map((block) => ({ ...block })),
    accepted: { ...state.accepted },
    awaiting: [...state.latestCandidate.entries()]
      .filter(([sceneBind]) => !state.integrated.has(sceneBind))
      .map(([, offset]) => offset)
      .sort((a, b) => a - b)
  })
};
