# Architectural starting points and the decision method

**Status:** Living synthesis, 2026-07-17. This document preserves the
architectural understanding accumulated while building the NestVM workbench
(the reflexive bootstrap: Nest studying Nest), and the method by which the
architectural decisions were made. Individual decisions live in the ADRs;
standing instructions live in `CLAUDE.md`; this document is the map of *why
the whole holds together* — the starting points any future step builds from,
and the way of deciding that produced them. It is appended and refined, never
silently weakened.

## 1. Starting points — the accumulated understanding

These are the load-bearing convictions the system is built on. Each was
earned by checking a design intuition against the Nest Runtime Specification
Set (`specifications/`), and each has already survived implementation.

### 1.1 One truth, three kinds of gesture

The append-only wave log is the only truth; every visible surface is a pure
derivation of committed tuples (Vol. 08 §8). A user gesture is exactly one
of: a read-model reference (no log effect), a committed fact (ingress), or
new topology records (authoring). Nothing edits what is committed —
correction is always a new fact carrying a reference. Human decisions are
committed facts in the same log, actor stamped server-side; a decision that
is not a fact cannot participate in causality and cannot be replayed.

### 1.2 Simulate behaviour, never the format

The simulated machine emits **machine-shaped tuples**: the real envelope
(`{offset, kind, key, payload}`), real registration records
(`sys.knot.defined` with explicit collect rules), the real winding and
service protocols with uid correlation. The UI therefore consumes future real
logs unchanged, and the trace panel doubles as a live lesson in reading wave
logs — the reflexive bootstrap pays for the discipline. Simulation
*liberties* (behavioural shortcuts) are permitted; format liberties are not.
Every liberty is documented in `CLAUDE.md` and holds a recorded successor.

### 1.3 Declared form, supplied content

Wherever the model participates, the *form* is fixed in advance and the model
fills *content only* (Vol. 01 §2.5). The agent authors scene plans
(questions, angles, thresholds, budgets, closing instructions); a
deterministic template wrapper expands them into records — ids, collect
rules, sockets, emit targets are never the model's to change. Validation
clamps every numeric; an invalid plan degrades to the deterministic fallback,
never to a malformed record.

### 1.4 Sockets at birth, no retroactive delivery

A knot hears only what its registration declared; facts committed before
registration are never delivered (Vol. 02 §5.1). Therefore: return sockets
are declared when a knot is born (`where: parentKnotId = own id`); prior
material enters new scenes by re-presentation (fresh facts carrying refs) or
by embedding at authoring, sealed as a source snapshot; and re-registration
is never an edit — it resets the clew and destroys accumulated understanding.

### 1.5 The machine is self-moving; the human is not a crank

Readiness reifies automatically; a close bind publishes itself the moment its
barrier settles (all knots ready, returned, or explicitly unknown). The four
transitions never collapse: knot ready ≠ bind completed ≠ human accepted ≠
session completed. What remains human is exactly: supplying facts, judgement
(acceptance, unknown-marks, attestation), and authoring gestures — the
Manifest of Conscious Movement enumerates them. Removing the manual
"Integrate" button was not a UX simplification but a correction of machine
semantics.

### 1.6 Resources by reference, resolution at attention time

The log stays bounded: tuples carry `{store, ref, digest?, excerpt?}` plus a
bounded excerpt, never full bodies (Vol. 03 §8, Vol. 13 §3). Content is
resolved by pluggable resolvers at the moment of winding or authoring, within
a declared budget. The session shelf grows only through explicit committed
human acts; a catalogue pick beyond the shelf declares the source first.

### 1.7 Grounding first, honest grades after

Scene forming ends with a grounding tact: every sown knot winds the presented
sources once, in parallel, joined by correlation rather than adjacency
(Vol. 03 §3.3). But grounding alone must not complete a study scene: the
winding contract grades source-only understanding conservatively, because the
petal's contract is a *defended articulation* — reading alone defends
nothing. Honest incompleteness is a valid result everywhere: explicit
unknowns, settled-unfinished states, and preserved open questions are
product features, not failure modes.

### 1.8 The centre is a set of projections

The central column is three lenses over one log — focus (one bind and its
knots), canvas (produced texts brought close to a document), log (the trace
as the machine's stream of thought, classified by actor: learner / machine /
world). Lenses are configuration-as-code first (`lib/canvas.ts` renderers)
and user-facing settings second. A lens never creates a second truth.

### 1.9 Pluggable seams, two swap surfaces

Growth happens behind named ports: `InferencePort` (Together AI first),
`WaveStore` (JSONL today, in-memory for the core, DB later),
`ResourceResolver` (spec corpus, wave offsets, workshop drafts),
`StudyMachinePort` (the machine boundary). The two surfaces that must stay
stable across the core swap are the session API and the machine port
(ADR-004); everything else may be replaced without the UI noticing.

### 1.10 The three obligations gate every construct

Attribution (whose act, whose thread — keys, uids, `emittedBy`),
reachability (every demand's feeding chain exists), termination (budgets,
bounded fan-out, honest stalls) — inherited from Vol. 01 §7 and applied as
the checklist for every new operator, fact family, or UI affordance.

### 1.11 Terminology is load-bearing

