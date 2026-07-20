# The Constitution — a derived index of the system's standing law

**Status:** public foundation companion, 2026-07-18. This file is a
**derived reading of the corpus, not a new authority**: every article is
one sentence plus citations of the governing texts and the instrument
that checks it. Where this index and a governing text disagree, the text
governs and this index is corrected. Articles change only when their
sources change. Its purpose is practical: one place to run сверки —
alignment checks — during development.

## I. The articles

**Art. 1 — One truth, append-only.** The wave log is the sole truth;
correction appends a new attributable act, never rewrites.
*Governed by:* PHILOSOPHY §2; Vol. 01 §2.1; Vol. 03. *Checked by:* wire
rules (dense offsets), drop-and-rebuild.

**Art. 2 — Everything shown is derived.** No shell or service holds
truth a replay of the log would not reproduce; readings and indexes may
be rebuilt at any time.
*Governed by:* Vol. 08 §8; PHILOSOPHY §2; ADR-009. *Checked by:* the
parity oracle; drop-and-rebuild; replay identity.

**Art. 3 — A gesture outranks a screen event.** A meaningful human act
becomes a declared fact or declared topology; pure navigation stays a
parameter of reading.
*Governed by:* PHILOSOPHY §3; spec/first-turn-log-protocol; ADR-003.
*Checked by:* params-never-cross; manifest `commits`/`navigates` review.

**Art. 4 — Declared form, supplied content.** Wherever an oracle (model
or human) participates, the form is fixed in advance and validated; the
oracle fills content only.
*Governed by:* Vol. 01 §2.5; PHILOSOPHY §4; Vol. 06 §6–7. *Checked by:*
templates and schemas at every oracle seam; single-source claims.

**Art. 5 — Stations never blur.** Knots accumulate, binds judge and
publish, controllers discharge exactly once, observers mirror; a surface
is not a controller.
*Governed by:* Vol. 01 §4; Vol. 02 §3; ECOSYSTEM boundary 5; ADR-009 D1.
*Checked by:* the station tables; the import DAG.

**Art. 6 — The formation boundary.** Information is formed core-side by
pluggable, manifest-declared mechanics; surfaces only present it; what
the human sees is identical across surfaces.
*Governed by:* HUID 00 §5; rail 11; ADR-010. *Checked by:* the
`server-only` guard; one-truth-across-surfaces; the UI-swap test.

**Art. 7 — Growth is registration on declared rails.** New capability
plugs into named extension points, one registration site each; the core
and the counted invariants widen only by recorded decision.
*Governed by:* Vol. 11 §1–2; PHILOSOPHY §10; capabilities/FORMAT.md §1.
*Checked by:* the motherboard diff test; the routing table.

**Art. 8 — Honest incompleteness.** Stalls, refusals, unknowns, and
unanswered intentions are visible results; quiescence is never presented
as completion; calm never conceals failure.
*Governed by:* Vol. 01 §2.6; Vol. 08 §7; PHILOSOPHY §7; HUID 04 §4.
*Checked by:* honest-state fields in models; refusals-inline review.

**Art. 9 — Human responsibility is irreducible.** Purpose, consequential
source selection, judgement, revision, acceptance, and attestation stay
human; silence is never consent; the four transitions never collapse.
*Governed by:* PHILOSOPHY §6; manifest-of-conscious-movement; ADR-003.
*Checked by:* the human-acts vocabulary; no-auto-fire review.

**Art. 10 — Attention is capacity.** The surface serves the next
judgement within the load budget: disclosure over dialogs, no
unsolicited interruption, visual weight by kind of act, raw truth one
disclosure away.
*Governed by:* HUID 04 (sources cited there); ADR-008. *Checked by:* the
calm checklist (HUID 03 §1.9); the learner's persona questions.

**Art. 11 — History is not publication.** A recording belongs to its
context; the commons is reached only through a reviewed, consented,
versioned threshold.
*Governed by:* PHILOSOPHY §9; ECOSYSTEM boundary 2 and the two flows.
*Checked by:* licensing notes on recordings; the archive UI's own words.

**Art. 12 — The recurring figure.** Every load-bearing part names its
declared collection, its accumulation, and its publication; degeneracy
is named, never hidden.
*Governed by:* meta-bind-01; Vol. 05 (degenerate rule). *Checked by:*
the fractal test.

**Art. 13 — Terminology is load-bearing.** One canonical term per
concept (Vol. 15 authority); artefacts in British English; adjacent
vocabularies reconciled explicitly, never silently adopted.
*Governed by:* Vol. 15; CLAUDE.md language policy;
spec/cross-source-concept-analysis. *Checked by:* review against Vol. 15.

**Art. 14 — The three obligations.** Attribution, reachability, and
termination gate every construct, extension, and UI affordance.
*Governed by:* Vol. 01 §7; Vol. 11 §7. *Checked by:* the extension
checklist; budgets with named accounting.

## II. The Harmogics ethic — the seven phases of checking

The system lives inside the Harmogics field (ECOSYSTEM), and its ethic
of verification is the field's seven dimensions — **Truth · Deep ·
Connect · Service · Knowledge · Evolution · Responsibility** — used as
working phases, not as tabs or taxonomy. The lineage inside this
repository: Vol. 14 §4 (the specification set checks itself through the
seven matrices), spec/attention-matrix.md (the product checks its design
through the same seven), architectural-starting-points §2.3 (substantial
proposals pass through them). The articles above are *what the phases
protect*; the phases are *how the articles are interrogated*: Truth asks
whether a claim traces to something inspectable (Arts. 1–2, 8); Deep
whether the load-bearing level is reached (4, 12); Connect whether
everything links without collision (5, 13, 14); Service whether each
persona can act from what is given (6, 7, 10); Knowledge whether nothing
is duplicated or lost (2, 13); Evolution whether growth has a rail
(7, 12); Responsibility whether authority, trust, and consequence are
assigned (3, 9, 11). One name, deliberately: the field supplies the
ethic; this repository does not define the field (ECOSYSTEM boundary 6).

## III. The check protocol 

Instruments in ascending cost; apply the cheapest that answers, and for
substantial changes climb the ladder. The rule throughout is Vol. 14
§4.8: every cell has a demonstrable answer or a recorded gap —
pretending is the only non-conforming option.

1. **The fractal test** (one question, Art. 12) — every addition.
2. **The routing table and import DAG** (`src/README.md`) — every
   fragment's placement.
3. **Manifest review** — every module and projector: declared faces
   truthful, single-source.
4. **The mechanical gate** — `tsc`, `npm run parity`, the diff test —
   every change.
5. **The persona network** (HUID 03 §8) — every surface change: the
   author, configurator, and learner question sets.
6. **Fixtures and live smoke including honest refusals** — every
   behaviour change.
7. **The seven matrices** (Vol. 14 §4) — every substantial change, ADR,
   or new layer.

The development-flow application of this ladder — the seven Harmogics
phases carrying a want from goal to the implementation gate — is
[PROTOCOL_DEV.md](./PROTOCOL_DEV.md).

## IV. Drift clause

This index detects its own drift by the same law it records: it is a
projection of the corpus (Art. 2 applied to documents). A reviewer who
finds an article without a living source, a source without an article it
deserves, or a check without an instrument, corrects the index — never
the other way first.
