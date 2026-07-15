# Volume 12 — Extension Specification: Semantic Charters, Cells, CellSpace

Status: PROPOSED · Snapshot date: 2026-07-14 ·
Previous: [11-extension-points.md](./11-extension-points.md) ·
Next: [13-ext-experience-protocols.md](./13-ext-experience-protocols.md)

This volume is the normative specification, within this set, of the Cell
extension: the extension by which achieved semantic understanding may **author
a new algorithmic form, execute it on the existing wave rails in a bounded
trial, preserve its lineage, and publish only after assessment and review**. It
changes no current contract by itself: PROPOSED means agreed direction, not
implemented behaviour, and implementation must land together with tests and the
promotion of this volume's affected sections to CURRENT. It is written to the
extension checklist of Vol. 11 §7. (Lineage: the volume descends from the
reference project's design proposal; it is self-contained and supersedes the
need to read that document.)

## 1. Outcome and boundaries

Target path, one continuous and inspectable line:

```text
user intent → semantic charter → planner bind authors a CellBlueprint
→ controller wraps it into a CellPackage (parent-owned policy + Charter snapshot)
→ CellSpace admits it as a Trial Cell → the Cell runs on ordinary rails
→ cell.result (staged) → independent weighted assessment → human review
→ accept: sealed integration published │ revise: new sibling Cell │ archive
```

Boundaries fixed for the first slice: no arbitrary generated-code execution; no
dynamic controller installation; no physical per-Cell log; no automatic
promotion; no replacement of the YAML authoring path; Cell isolation is
semantic scoping, **not** a security sandbox (§10).

## 2. Terminology

- **Semantic Charter** — the meaning contract for a bounded piece of work:
  title, purpose, question, weighted criteria (with optional minima). Committed
  before any algorithm is authored against it; the later planner cannot rewrite
  its criteria.
- **Cell** — a bounded runtime compartment: one local topology, local state, a
  Charter, an immutable starting context, ingress visibility conditions, an
  egress publication contract, budgets and capabilities, lifecycle and
  provenance. All Cells are projections over the one wave log.
- **CellSpace** — the `WaveProcessor` owning the root Cell and every child:
  routing, admission, materialisation, policy enforcement, lifecycle
  derivation. Replaces the standalone top-level topology in the assembly.
- **CellBlueprint** — untrusted model-authored content: declarative topology
  (same document shapes as external authoring), result contract, semantic
  links, schemas map, optional safe view, inert artefacts, optional revision
  binds.
- **CellPackage** — the immutable admission envelope around a blueprint:
  Charter snapshot + digest, parent-owned policy, selected context, authoring
  provenance. Assembled by the controller from the bind's bound scope and
  declared `emit.cell`; **never** from model output.
- **Trial Cell** — a Cell whose outputs are staged: private facts cannot become
  public integrations until sealing.
- **Template / precedent** — an immutable reusable blueprint/pipeline with
  applicability and proof runs (exact reuse after fresh checks) / a prior
  package-with-outcome retrieved as planner material (never registered
  directly).

### 2.1 Normative type shapes

Design-level shapes; names may adapt to the host language, but the
responsibilities MUST NOT collapse into one open record.

