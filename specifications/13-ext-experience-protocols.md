# Volume 13 — Extension Specification: Experience Protocols (CoAgnes) and Learning (Nest Education)

Status: SEED · Snapshot date: 2026-07-14 ·
Previous: [12-ext-cells-and-charters.md](./12-ext-cells-and-charters.md) ·
Next: [14-conformance-and-verification.md](./14-conformance-and-verification.md)

Two seed extensions grow product surfaces on the machine without adding runtime
capability of their own: **CoAgnes experience authoring** (evidence-backed
description and description-to-pipeline authoring) and **Nest Education** (a
guided learning canvas). Both are protocol-and-shell extensions in the sense of
Vol. 11: new fact families, new derived readings, new packages — same wave,
same compiler, same assembly, same membrane. This volume is their complete
statement within this set (lineage: the reference project's two conceptual
seeds). Statements about CoAgnes remain design hypotheses until checked
against the actual product; nothing here is an active contract.

## 1. Position in the architecture

```text
CoAgnes purposes and cases ──require──► Nest runtime services and protocols
        ▲                                        │ execute and record
        └────────── work surfaces ◄──────────────┘
```

Portable knowledge crosses the product boundary primarily as **pipeline
packages** (observed work → proposed YAML → compiler verdict → fixture and real
runs → assessment and review → versioned library entry), not as code merges.
The rule of growth: CoAgnes needs drive runtime growth; no capability is deemed
universal because it can describe the runtime itself.

## 2. The two bootstrap capabilities

1. **Evidence-backed description.** A structured description — entities,
   responsibilities, boundaries, inputs/outputs/dependencies/effects,
   decisions, causal explanations, supporting *and conflicting* evidence
   references, unresolved questions, per-claim confidence, provenance — formed
   from inspectable sources. Its first targets are CoAgnes and the runtime
   themselves (reflexive bootstrap), and it must be able to disagree with prose
   where code or traces show a mismatch.
2. **Pipeline authoring from reflection.** The system observes the method that
   produced a useful description and proposes a reusable **inert** pipeline
   package — compiled by the existing loader, fixture-run, assessed, and
   promoted only after review. The Cell lifecycle (Vol. 12) later internalises
   the same cycle without changing its epistemic order.

## 3. Protocol vocabulary (candidate namespaces)

First implementation stays on ordinary `domain.fact` rails (Vol. 04 §6 rules
apply: closed shapes per authoritative publication, producer classes, collision
review before canonical adoption):

```text
experience.charter.requested        claim.proposed
evidence.source.declared            claim.challenged
evidence.registered                 description.candidate
evidence.access.failed              description.assessment.proposed
system.component.proposed           description.assessed
system.relation.proposed            pipeline.proposed        pipeline.compiled
system.map.described                pipeline.trial.completed pipeline.trial.rejected
                                    pipeline.reviewed
library.promotion.requested         library.entry.promoted
```

Protocol rules carried over from the machine's discipline: evidence is
content-addressed — large bodies live in controller-owned stores; the log
carries immutable references, digests, and bounded excerpts; every material
claim cites committed evidence or shows an explicit gap; assessments follow the
propose→normalise pattern of Vol. 12 §5.4 (the model never sets weights or
aggregates); accepted publications are separate from candidates and carry
provenance.

## 4. Seed semantic units

The seed fixes twelve knots (C0–C11) and nine binds (B0–B8) as semantic
obligations with technical projections. Digest:

| Unit | Obligation | Projection anchor |
| --- | --- | --- |
| C0 Experience Charter | fix what is described, why, criteria, owner | `charter.proposed → charter.defined` (or a validated input pre-CellSpace) |
| C1 Evidence substrate | material without collapsing source/interpretation/conclusion | `evidence.*` facts; controller-owned stores |
| C2 System map | components, responsibilities, relations before causal synthesis | `system.*` facts with closed schemas |
| C3 Claim & cause ledger | separate observations, claims, hypotheses, contradictions | claim facts; per-claim knots; independent evaluation |
| C4 Experience unit | smallest reusable piece of organisational experience | `experience.unit.*` schemas; inert data |
| C5 Description integration | coherent, source-linked description | operator bind + gates → `description.candidate` |
| C6 Algorithmic reflection | which repeatable moves produced the result | `pipeline.proposed` (later a CellBlueprint) with semantic links |
| C7 Compiler/admission verdict | plausible ≠ safely attemptable | `compilePipeline`, later `admitCellPackage` |
| C8 Trial & comparison | observed behaviour before acceptance | isolated runs over the shared assembly; later Trial Cells |
| C9 Human decision | usefulness and capability stay human | review facts; promotion distinct from acceptance |
| C10 Pipeline library | preserve ways of working without universalising one trace | package = `pipeline.yaml + schemas/ + fixtures/ + manifest.yaml + evaluation.yaml + provenance.yaml` |
| C11 Membrane capability | every external contact explicit and governable | static controllers; capability panel |

