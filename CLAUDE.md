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
11. **The formation boundary.** Information is formed on the core side of
    the wire — readings, projectors, manifest-declared and rebuildable
    (ADR-009, HUID 00 §5) — and surfaces only present it. UIs may be many
    and different; the core never depends on which surface is attached,
    and what the human sees is formed identically for every surface.
    Swapping the whole UI leaves the nest untouched.

## Vector choice (the assistant's internal movement)

When analysis surfaces competing preferable-and-possible vectors, the
choice is walked, not felt — argued from the sources
(CONSTITUTION, the specifications as hard guidelines, PROTOCOL_DEV), in
this order:

1. **Hard guidelines eliminate first.** A vector that bends a
   specification, a constitution article, or a station rule is out
   however elegant — the wish adapts to the rails; where the rails
   genuinely cannot carry it, the outcome is a recorded widening
   proposal, never an improvisation.
2. **The fractal test filters.** Every surviving vector names its
   collection, accumulation, and publication (meta-bind-01) — or drops.
3. **Registration beats mechanism.** Prefer the vector that lands as
   entries at named sites (Art. 7, the routing table) over any that
   edits the host, the plane, or the machine for a feature's sake.
4. **Falsify cheaply before arguing.** Run the cheapest instrument that
   could kill a vector — `tsc`, the parity oracle, one curl, one grep of
   the corpus — before spending deliberation; reality outranks argument
   (precedent: the oracle caught the stale-cache defect on its first
   in-repo run).
5. **Thinness is named, not faked.** Prefer the vector honest about its
   degenerate parts over one dressing them as full figures
   (meta-bind-01 §3).
6. **Ties break by reversibility, then precedent, then the human.**
   Between conforming vectors the cheaper-to-undo wins (a `git mv` over
   a rewrite); then the one already recorded in the chronicle; a
   genuinely open tie is the human's decision (Art. 9) — recorded as an
   open question and asked when it is theirs to make.
7. **Silence of the sources is an open question**, never a silent
   resolution (starting-points §2.5).
8. **Challenges are verified before defended.** When the human contests
   a choice, check the sources before answering; concede precisely where
   the challenge lands and fix structurally, not cosmetically
   (precedents: the duplicated projector claims; the dark trace drawer
   as overlay archaeology).
9. **The protocol scales down.** Inside a single decision, walk the
   seven phases in miniature — want → constraints → anchors → sites →
   crystal → drift → open points — before writing; the phases are
   checkpoints of internal movement, not ceremony (PROTOCOL_DEV).
10. **Report the walk.** Name the rejected vectors and why they fell,
    keep liberties documented with successors, and record the decision
    where the next reader will look — an ADR, the chronicle, a lid.

## Simulation liberties (current, documented)

- The internal agent (Together AI via `lib/guide.ts`) plays the planner/
  winding/fold services; `lib/machine.ts` is the declared-form wrapper that
  expands agent plans into records. The external session API is the future
  swap surface for a real Nest VM.
- Scene forming ends with a grounding tact: every sown knot winds the
  presented sources once (parallel windings, correlation-joined); further
  winding follows learner material. Close binds carry no gates yet;
  unknown-marks stand in for barrier re-scoping.

## External ecosystem frame: CoAgnes and The Algorithmic Company

- Nest VM is an independently governed Harmogics project, not the CoAgnes or
  The Algorithmic Company codebase. CoAgnes may assemble a released Nest VM and
  grow its own organisational environment around it; no CoAgnes module,
  product policy, or release cycle silently governs this repository.
- The Algorithmic Company is a CoAgnes-facing corporate projection (the
  maturity cube and its Employee · Process · Organization carriers), not a
  Nest VM product identity or machine ontology. Materials in `concepts_ui/`
  and `related/` remain adjacent references with their stated provenance.
- CoAgnes scenarios may disclose useful requirements to Nest VM through the
  semantic boundary stated in `BRIDGE.md`. A requirement affects the machine
  only after Nest VM's own specification, widening, and verification process.