```ts
type CellRef = string;      // v1 value: `cell@<cell.seed offset>`
type CharterRef = string;   // v1 value: `charter@<charter.proposed offset>`

type CharterCriterion = { id: string; question: string; weight: number; minimum?: number };
type SemanticCharter  = { title: string; purpose: string; question: string;
                          criteria: readonly CharterCriterion[] };

type CellIngressRule      = { match_type: string; where?: readonly CollectWhereClause[] };
type BoundScopeSelector   = { scope: string; field?: string };   // one-level only
type BoundScopeProjection = BoundScopeSelector & { as: string };

type CellBudget = { max_depth: number; max_cells: number; max_revisions: number;
                    max_records: number; max_blueprint_bytes: number;
                    max_emissions: number; max_inference_calls: number };

type CellPolicy = { mode: 'trial';
                    isolation: 'snapshot' | 'subscribed' | 'meta';
                    raw_input: 'deny' | 'allow';
                    accepts: readonly CellIngressRule[];
                    capabilities: readonly string[];
                    budget: CellBudget;
                    publish: { candidate: string; accepted: string } };

type CellEmitDeclaration = CellPolicy & {
  charter_from: BoundScopeSelector;
  seed_from: readonly BoundScopeProjection[];
  revises_from?: BoundScopeSelector };

type SemanticLink = {
  source: { kind: 'purpose' } | { kind: 'question' }
        | { kind: 'criterion'; criterion_id: string };
  target: { kind: 'knot' | 'descriptor' | 'result_field' | 'view_element'
                 | 'schema' | 'artefact'; local_id?: string; path?: string };
  role: 'collects' | 'tests' | 'transforms' | 'publishes' | 'presents';
  rationale: string };

type GeneratedArtefact = { id: string;
  kind: 'function_source' | 'controller_source' | 'query_source'
      | 'migration_source' | 'prompt';
  media_type: string; language?: string; content: string; entrypoint?: string;
  requested_capabilities: readonly string[];      // review metadata, never grants
  fixtures: readonly Record<string, unknown>[] };

type CellBlueprint = { version: 1;
  topology: { knots: readonly unknown[]; descriptors: readonly unknown[] }; // Vol. 09 shapes
  semantic_links: readonly SemanticLink[];
  result: { local_fact_type: string; producer_bind: string; data_field: 'result';
            schema_ref: string; view?: Record<string, unknown> };
  schemas: Record<string, JsonSchema>;            // keys are local fact types
  artefacts: readonly GeneratedArtefact[];
  revision?: { planner_bind: string;
               reframe?: { charter_bind: string; planner_bind: string } } };

type CellPackage = { version: 1;
  charter: { ref: CharterRef; digest: string; value: SemanticCharter };
  blueprint: CellBlueprint;
  policy: CellPolicy;                              // normalised declaration
  context: Record<string, unknown>;                // the seed_from projections
  provenance: { bindId: string; uid: string; serviceRequestOffset: number } };

type AssessmentCriterion = { id: string; grade: number; rationale: string;
                             evidenceRefs: readonly number[] };
type AssessmentProposal  = { cellRef: CellRef;
                             criteria: readonly AssessmentCriterion[];
                             risks: readonly string[]; openQuestions: readonly string[];
                             recommendation: 'accept' | 'revise' | 'archive' };
type WeightedAssessment  = AssessmentProposal & {
  charterRef: CharterRef; resultOffset: number; proposalOffset: number;
  aggregate: number;                               // computed by CellSpace only
  provenance: { bindId: string; uid: string; serviceRequestOffset: number } };
```

`CellPolicy` is the declaration after its selection fields are resolved;
`blueprint.result.schema_ref` must resolve to the entry named by the local
fact type and to the same schema its producer bind uses; a Charter or policy
inside model-returned blueprint JSON is an unknown field and is rejected.

## 3. Authoring surface: `emit.cell`

A third, mutually exclusive `service.emit` variant (rail Vol. 11 §3.5). The
declaration is a **policy trust anchor**: the model may fill content within it
but cannot widen it; a nested `emit.cell` inside a generated blueprint is
untrusted until admission proves it a subset of the current Cell's ceiling.

```yaml
service:
  instruction: "Author one bounded CellBlueprint …"
  schema: schemas/cell-blueprint.schema.json
  emit:
    cell:
      mode: trial
      charter_from: { scope: charter, field: definition }   # one-level selectors only
      seed_from:                                            # → immutable cell.context
        - { as: frame,   scope: frame }
        - { as: charter, scope: charter, field: definition }
      revises_from: { scope: revision }                     # optional; also in seed_from
      isolation: snapshot            # snapshot | subscribed | meta
      raw_input: deny                # deny | allow; nested may not widen deny→allow
      accepts: [ { match: evidence.granted } ]              # ingress rules (shared matcher)
      capabilities: [inference]      # closed registry; v1: inference only
      budget:                        # closed keys; §8
        max_depth: 1
        max_cells: 1
        max_revisions: 2
        max_records: 16
        max_blueprint_bytes: 131072
        max_emissions: 120
        max_inference_calls: 8
      publish: { candidate: answer.candidate, accepted: chat.message.answer }
```

