# PROTOCOL_DEV — the development protocol of new functionality

**Status:** public foundation companion, 2026-07-18. The standing
structure for developing anything new in this system: seven phases —
the Harmogics ethic of [CONSTITUTION §II](./CONSTITUTION.md) applied as
*working phases of design*, each with its questions, inputs, output
artefact, and checks from the instrument ladder (CONSTITUTION §III).

This protocol is a record, not an invention: it names the method already
practised — the alignment loop
([architectural-starting-points §2.2](./spec/architectural-starting-points.md))
phase-structured, with the centre-dock work
([spec/design_proposal.md](./spec/design_proposal.md)) as the worked
thread cited per phase. The protocol itself passes the fractal test
(meta-bind-01): phases 1–3 are its collection, 4–5 its accumulation,
6–7 and the gate its publication.

**The artefact rule.** Each phase appends a section to a living proposal
document (the `design_proposal.md` form, in `spec/`); phases produce
text, not meetings. Decisions taken along the way become ADRs; a
cross-level principle, a meta-bind. Every cell answers or records its
gap (Vol. 14 §4.8) — pretending is the only non-conforming option.

## The cycle — seed → proposal → code → description → seed

Capability-scale work runs the protocol as a **closed cycle**; smaller
work (a fix, a bounded refactor) walks the phases in miniature within a
turn (Vector choice §9) without minting seeds.

1. **seed** — the capability described, or received, in `capabilities/`:
   the want in distributable form, however early (`0.x.y-seed`).
2. **proposal** — the result of *reading and discussing the seed*: the
   seven phases applied to it, accumulating in a living document in
   `spec/` — **the working canvas of the cycle**, maintained jointly by
   the human and the system for its whole duration.
3. **gate → code** — implementation in the named regions, per the
   change map.
4. **architectural description** — the landing records: ADRs for
   decisions, refimpl chapters for shapes worth teaching, lids, worked
   examples.
5. **seed updated** — the learned concreteness back-propagates into the
   original description: real reads and shapes as implemented,
   deviations named, fixtures cited; version bumped, status advanced
   (SEED → manifested-in-source → TRIAL → PROMOTED).
6. **the proposal retires** — frozen verbatim into `spec/history/` with
   a closing note, as the recorded run of this protocol; the seed
   becomes the durable description until a next cycle opens a fresh
   proposal.

**Governance across the cycle** — the no-second-truth rule with its
lifecycle: while the cycle is open, the living proposal governs and the
seed follows it; at close the roles invert — the updated seed governs,
and the frozen proposal is history (read, never edited).

**The reflexive form.** The cycle is the product's own figure applied to
its development: the seed is the subject on the shelf; the proposal is
the scene — the central canvas of the work, its knots the open
questions; implementation is the grounding tact through reality; the
updated seed is the released value; `spec/history/` is the log.
Development here is a study session whose machine is us.

---

## Phase 1 — Truth: goals grounded in inspectables

**Ask.** What is wanted, and what does it give — to the system, to the
architect (author/configurator), to the operator (the learner)? No
solutions yet; wants stated so they can later be checked, not admired.

**Draw from.** The request itself; the persona network
(design_proposal §9); PHILOSOPHY (is the want inside the non-goals?).

**Produce.** The goal statement and a persona-value table.

**Check.** Every claim traces to something inspectable (Truth matrix,
Vol. 14 §4.1); personas are the constitution's, not ad hoc.

*Worked:* design_proposal §1 (the four questions of the centre) and §7's
value statement — total coverage, user representation choice, minimal
specific code.

## Phase 2 — Deep: constraints and pre-adaptation

**Ask.** What does the current implementation actually hold? Which debts,
limits, and preconditions exist? What must be adapted *before* starting —
and what deliberately must not be touched?

**Draw from.** The code as ground truth; the refimpl books; the honest
ledgers (huid/refimpl 03 §3).

**Produce.** The preconditions plan with acceptances, and the
"deliberately not now" list.

**Check.** Gaps recorded, not smoothed; the fractal test on every
proposed structure; run the cheapest instruments against reality — P0 of
the worked thread caught a live defect (the stale store cache) the day
it ran.

*Worked:* design_proposal §10 (P0–P5).

## Phase 3 — Connect: the web of existing law

**Ask.** Which constitution articles, volumes, ADRs, HUID rules, and
meta principles govern this? Where the Truth want meets a Deep
constraint, what reconciles them — a documented liberty with a
successor, or a recorded widening proposal?

**Draw from.** CONSTITUTION (the index of sources); Vol. 15 and the
language policy (Art. 13); the chronicle of decisions.

**Produce.** The anchor list (governing texts per element) and the
collision register (each resolved or recorded).