- Ecosystem guilde manifests in `manifests/` may orient other independently
  governed environments around the same machine centre without importing
  their vocabulary or authority into Nest VM.

## Implementation phasing

1. **Now (UX-first)**: the system is simulated through **Together AI API**
   calls (token supplied by the user; never committed). The API shape is
   adapted toward the target Nest session contract (turns / decisions /
   SSE projections) so the simulation can be swapped out later.
2. **Later (core)**: once user experience stabilises and the typical scenario
   is walked end to end, the core is written per `specifications/` — informed
   by real scenarios and evidence gathered in phase 1. Product and ecosystem
   needs may propose runtime growth; only methodology-independent obligations
   admitted through Nest VM's own widening discipline enter the core.
3. The binding contract for the swap is `spec/ADR-004-session-runtime-context.md`:
   the session API and the machine port stay stable; backend-owned storage
   (command journal, workshop drafts, registry — the only mutable plane, always
   pre-commitment) is separate from the machine-owned pluggable WaveStore
   (in-memory first, JSONL today); human decisions are always committed facts.
- Existing code (`src/`) is **reused**: adapted and evolved, or gradually
  replaced, respecting the radial layout fixed by ADR-007.

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
- `meta/` — cross-level integrations: meta-binds that gather evidence
  across all layers and publish recurring principles (meta-bind-01: the
  collection · accumulation · publication figure). Derived readings —
  they override nothing.
- `CONSTITUTION.md` — the derived index of the standing law: fourteen
  articles citing their governing texts, the Harmogics seven-phase check
  ethic, and the check protocol (the ladder of instruments). Run сверки
  from here; the cited sources always govern.
- `PROTOCOL_DEV.md` — the development protocol: the seven Harmogics
  phases as working phases of design (Truth → Responsibility), each with
  questions, inputs, output artefact, and checks. Capability-scale work
  runs the closed cycle: seed → proposal (the cycle's working canvas,
  jointly maintained) → gate → code → landing records → seed updated
  with the learned detail → proposal retired to `spec/history/`. While a
  cycle is open the proposal governs; after close, the seed.
- `capabilities/` — the seed register: distributable declarations of
  growable capabilities (FORMAT.md — one format, a kind taxonomy, guild
  as the maximal composite; atomic capabilities as degenerate guilds).
  First seed: `guild.centre-dock` — manifested-in-source; its
  cycle's canvas is retired to `spec/history/`. Code never travels in a
  seed.
- `manifests/` — non-normative ecosystem guilde manifests: high-level
  orientations for independently governed projects that place Nest VM at
  their executable centre and grow a human and institutional environment
  around it. A guilde is not a capability guild, package, assembly, or
  machine extension; `vision_guilde.md` carries the common movement.
- `themes/` — the visual layer on rails: tokens as the declared
  vocabulary (collection), module/widget composition (accumulation),
  act-weighted rendering (publication); one field, sibling accents;
  raw values only in token definitions; seeds reference tokens, never
  values. Register: nestvm-ink (+ the raw-value debt ledger, retired
  opportunistically).
- `SDLC.md` — the third altitude beside law (CONSTITUTION) and procedure
  (PROTOCOL_DEV): the understanding — development as a study session
  whose machine is us; the lifecycle diagram; the ecosystem horizon
  (capabilities ripening into seeds); honest incompleteness as method.
  Bind-shaped: gathered scope, one integration, open questions preserved.
- `DEV_MANUAL.md` — the front door, in plain words: fork, run, open the
  repo in an AI assistant, talk; the assistant reads the law itself and
  walks you onto the rails; the human holds the gates. Non-normative by
  design — it points, never restates.
- `attributions/` — imprints of joint work: at the close of every
  contribution arc the model records the joint attribution (model
  identified exactly; the human by role; the arc, the materials, how it
  went — concessions and reality-catches included). A standing closing
  duty (PROTOCOL_DEV gate, step 6): a model's part traces nowhere else.