Compiler rules (loader work item): mutual exclusivity with `writes`/`unfold`;
service schema required; selectors name existing scope aliases with at most one
non-empty top-level `field`; unique non-empty `as` names in `seed_from`; closed
keys and value sets throughout; `max_depth`/`max_revisions` non-negative
integers, other budgets positive integers; unknown fields rejected.

Controller rules: resolve `charter_from` / `seed_from` / `revises_from` from
the bound scope at discharge; assemble one `CellPackage` with the validated
result **as blueprint only**; a missing scope entry is `service.failed`, never
a partial package; the controller neither compiles nor judges the package.

## 4. CellSpace: placement, identity, materialisation

**Placement.** `Engine([CellSpace(root: TopologyGraph), …observers])`. With no
`cell.seed` on the log, the assembly MUST produce byte-identical logs to the
flat machine (root compatibility — the extension's primary regression gate).

**Identity without a universal scope field.** Ordinary domain tuples gain no
`cell_id`. Identity derives from committed offsets:
`CellRef = cell@<cell.seed offset>`; `CharterRef = charter@<charter.proposed
offset>` (assigned in the later `charter.defined`, since only an observer of
the committed proposal knows its offset). Cell depth is derived
(parent depth + 1), never authored.

**Materialisation.** Authored local names stay semantic; runtime names are
qualified: knots/binds `cell@42::evidence.ready`, private fact types
`cell@42::analysis.partial`. Every private-type reference in records —
`match_type`, `writes`, unfold templates, the result target — is rewritten
before commitment; reserved protocols and admitted imports keep their names.
Topology records gain optional `home: {cellRef, localId}` (absent on root
records — byte-compatibility preserved); unfold templates inside a Cell get
`home` added at materialisation so instantiated records commit with concrete
ownership. Local ids and private types MUST NOT contain `::` or start with
`cell@`.

**Fact classes at materialisation:** import (allowed by `accepts`, name
preserved) · private (qualified) · protocol (reserved namespaces; routed by
contract) · result (private during trial; wrapped into `cell.result`) ·
accepted export (emitted only after sealing).

**Routing order (deterministic).** Key equality with the seed key is required
before any predicate (predicates narrow, never widen). Then: Charter
proposals/definitions (§5.1 rules) → lifecycle facts (CellSpace-handled) →
topology records to their `home` (a Cell-owned record with missing/mismatched
`home` is audit-only: registered nowhere, fails the Cell) → `sys.knot.ready` to
the owner of the qualified knot → winding answers to the owner of `knotId` →
service answers/delegated records to the owner of `bindId`/uid → private
qualified facts to their owner → targeted `cell.context` to its CellRef →
remaining public facts against each open Cell's ingress predicates (one tuple
may reach several Cells). Root first, then Cells in creation-offset order.

**Isolation modes.** `snapshot` (default): context + own private facts +
correlated answers; no ambient future public facts. `subscribed`: + future
public facts matching `accepts`. `meta`: + lifecycle/assessment publications on
the same key; no outward capability unless declared. Visibility modes, not
transactions: abort is an appended event, never rollback.

## 5. Protocol family

All lifecycle records are ordinary `domain.fact` tuples (rail Vol. 04 §6). Key
rules throughout: same wave key as the seed; canonical emissions come only from
CellSpace; one request → at most one canonical outcome (consumed correlations).

### 5.1 Charter: `charter.proposed` → `charter.defined` | `charter.rejected`