**Check.** Cross-references resolve (Connect matrix, Vol. 14 §4.3);
terminology canonical; nothing renamed silently.

*Worked:* design_proposal §2–4 — the dock/module resolution anchored in
HUID 01 §6 and the diff test; the lens formalised against Vol. 08 §8.

## Phase 4 — Service: the architectural points of change

**Ask.** Where exactly does each fragment land? Does every change enter
as a precisely delineated module, contract, former, or registration —
keeping the planes thin — and never as mechanism growth?

**Draw from.** The routing table (`src/README.md`); the
growth-is-registration table (design_proposal §8); the module and
projector contracts (HUID 02).

**Produce.** The change map: fragment → registration site, with manifest
sketches for new modules/projectors.

**Check.** The diff test predicted in writing (what the blast radius
will be); Art. 5–7 of the constitution; the import DAG untouched.

*Worked:* design_proposal §3 (three contracts by data product) and §7
(factory landing: one former server-side + one widget client-side + one
resolution-table line).

## Phase 5 — Knowledge: the crystals of the finished vision

**Ask.** Reformulate from Service as if the functionality already
exists: short crystals of vision — what now *is*, and its role seen from
the three points (system, architect, operator). This is the design's
defended articulation — the same result contract the product asks of its
learners, applied to ourselves.

**Draw from.** Phases 1–4; the target shape (design_proposal §8).

**Produce.** Numbered vision crystals, each naming who experiences it.

**Check.** The Knowledge matrix (Vol. 14 §4.5): complete, duplicated
nowhere; every crystal traceable back to a Truth want and a Service
site.

*Worked:* design_proposal §8 — "the centre is a dock; growth is
registration everywhere; what the human sees is formed once".

## Phase 6 — Evolution: vector alignment and drift criteria

**Ask.** Seen from the Connect anchors, does the vector align with the
specifications, the meta principles, the ethic, and the ecosystem
boundaries? What are the drift criteria — result-level,
architecture-level, persona-level — stated *before* implementation?

**Draw from.** meta-bind-01 and its guards; the counted invariants; the
ecosystem boundaries; Vol. 11 (is any widening needed, and is it
recorded rather than assumed?).

**Produce.** The drift criteria for this change and the alignment
verdict — or the widening proposal where the rails genuinely do not
carry the want.

**Check.** The Evolution matrix (Vol. 14 §4.6); the motherboard diff
test; meta guards (no symmetry-forcing, no ontology inflation).

*Worked:* design_proposal §9 — written before a line of the centre
migration exists.

## Phase 7 — Responsibility: clarifications and hard guidelines

**Ask.** Which points need a human decision or clarification? What stays
open, registered, and whose? And — strictly — which specifications does
this touch, taken as **hard guidelines of reality**: the wish adapts to
the specification set, never the reverse (changing it is the machine
authors' recorded act, not a side effect of product desire).

**Draw from.** Art. 9 (human responsibility irreducible); the
Responsibility matrix (Vol. 14 §4.7); the open-questions registers.

**Produce.** The open-questions register with owners; the list of
touched specifications with the constraint each imposes; the go/no-go
gate — implementation starts only on the explicit go (the working mode).

**Check.** No decision silently taken that belongs to the human; every
touched volume listed; refusal paths designed, not hoped away.

*Worked:* design_proposal §11; the explicit asks of this collaboration
(the `src/` root decision, the ADR-010 confirmation).

---

## After the phases — the implementation gate

The phases produce the proposal; they do not produce code. On the go:

1. implement along the change map, in the named regions, per the
   UI request path (ADR-008 D1) where the change is a surface;
2. verify by the instrument ladder (CONSTITUTION §III) — the mechanical
   gate always, fixtures and live smoke with honest refusals for
   behaviour, parity oracles for formation moves;
3. record the landing: ADR for decisions, refimpl chapters for shapes
   worth teaching, worked examples for discovered boundaries, a dated
   note in the proposal closing what it opened;
4. **update the seed** — back-propagate the learned detail into the
   capability's description in `capabilities/`, bump its version and
   advance its status (the cycle, step 5);
5. **retire the proposal** — freeze the working canvas into
   `spec/history/` with its closing note (the cycle, step 6).

| Phase | Output artefact | Primary instruments |
| --- | --- | --- |
| 1 Truth | goal + persona value | traceability |
| 2 Deep | preconditions plan | fractal test; cheapest reality checks |
| 3 Connect | anchors + collisions | cross-refs; Vol. 15 |
| 4 Service | change map + manifests | routing table; predicted diff test |
| 5 Knowledge | vision crystals | completeness, no duplication |
| 6 Evolution | drift criteria + verdict | counted invariants; meta guards |
| 7 Responsibility | open register + hard guidelines + gate | Art. 9; touched-spec list |