- `related/` — adjacent conceptual corpus: Semantic Vessel drafts (CoAgnes)
  and the AI maturity cube widget. Shares the seven-dimension vocabulary
  (Truth, Deep, Connect, Service, Knowledge, Evolution, Responsibility) with
  Vol. 14 §4 and `spec/attention-matrix.md`.
- `src/` — the implementation nest (ADR-007): radial regions with
  inward-only imports — `src/nest/{wave,readings,membrane,machine}` the
  machine side, `src/corpus` the studied set as a store, `src/product` the
  session contract, `src/huid` the surface (device code), `src/app` the thin
  Next.js shell. Each region carries a lid (README) with its rules; the
  routing table lives in `src/README.md`.
- `fixtures/sessions/` — recorded session goldens (the ADR-005 replay pin).
- `concepts_ui/` — UI concept screenshots to reuse and develop.

## Capability intake — the study pass

When a capability enters discussion (a seed is named, or a new one is
proposed), two stages run in order; the technical plan does not open
until stage 2 has been walked and reported.

1. **Functional understanding first** — the want, the persona triple,
   the end-user walkthrough, applicability and failure examples;
   product language only, no mechanism talk.
2. **The study pass — first-hand, before any technical plan.** Reading
   the seed and its canvas is not сверка: every load-bearing citation
   is opened at its primary source, in this order —
   1. law and procedure re-read: CONSTITUTION (articles + ladder),
      PROTOCOL_DEV (phases + cycle), SDLC;
   2. the capability pair: the seed and its living proposal
      (`spec/proposal-<capability>.md`), with capabilities/FORMAT.md
      and the register;
   3. anchor closure: every document the pair cites, first-hand, plus
      one ring wider — the texts those anchors name as governing on
      load-bearing points (specifications/ volumes and sections, the
      huid/ volumes and both refimpl books, ADRs by status, meta-binds,
      themes registers, src/CONVENTIONS.md);
   4. the surroundings, cited or not: PHILOSOPHY, ECOSYSTEM,
      spec/manifest-of-conscious-movement.md, spec/attention-matrix.md,
      spec/open-bind-architecture.md,
      spec/architectural-starting-points.md (esp. §3 open tensions),
      spec/first-turn-log-protocol.md, spec/ui-panel-rails.md,
      spec/cross-source-concept-analysis.md — the layer where adjacent
      plans, planned fact families, and known gaps live;
   5. ground truth: the routing table and region lids, the named
      registration sites in src/, the honest ledgers (CONVENTIONS
      deviations, themes debt, refimpl migration ledger), fixtures;
      the mechanical gate run fresh (tsc + parity);
   6. a Vol. 15 terminology pass over the capability's own vocabulary
      (bare-word collisions, the reserved lists, adjacent-corpus
      terms).

   The pass closes with a report in chat: the read map (read /
   deliberately not read), confirmed alignments, collisions and drift
   found, and the adjacencies the capability touches — each becoming an
   entry in the proposal's registers, never silently held.
3. Only then the technical plan. Findings that need a human decision
   are asked (Art. 9); the rest land as register entries in the canvas.

The pass scales down with the capability (an atomic seed — a degenerate
guild — needs the pair, its direct anchors, and the terminology pass);
at cycle re-entry only what changed since the recorded read map is
re-checked.

## Working mode

- Current phase: accumulate context and understanding in chat first; move to
  implementation only on an explicit instruction from the user.
- Autonomy follows the gates: inside a gate the human has explicitly
  opened, move without asking; at the seams between cycles (the go,
  acceptance, retirement) stop — the assistant's job is to make the
  human's decisions one word long.
- Do not rename Nest primitives to match adjacent materials; reconcile
  explicitly (see `spec/cross-source-concept-analysis.md`).