A bind publishes untrusted `charter.proposed` via ordinary `writes` (its
`{bindId, uid, result}` wrapper is the provenance). CellSpace verifies the
causal same-key `service.request` (whose writes target is `charter.proposed`
and which MUST declare a schema), revalidates the closed shape, then emits
`charter.defined` `{definition: {ref, digest, value}, home, parentRef,
proposalOffset, provenance}` — or `charter.rejected` with path-anchored errors.
`home` derives from the proposing request's ownership (`null` for root). A
local definition routes to its owner and meta subscribers, not to root or
siblings. The first proposal or correlated failure consumes the request.

Reference payloads (data of the `domain.fact`):

```json
// charter.proposed — the ordinary writes wrapper is the provenance
{ "bindId": "request.charter.bind", "uid": "request.charter.bind#1",
  "result": { "charter": { "title": "…", "purpose": "…", "question": "…",
                           "criteria": [ { "id": "relevance", "question": "…",
                                           "weight": 1, "minimum": 0.75 } ] },
              "parentRef": null } }

// charter.defined — canonical, emitted by CellSpace
{ "definition": { "ref": "charter@17", "digest": "sha256:…", "value": { } },
  "home": null, "parentRef": null, "proposalOffset": 17,
  "provenance": { "bindId": "request.charter.bind",
                  "uid": "request.charter.bind#1", "serviceRequestOffset": 15 } }
```

`parentRef`, when present, must resolve to an earlier Charter and denotes a
refined next-level contract whose canonical definition is present in the
proposing request's scope. A domain requiring human Charter approval inserts a
review fact and gate between proposal and definition; it never mutates the
proposal.

### 5.2 Seeding: `cell.seed` → `cell.rejected` | `cell.opened` + records + `cell.context`

`cell.seed` carries the complete package. CellSpace does not trust the envelope:
it indexes the earlier `service.request` at the stamped offset and verifies
key, bindId, uid, schema, declaration, Charter alias, selected scope entries,
and effective policy; the blueprint is re-validated at admission (§6). A seed
without its causal request is rejected before any registration. On admission:
`cell.opened` (refs, parent, Charter digest and summary, mode/isolation,
materialised record ids, effective budgets/capabilities, package digest) → the
materialised topology records (each with `home` and planner `emittedBy`) →
`cell.context` `{cellRef, context}` **after** every record, so registration
precedes the first fact that may reach it. The seed offset becomes the CellRef;
first valid seed or correlated failure consumes the service correlation — even
a malformed seed is terminal for it.

Reference payloads:

```json
// cell.seed — the whole package, no duplicate top-level provenance fields
{ "package": { "version": 1,
    "charter":   { "ref": "charter@17", "digest": "sha256:…", "value": { } },
    "blueprint": { }, "policy": { }, "context": { },
    "provenance": { "bindId": "answer.planner", "uid": "answer.planner#1",
                    "serviceRequestOffset": 39 } } }

// cell.context — only the named seed_from projections, immutable
{ "cellRef": "cell@42", "context": { "frame": { }, "charter": { } } }
```

`cell.opened` carries: cellRef and seed offset; parent planner uid, owning
parent CellRef, optional revised CellRef; CharterRef, Charter digest and
summary; mode and isolation; materialised record ids; effective budgets and
capabilities; package digest. `cell.rejected` carries cellRef, seed offset,
and path-anchored errors — and registers nothing.

### 5.3 Result: `cell.result`

The declared result producer MUST be a local operator bind whose `writes`
target is the candidate type (deterministic emit output lacks publication
provenance and is not accepted in v1). CellSpace observes the qualified private
result fact, verifies bindId/uid, extracts `data.result`, validates it against
the embedded schema, then emits `cell.result` — review material, not yet
public:

```json
{ "cellRef": "cell@42", "result": { }, "schemaDigest": "sha256:…",
  "evidenceRefs": [], "localResultOffset": 73,
  "producedBy": { "bindId": "cell@42::answer.fold", "uid": "cell@42::answer.fold#1" } }
```