Binds B0–B8 wire these into the operating cycle: frame → register evidence →
map → describe → reflect into algorithm → compile & trial → assess & decide →
promote → instantiate a domain demonstration. Exact reuse only for declared
templates; precedents inspire fresh authoring and cannot register topology.

## 5. Nest Education (learning surface)

The same machine carries a guided case canvas: a learner steers an AI guide
with a small vector grammar; every gesture is a committed fact, never a direct
graph mutation.

- **Vector grammar**: deepen · connect · challenge · evidence · alternative ·
  consequence · apply — each committed as `learning.vector.given` with a target
  reference and optional qualification; all input channels compile to the same
  fact shape (replayability, assessment, accessibility).
- **Case package**: `case.yaml + pipeline.yaml + schemas/ + evidence/ +
  rubric.yaml + views/ + fixtures/ + manifest.yaml` — the executable centre is
  an ordinary pipeline; `views/` optional, generic schema-derived UI always
  sufficient.
- **Authorship boundary (v1)**: every executable move is compiled before the
  session opens; a guide proposal carries an allowlisted move id; selection
  commits `learning.bind.selected`; bounded knot authorship rides the existing
  unfold template; genuinely new topology becomes an inert draft → compile →
  separate trial run (later a Trial Cell). Knots requiring `human.answer`
  cannot be satisfied by guide text.
- **Actors**: learner (judgement), guide (proposals only), independent
  evaluator (rubric fixed before the run; deterministic normalisation),
  case author, platform operator (control plane).
- **Derived states** (`proposed → open → winding → ready → integrated`, with
  `disputed`/`awaiting_human`) are read-model language over facts, readiness,
  and unanswered intentions — no UI-private state.
- **Infrastructure prerequisite**: multi-turn ingress = the `WaveSession` layer
  (Vol. 12 §8); the education seed adds no core change.

## 6. Work surfaces

Both seeds converge on the same surface discipline (Vol. 08 §8): a Charter/
obligation rail; a document-first centre (description, map, algorithm, trial
comparison, trace); an evidence/decision panel answering *what supports this,
what contradicts it, what did it cost, what may I decide now*; chat as a narrow
ingress lane whose messages become truth only as committed facts; Studio depth
(vault, feed, bricks, YAML) always reachable. All views derive from one wave
log.

## 7. Bootstrap sequence and acceptance

Tact 1 — self-description of the runtime from this repository (every material
claim evidenced or gapped; reconstructable from references and the run log).
Tact 2 — reflection proposes the pipeline that could repeat Tact 1; compiled,
fixture-run, promoted only through review. Tact 3 — describe CoAgnes with the
real corpus; incompatibilities become requirements or applicability limits,
never silent prompt edits. Tact 4 — first external domain demo with an expert
reviewer. Tact 5 — internalise the trial as Cells (Vol. 12) with identical
Charter/evidence/assessment/review contracts and root-only compatibility.

The seed is viable when one user can traverse: Charter → evidence → map/ledger
→ description → pipeline proposal → compiler verdict → trial → independent
assessment → human decision → promoted package → fresh application — and at
every step answer what was committed, why the next operation was allowed, which
evidence supports the result, which capability crossed the membrane, and which
exact package was accepted.

## 8. Blind spots

CoAgnes is not yet grounded in the originating project (no canonical source or
domain contract was available when the seed was written); reflexive
confirmation risk (descriptions that agree with their
own vocabulary — mandatory source references, contradiction knots, independent
review); evidence access/privacy (identity, tenancy, retention, redaction,
consent); causal overstatement (alternatives and uncertainty stay first-class);
pipeline overfitting (applicability manifests and failure examples before
reuse); authoring-schema limits (compiler expansion follows observed needs,
explicit rejection retained); restart/durable sessions (Vol. 11 §6.1);
evaluation independence; library governance (deprecation, migration, licences,
responsibility); work-surface density (Charter/document/decision first,
technical depth on demand). For the learning surface additionally: rubric
visibility policy, learner privacy, and the gap that today's run orchestration
owns a runtime for a single settle only.