Vol. 15 is the vocabulary authority; Nest primitives are never renamed to
match adjacent materials (Semantic Vessel, maturity cube) — they are
reconciled explicitly (`cross-source-concept-analysis.md`). All artefacts are
British English; Russian in an artefact is a signal for correction.

## 2. The decision method — how these were reached

The method matters as much as the results; it is reproducible and is itself
one of the starting points.

### 2.1 Context before code

Every phase began with deliberate context accumulation in discussion —
reading `related/`, then `specifications/`, then `spec/` — and implementation
started only on an explicit instruction. The standing rule is recorded in
`CLAUDE.md` (Working mode) and held throughout.

### 2.2 The alignment loop

Each architectural move followed one loop:

1. **Vision stated in discussion** — usually by the human, as intuitions and
   questions ("knots are already in the log — what are the buttons then?").
2. **Checked against the specification set** — every claim traced to a
   volume and section; where the vision and the machine disagreed, the
   machine's law won or the divergence was named a documented liberty.
3. **Recorded as rails** — durable conclusions became the Thinking rails in
   `CLAUDE.md` (ten rules checked on every later analysis) or an ADR.
4. **Implemented as the smallest honest slice** — behaviour first where it
   teaches (grounding tact), format first where it must never drift
   (machine-shaped tuples).
5. **Walked live, end to end** — every slice verified against the acceptance
   walkthrough with the real inference provider where possible; defects
   reported plainly (including the reviewer's own misses, e.g. the trace
   rendered below the fold).
6. **Liberties and gaps written down** — never silently assumed solved;
   each carries its successor step.

### 2.3 The seven matrices as the multifactor instrument

Substantial proposals (the human-role manifest, the storage split) were
analysed through the seven verification matrices of Vol. 14 §4 — Truth, Deep,
Connect, Service, Knowledge, Evolution, Responsibility — the same instrument
the specification set applies to itself. This is deliberate reflexivity: the
project verifies itself with what it teaches.

### 2.4 UX first, core later, contracts in between

Per the phasing rule (Vol. 13 §1: product needs drive runtime growth), the
user experience is built on a simulation whose external contracts — the
session API, the tuple vocabulary, the machine port — are already the ones
the core will honour. The core is written only after the typical scenario is
walked end to end. ADR-004 is the binding contract of that swap.

### 2.5 Who decides what

The human decides pivots and frames: the project's naming and positioning,
the reflexive bootstrap as the first subject, the two storage planes, the
three central views, which gaps to close next. The assistant proposes,
checks against the specification, implements, and reports honestly —
including where its own implementation misrepresented the machine (manual
integrate) or its own verification missed a defect (trace visibility).
Disagreements are argued from the specification, not from preference; where
the specification is silent, the decision is recorded as an open question
rather than silently resolved.

### 2.6 Decision chronicle (major moves and their drivers)

| Decision | Driver | Recorded |
| --- | --- | --- |
| Reflexive bootstrap: the site presents the spec set and studies it on itself | Vol. 13 §7 Tact 1 | `CLAUDE.md` current step |
| Sibling aesthetics: NestVM ink-blue beside TAC terracotta, one field | product frame | `CLAUDE.md` |
| Machine-shaped tuples in the simulation | swap-compatibility + trace as lesson | `CLAUDE.md`, ADR-004 |
| Agent authors scenes within declared templates | Vol. 01 §2.5; ADR-003 authorship boundary | ADR-004 D4 |
| Auto-integration at the barrier; manual integrate removed | Vol. 06 §4 rendezvous semantics | thinking rail 7 |
| Human decisions live in the one log; workshop is the only mutable plane (pre-commitment) | Vol. 12 §5.5; replayability | ADR-004 D2, manifest |
| Resources by reference; attention-time resolution; shelf grows by committed acts | Vol. 03 §8, Vol. 13 §3 | ADR-004 D5 |
| Grounding tact + conservative source-only grading | figure fidelity vs the defended-articulation contract | `CLAUDE.md` liberties |
| Evidence = one gesture: automatic search or explicit catalogue pick | manifest: human attunes sources | this file §1.6 |
| Three central projections; trace humanised by actor; reframe as the second operator | log as canvas; Vessel fold | ADR-004 D1 |

## 3. Open tensions carried forward

Named, not resolved — the honest frontier:

1. **Reframe grading mode** — the conservative source-only cap serves study
   knots but arguably over-restrains transformation (lens) scenes; decide
   per-operator grading policy.
2. **The responsibility step** — `learning.integration.revised`
   (read → revise → append with seams) and the workshop store that hosts the
   draft before commitment.
3. **Attention queue** — the right rail as the queue of what awaits the
   human (published candidates, obligations, stalls).
4. **Manifest surface** — the derived panel of human acts (and abstentions).
5. **SSE feed** — batches suffice for one user; observers need the stream.
6. **Core skeleton** — `WaveEngine` + topology + settle behind
   `StudyMachinePort` with `InMemoryWaveStore`; guide and evidence become
   membrane controllers.
7. **Model adherence to grading policy** — soft prompt rules are followed
   imperfectly; a deterministic clamp at the machine boundary is the honest
   alternative when strictness matters.