### 5.4 Assessment: `cell.assessment.proposed` → `cell.assessed` | `cell.assessment.rejected`

An evaluator bind **outside** the trial (its intention distinct from planner
and producer) binds the canonical Charter and `cell.result`, and writes a
proposal: per-criterion grades with rationale and evidence refs, risks, open
questions, recommendation. CellSpace verifies the causal request, requires
every Charter criterion exactly once, validates grades/evidence, and computes
the aggregate itself — `sum(grade·weight)/sum(weight)`, weights from the
Charter only (grades and minima finite in [0,1]; weights non-negative, positive
sum). Only then `cell.assessed`. A model-supplied aggregate is ignored data.
Four verdicts never collapse: **admission ≠ runtime success ≠ assessment ≠
human usefulness**.

### 5.5 Review and terminals

`cell.reviewed` `{cellRef, decision: accept|revise|archive, assessmentOffset,
aspects[], actor}` — committed from human ingress (actor stamped server-side;
never self-declared by browser or model). Aspects have the closed shape
`{kind: clarify|correct|preserve|override|risk|reframe, note, criterion_id?,
semantic_target?}`; `revise` requires ≥ 1 aspect; accepting below a criterion
minimum requires an `override` aspect; `accept` requires the canonical
assessment of the current result.

Terminals: `accept` → `cell.sealed` + the accepted export — always the
system-owned envelope, whatever the declared fact type:

```json
{ "factType": "chat.message.answer",
  "data": { "cellRef": "cell@42", "charterRef": "charter@17",
            "assessmentOffset": 88, "reviewOffset": 91, "result": { } } }
```

