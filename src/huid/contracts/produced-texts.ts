// The produced-texts contract — the document lens's data product
// (design_proposal §3.2; seed §4.2): the session's produced texts as
// blocks in offset order, every kind always formed — lens toggles are
// client select parameters and never parameterise the wire. The block
// list is append-shaped; acceptance state rides beside it as small
// kneaded maps so the list stays delta-ready (§5) and a revision or
// superseded kind can enter additively (§12.4). Types only; erased at
// build (ADR-010 D1).

export const PRODUCED_TEXTS = "produced-texts";

// Form keys — the factType idiom (CONVENTIONS §1.5); "integration.value"
// is the accepted candidate's presentation form, re-formed in select
// from the `accepted` map.
export type ProducedBlockForm =
  | "integration.candidate"
  | "integration.returned"
  | "turn.plain"
  | "answer"
  | "evidence.excerpts";

export type ProducedBlock = {
  offset: number; // the truth anchor
  form: ProducedBlockForm;
  actor: "learner" | "world";
  title?: string;
  body: string;
  meta?: string;
  bindId?: string; // owner scene — the jump target of "open its bind"
};

export type ProducedTextsSnapshot = {
  blocks: ProducedBlock[]; // append, offset order
  accepted: Record<string, string>; // candidate offset → released valueId
  awaiting: number[]; // offsets of candidates currently awaiting review
};
