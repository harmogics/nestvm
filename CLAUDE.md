# Project Instructions

This file tracks the standing instructions for working in this repository.
Entries are appended and refined as the collaboration establishes them; they are
not to be weakened implicitly.

## Current step: NestVM — Nest studying Nest

- This repository ships the **public NestVM project**: a site that presents the
  Nest Runtime Specification Set *and* lets the visitor study it inside the
  workbench described by `spec/` — the reflexive bootstrap of Vol. 13 §7
  (Tact 1: the machine's first study subject is the machine itself).
- It is a **sibling of The Algorithmic Company, not a clone**: seeds of one
  field — comparable look & feel (aged paper, serif display, mono labels),
  but its own accent (blueprint ink-blue for NestVM vs terracotta for TAC).
- The simulated machine must emit **machine-shaped tuples**
  (`{offset, kind, key, payload}`; `learning.*` product facts; simulated
  `inference.*` / `service.*` protocols; run metadata marked `simulated`), so
  the UI consumes future real logs unchanged and the trace panel doubles as a
  live lesson in reading wave logs.
- **Acceptance walkthrough for this step** (definition of done):
  1. land on the NestVM site and understand what the machine is;
  2. open the reading map, read a volume comfortably, follow cross-links;
  3. start a study session (petal "Understand the machine"; subject = a
     volume or an own question; result contract: defended articulation);
  4. type root material — committed as a plain signal, nothing activates;
  5. apply `unfold` — a bind scene appears: heading + 3–4 question knots;
  6. work knots: answer one (human answer, winding, grade), request
     `evidence` on another (real spec excerpts with volume/section refs),
     `deepen` a third into a child scene whose integration returns to the
     parent knot;
  7. the scene's close bind publishes its integration itself once every knot
     is ready, returned, or explicitly unknown (barrier auto-settlement) —
     a candidate with contribution map and open questions; the human decision
     is accept — released to the left rail;
  8. finish under the result contract — attested completion, final document
     projection with provenance and preserved open questions;
  9. open the trace — the tuple log with correlations; a page refresh
     replays the same scene from the log (no browser-private truth).

## Thinking rails (Nest alignment)

Check every analysis, UI decision and API shape against these rails; they are
derived from the specification set and `spec/` and are not to be weakened.

1. **The log is immutable.** A user action is exactly one of: a read-model
   reference (no log effect), a new committed fact (ingress), or new topology
   records (authoring). Nothing ever edits what is committed.
2. **A knot card is a projection** — derived from the definition tuple, the
   winding protocol tuples and readiness snapshots. Registers (STATE, GRADE,
   SLOTS) are never programme-addressable (Vol. 02 §4.7).
3. **Buttons are fact factories.** Each shapes a fact (type, discriminators,
   correlation) so declared collection rules route it. A targeted answer is a
   discriminated fact; plain text is an ambient fact any matching clew winds.
4. **Declared form, no retroactive delivery.** What a knot can hear is fixed
   at registration; facts committed before registration are never delivered
   (Vol. 02 §5.1). Including prior values in a new scene = re-presentation
   (fresh facts carrying refs) or embedding at authoring, sealed as a source
   snapshot.
5. **Return sockets are declared at birth.** A knot consumes a future child's
   return only through a rule it already carries (`where` target = own id);
   otherwise the return is gathered by a later-authored bind as a demand.
   Re-registration replaces the definition and resets the clew — never an
   "edit" tool.
6. **Deepen is topology authoring** (records → close → heads, `emittedBy`
   stamped, registration before facts) — categorically heavier than fact
   ingress; it carries attribution, reachability, termination and deserves
   distinguished UI.
7. **The machine is self-moving.** Readiness reifies automatically; a bind's
   rendezvous projects at its barrier without human action. Human acts are:
   supplying facts, acceptance/judgement, authoring. Keep the four transitions
   distinct: knot ready ≠ bind completed ≠ human accepted ≠ session completed.
8. **The left rail holds bind publications** (released integration tuples,
   referenced by offset) — never knot wound states.
9. **Ambient facts reach off-screen clews** whenever key + match + where +
   ordering allow; keep the surface quiet but make the ripple inspectable.
10. **When in doubt, ask:** which tuples exist, which are being created, and
    which projection shows them (Vol. 08 §8 derivation discipline).

## Simulation liberties (current, documented)

- The internal agent (Together AI via `lib/guide.ts`) plays the planner/
  winding/fold services; `lib/machine.ts` is the declared-form wrapper that
  expands agent plans into records. The external session API is the future
  swap surface for a real Nest VM.
- Scene forming ends with a grounding tact: every sown knot winds the
  presented sources once (parallel windings, correlation-joined); further
  winding follows learner material. Close binds carry no gates yet;
  unknown-marks stand in for barrier re-scoping.

## Project frame: The Algorithmic Company

- The whole project is named **The Algorithmic Company** (as presented in the
  `concepts_ui/` landing screenshot: 7 × 5 × 3 · 105 states, the maturity cube,
  "one algorithm, three carriers of practice, a shared alphabet").
- **Positioning is corporate from the start**: a workbench product for
  companies of different sizes — first a simple study workbench that
  accumulates study templates (**with attribution down to the person**), then
  internal workbenches for groups/segments/guilds (e.g. AML specialists, risk
  assessors, antifraud analytics).
- The three cube carriers (Employee · Process · Organization) are the scaling
  path of the product; the L3 "articulable" column is the ladder the workbench
  helps climb: can explain (E) → recorded in process (P) → fixed as norm (O).
- **Visual language**: borrow styles from
  `related/ai_maturity_cube_three_faces.html` and the `concepts_ui/`
  screenshots — aged-paper/blueprint aesthetic, serif display type,
  terracotta accent, uppercase letterspaced labels, dense matrix tables,
  CSS-variable theming.

## Implementation phasing

1. **Now (UX-first)**: the system is simulated through **Together AI API**
   calls (token supplied by the user; never committed). The API shape is
   adapted toward the target Nest session contract (turns / decisions /
   SSE projections) so the simulation can be swapped out later.
2. **Later (core)**: once user experience stabilises and the typical scenario
   is walked end to end, the core is written per `specifications/` — driven by
   real scenarios, data flows, and the UI/UX requirements discovered in
   phase 1. Product needs drive runtime growth (Vol. 13 §1 rule).
3. The binding contract for the swap is `spec/ADR-004-session-runtime-context.md`:
   the session API and the machine port stay stable; backend-owned storage
   (command journal, workshop drafts, registry — the only mutable plane, always
   pre-commitment) is separate from the machine-owned pluggable WaveStore
   (in-memory first, JSONL today); human decisions are always committed facts.
- Existing code (`app/`, `components/`) is **reused**: adapted and evolved, or
  gradually replaced, respecting the layout already forming in the project.

## Language policy

- **All artefacts are written in British English**: code, comments, commit
  messages, tests, descriptions, documentation, specifications, UI copy.
- **Any Russian text found in an artefact is a signal for correction**, not a
  precedent to follow. (Known instance: the demo seed messages in
  `specifications/refimpl/08-shells.md` §1 are in Russian while the golden
  fixture in Vol. 14 §2.1 is in English — a snapshot inconsistency to resolve.)
- Chat discussion may continue in Russian where appropriate, but **system terms
  and near-system concepts stay in English even in chat** (e.g. wave log,
  activation knot, bind descriptor, readiness, winding, clew, affinity, head,
  demand, barrier, gate, service, emit, membrane, discharge, settle,
  quiescence, Charter, Cell, unfold, fold, merge, WaveSession, vector grammar).
- Do not translate or paraphrase canonical terminology; Vol. 15
  (`specifications/15-terminology.md`) is the vocabulary authority.

## Project shape (orientation)

- `specifications/` — the Nest Runtime Specification Set (Nest VM): the
  normative machine contract. Treat it as the draft under study; the learning
  workbench wraps around it.
- `huid/` — the Human Interaction Device layer: the specification of the UI
  motherboard (host, feed, docks) and the four-part module contract by which
  panels plug in without host change (ADR-006). Extends the machine set from
  the product side; never modifies it.
- `spec/` — product/architecture layer for the inductive learning interface
  (ADR-003 is the current interaction decision). Its ideas are being
  re-evaluated against `specifications/`.
- `related/` — adjacent conceptual corpus: Semantic Vessel drafts (CoAgnes)
  and the AI maturity cube widget. Shares the seven-dimension vocabulary
  (Truth, Deep, Connect, Service, Knowledge, Evolution, Responsibility) with
  Vol. 14 §4 and `spec/attention-matrix.md`.
- `app/`, `components/` — runnable Next.js prototype (ADR-002, prototype-only;
  conceptually superseded by ADR-003).
- `concepts_ui/` — UI concept screenshots to reuse and develop.

## Working mode

- Current phase: accumulate context and understanding in chat first; move to
  implementation only on an explicit instruction from the user.
- Do not rename Nest primitives to match adjacent materials; reconcile
  explicitly (see `spec/cross-source-concept-analysis.md`).