(`result` still validates against the blueprint result schema; the
surrounding fields are never model-authored; the envelope is used only for a
Cell's accepted export, not stamped on ordinary facts.) Provable violation → `cell.failed` with
closed reason (`budget_exceeded`, `capability_violation`,
`invalid_generated_fact`, `invalid_result`, `runtime_invariant`); expected
`*.failed` facts do NOT auto-fail a Cell. `revise` → owner-targeted
`cell.revision.requested` (self-contained: Charter, prior context, aspects,
prior result/assessment/failure); the declared revision planner authors a
replacement whose `revises_from` names that fact; the replacement derives the
**old** Cell's parent and depth; the old Cell archives only after the
replacement opens. `archive` → `cell.archived`, no public integration.
Reviews are idempotent; conflicting/premature reviews emit
`cell.review.rejected`; only the first valid terminal path publishes.

### 5.6 Required partial order (happens-before, never adjacency)

```text
charter service.request < charter.proposed < charter.defined
< planner service.request < cell.seed < cell.opened
< every local topology record < cell.context
< valid local result < cell.result
< evaluator service.request < cell.assessment.proposed < cell.assessed
< cell.reviewed < cell.sealed | cell.revision.requested | cell.archived
< accepted public export (accept only)
```

Unrelated committed tuples may appear between any two nodes.

### 5.7 Transition table and idempotency

| Current state | Committed input | Required emission | Next state |
| --- | --- | --- | --- |
| absent | valid `cell.seed` | `cell.opened`, records, context | running |
| absent | invalid `cell.seed` | `cell.rejected` only | rejected |
| running | declared local result | `cell.result` once | awaiting_assessment |
| running | provable policy/schema/budget violation | `cell.failed` | failed |
| awaiting_assessment | valid assessment proposal | `cell.assessed` | ready_for_review |
| ready_for_review | review `accept` | `cell.sealed`, accepted export | sealed |
| ready_for_review | review `revise` | `cell.revision.requested` | revision_requested |
| awaiting_assessment | review `revise` | `cell.revision.requested` | revision_requested |
| failed | review `revise` | `cell.revision.requested` | revision_requested |
| revision_requested | replacement seed admitted | `cell.archived` with `supersededBy` | archived |
| awaiting_assessment · ready_for_review · failed · revision_requested | review `archive` | `cell.archived` | archived |

Derived, not evented: `running`, `awaiting_world`, `awaiting_assessment`,
`ready_for_review`, `failed`, `sealed`, `archived` read from explicit
lifecycle events; `stalled` / `settled_unfinished` derive from a quiescent log
with an open result path (no `cell.stalled` fact until a reliable quiescence
hook exists, Vol. 11 §6.2). Only the first valid terminal path may publish;
repeating an identical review is a no-op; a conflicting or premature review
(before `cell.result`; `accept` before canonical assessment; `accept` from a
failed Cell) emits `cell.review.rejected` with the current state. The owning
parent CellRef derives from the service-request ownership index, never parsed
from a model-supplied id string.

## 6. Admission (`admitCellPackage`)

A pure function: package + seed + matched causal request + matched Charter +
parent policy + immutable id indexes → fully materialised plan **or** structured
errors. No record is emitted until every check passes (all-or-nothing;
rejection registers nothing). The seventeen checks, in order: (1) outer closed
shape + canonical byte ceiling; (2) Charter authority (earlier same-key
definition; value + digest match; no replacement Charter/policy in blueprint);
(3) causal request (offsets, bindId/uid, emit form, schema; unconsumed;
revision source rules); (4) Charter content (non-empty purpose/question, unique
criteria, weight rules); (5) schema support and coverage (subset only; every
writable private type covered; exact-key refs; no paths/URLs); (6) topology
compilation via the **shared** compiler; (7) semantic links (every criterion
served; every generated element justified; no dangling targets); (8) identity
(unique local ids; reserved separators); (9) imports (every unqualified collect
is import or protocol; raw-input policy); (10) exports (exactly one result
path; candidate/accepted types per policy); (11) reachability (static bipartite
graph `fact → knot → readiness → bind → fact`; conservative: unprovable = 
reject); (12) closure (activations/demands resolve; revision/reframe paths
verified); (13) termination (records, depth, children, unfold worst-case from
schema `maxItems`, emissions, calls — within parent ceiling and remaining
ancestor budgets); (14) capabilities (subset of parent; v1 inference only;
artefact `requested_capabilities` are review metadata, never grants);
(15) protocol authority (no generated writes to lifecycle/review/accepted
types); (16) view safety (fields of the result schema only; no script/URL/
expressions); (17) attribution (lineage reconstructable from uid, offsets,
parent, ids, digest).

**Semantic links** are the meaning-to-form bridge: `{source:
purpose|question|criterion, target: knot|descriptor|result_field|view_element|
schema|artefact, role: collects|tests|transforms|publishes|presents,
rationale}`. Records instantiated later by admitted unfold inherit the
producing descriptor's links; runtime-generated items never invent new
justification.

## 7. Canonical JSON and digests

One shared `canonicalJson(value)` for every digest (Charter, blueprint,
package, schema, artefact) and for `max_blueprint_bytes`: JSON values only
(reject `undefined`, non-finite numbers, functions, cycles); array order
preserved; object keys sorted recursively by code point; no insignificant
whitespace; SHA-256 over UTF-8; `sha256:<64 hex>`. Digests prove content
identity, not trust. Model-supplied digests are unknown fields.

Derived read models (pure functions of the log, rail Vol. 08 §8):
`digestCharters`, `digestCells`, `digestDecisions`, `digestArtefacts`; Charter
status ∈ running | waiting | review | failed | accepted | archived | stalled.
`stalled`/`settled_unfinished` remain quiescence digests, not in-wave facts
(open hook, Vol. 11 §6.2).

## 8. Budgets and the session layer

Accounting semantics: `max_depth` — greatest admitted descendant distance;
`max_cells` — the Cell plus all descendants (replacements consume
`max_revisions`, not subtree slots; initial attempt uncounted); `max_records` —
owned records including later unfold; `max_blueprint_bytes` — canonical bytes
including schemas/views/artefacts/fixtures; `max_emissions` — every locally
returned emission pre-interception (a rejected attempt still counts);
`max_inference_calls` — every intention pre-discharge (failures count). An
action increments the owner **and every ancestor**; child declarations must fit
the parent ceiling *and* remaining ancestor budgets (monotone narrowing; no
multiplication by fan-out). In-flight child/unfold requests **reserve**
worst-case budget at request commitment; completion converts, failure releases.
The first pre-commit action over a ceiling is withheld → one `cell.failed`;
already-committed controller completions over a ceiling stay as audit,
unregistered, and fail the Cell. CellSpace's own lifecycle emissions consume no
Cell budget (failure reporting must not recursively fail).

**WaveSession** (prerequisite for chat/review ingress): owns one runtime and
key; serialises messages and reviews; re-settles only after the previous settle
completes; one JSONL/SSE history; digests exposed; message endpoint accepts
only declared input fields, review endpoint stamps `actor` server-side.

## 9. Effect policy (producer matrix)

| Producer | May publish |
| --- | --- |
| CellSpace | canonical Charter/Cell lifecycle, review normalisation, accepted export |
| WaveSession ingress | declared user inputs; `cell.reviewed` |
| admitted local topology | private facts; `inference.request`/`service.request` via built-in executors |
| installed service controller | correlated completions; the request's declared emit |
| artefact/delivery controllers | their statically declared receipt protocols only |

Generated topology may not write lifecycle/review/seal/failure/archive/accepted
types (admission rejects; runtime interception remains as defence). Before
returning an emission a controller could claim, CellSpace checks capabilities:
an unauthorised intention never enters the log — instead `cell.effect.rejected`
+ `cell.failed(capability_violation)`; nothing crosses the membrane that was
not first committed. The controller list stays the readonly assembly array; no
fact modifies it; controller activation requires human approval, review/tests,
deployment installation, explicit credentials, and an auditable control-plane
operation.

## 10. Artefacts, storage, promotion

Risk-ordered tiers: **Tier 1** (auto-trialled): declarative blueprints, JSON
Schemas, safe views, prompts, criteria — data interpreted by policy-controlled
code. **Tier 2** (generated, never auto-executed): TS/JS, SQL, connector/
controller source, migrations — stored, diffed, linted, fixture-tested,
reviewed. **Tier 3** (sandboxed execution): a separate capability host with
OS-level isolation, invoked itself as a membrane intention — explicitly not
designed here. Every artefact: unique local id, ≥ 1 semantic link, digests
computed by CellSpace, fixtures inert and inside the byte ceiling.

Packages are immutable by content: the trial never executes a mutable path;
`cell.opened` records the digest; an optional static `ArtefactStoreController`
persists by digest; sealing is proof of usefulness in context, not universal
correctness; promotion (precedent: exact package; template: blueprint digest +
applicability contract) is a separate explicit action; reuse always re-enters
fresh admission. One accepted run suffices for a precedent; template thresholds
are domain policy, not CellSpace code.

## 11. Blind spots (must not be pretended solved)

Persistent replay/restart; ownership-encoding proof across every protocol
(else a narrow protocol-level origin field; envelope-wide `cell_id` stays
rejected); quiescence hook; operator one-shot lifecycle; schema subset
expressiveness; conservative reachability limits; evaluator independence
(shared model bias); complete cost budgets (tokens/money); logical-vs-security
isolation; reasoning-data privacy/retention; concurrent ingress; human review
load; template generalisation; generated-view renderer; log growth;
control-plane UI; the `cell` terminology collision (resolved by the canonical
table: knot = accumulator; bind = gather/judge/publish; bound scope = one
bind's record; Cell = bounded local topology and lifecycle; Charter = semantic
obligation; Membrane = external boundary); Charter authorship quality;
deterministic publication attribution.

## 12. Implementation phases and acceptance

Phase 0 maturity prerequisites (Vol. 11 §6.3) → Phase 1 flat-compatible
CellSpace (identical logs) → Phase 2 static Trial slice (hand-authored
blueprint fixture; child cannot see raw input, cannot pollute root, cannot
replace Charter/policy, publishes only after accept) → Phase 3 planner-authored
blueprint (real `emit.cell`; independent evaluator; revision planner; full
budgets) → Phase 4 chat + Charter rail over WaveSession → Phase 5 library
(digest store, precedents, promotion) → Phase 6 advanced artefacts/sandbox/
control plane. §13 is the normative regression catalogue.

## 13. Regression catalogue

An E(cells) claim (Vol. 14 §1) requires demonstrable tests for each line.

**Compatibility.** Root-only CellSpace reproduces the golden log exactly;
every flat pipeline/loader/runtime test stays green; `writes` and `unfold`
emissions unchanged; one assembly across shells.

**Admission.** Reject: unknown package keys; malformed schemas/views; a
missing, later, mismatched, or model-replaced Charter; a seed with no matching
earlier same-key request; mismatched offset/bindId/uid/scope/schema/emit/
policy; a second seed or conflicting terminal completion per service uid;
missing/duplicate assessment criteria, out-of-range grades, invalid evidence
offsets, self-evaluation correlation, model-supplied aggregate; dangling
semantic links, unserved criteria, unjustified generated records; missing
knots/demands, unreachable results; duplicate local ids, reserved
prefixes/separators; raw-input collection absent from imports; undeclared
public writes; direct writes to lifecycle/review/accepted protocols; oversized
canonical blueprints, malformed/duplicate artefact ids; unbounded unfold
arrays, worst-case fan-out over budget; record/depth/fan-out/call budgets or
capabilities above the parent ceiling. Prove rejection registers no partial
topology.

**Isolation and routing.** A child receives structured `cell.context`, never
the raw message; `raw_input: deny` blocks direct raw selection while allowing
derived structured publications; sibling Cells reuse local ids without
collision; private facts do not wind siblings or root; a local Charter reaches
owner/selected-child context only; no mode routes across wave keys; one public
fact may wind two subscribed Cells; correlated answers return to the owning
Cell; unfold records inherit the Cell home — a missing/contradicting home is
audit-only, fails the Cell, registers nowhere; Cell ordering is deterministic.

**Lifecycle.** Proposal offset defines CharterRef and canonical content its
digest; a valid proposal yields exactly one definition, a forged one only
rejection; a planner cannot bind a Charter committed after its request; seed
offset defines CellRef; records precede context; result stays staged before
review; assessment normalised once with the aggregate recomputed from Charter
weights; accept requires the canonical assessment of the current result and
emits sealed + one enveloped export; revise creates a new attempt, never
mutates the old, and is rejected without a reachable revision planner/budget;
a replacement derives the old parent/depth and records `revisesCellRef`;
reframe requires its two-bind path and a new canonical Charter first; a
revision-requested Cell archives only after its replacement opens; archive
publishes nothing; repeated review is idempotent, conflicting review emits
`cell.review.rejected`; settled-unfinished is never labelled success.

**Capabilities.** An unauthorised effect becomes `cell.effect.rejected` +
`cell.failed` and is never claimed by a controller; allowed inference works
and is budget-counted; schema-invalid local emissions are withheld; an invalid
committed controller completion stays audit-only and fails the Cell; crossing
any hard budget emits one terminal failure and no over-budget emission;
sibling/nested activity consumes ancestor aggregates rather than multiplying
ceilings; a model-authored controller artefact cannot modify the membrane; no
generated native source is evaluated in-process.

**UI.** Digests are pure functions of the persisted log; SSE replay
reconstructs the surface; chat shows only committed messages/statuses;
generated view paths check against the result schema; Charter criteria
navigate to their linked targets; the raw trace stays reachable from every
result; review ingress commits before lifecycle changes appear.
