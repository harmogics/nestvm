# Open binds and architecture derived from the cross-source analysis

**Status:** Candidate architecture and question catalogue, 2026-07-14

## Purpose

This document turns the tensions in
[cross-source-concept-analysis.md](./cross-source-concept-analysis.md) into
candidate Nest binds, product behaviour, API contracts, and backend boundaries.
The binds are semantic obligations, not accepted runtime YAML. Their tuple names,
schemas, and placement must be reconciled with the actual compiler and runtime
before implementation.

## Architectural spine

The proposed system retains the existing Nest spine:

```text
external/user gesture
  → validated ingress tuple
  → activation knot winds and tests readiness
  → bind descriptor activates
  → heads seed bounded cascades
  → demands gather integrations at a barrier
  → gates decide
  → service forms an integration
  → emit publishes to the one wave log
  → read models project the current UI/API surface
```

Semantic computation that leaves the process follows the longer arc:

```text
committed intention
  → output controller, exactly-once discharge
  → model/tool/human/world
  → correlated committed answer
  → waiting knot winds
```

The new work belongs around this spine: context manifests, epistemic
qualification, seam preservation, attestation, projections, operator catalogues,
and completion contracts. None requires a second engine output or a wider tuple
envelope in the invariant core.

## Candidate bind O0: Route distinction preconditions

**Purpose.** Apply only the distinction threads needed before an expensive
operation, without turning all eight threads into permanent UI or mandatory work.

**Activation.** A user requests an operator, a bind approaches integration, a
result crosses a human/model boundary, or a phase transition is proposed.

**Affinity.** Operator purpose, current focus, source snapshot, intended emission,
session risk policy, held ambiguities, current phase, and prior path residue.

**Heads.** Bounded checks for referent ambiguity, source sort, seam obligations,
carrier transfer, pressure/challenge, path dependence, and required scale.

**Service.** A deterministic marker router selects the minimal relevant threads.
An optional model may propose markers but cannot decide authoritative policy.

**Emit.** A `distinction.preflight.formed` proposal containing activated thread
ids, reasons, required checks, and deferred checks.

**Holds.** Total expansion is a failure of restraint. A thread is not a Harmogics
phase and does not become a new core primitive.

**Open questions.** Which rising-cost points require preflight by policy? Can the
router remain entirely deterministic for v1?

## Candidate bind O1: Seal the semantic radius

**Purpose.** Make the actual context of an operator reproducible and visible at
the point of choice.

**Activation.** An allowlisted semantic operator is selected through the single
composer or a child bind is opened for depth.

**Affinity.** Current root/focus tuple, non-excluded left values, target knot if
any, user text, operator parameters, phase and preflight requirements, access
policy, and context budget.

**Heads.** Requests to resolve content-addressed sources and permitted projection
snapshots as-of a fixed log offset.

**Service.** Build an immutable context manifest. It records included and excluded
refs, source versions, offset range, selection reason, visibility policy, token or
size budget, and any automatic suggestions separately from human choices.

**Emit.** `context.projection.sealed` with a digest and bounded manifest or artifact
reference.

**Holds.** No hidden ambient chat history. Later changes to the left rail do not
alter a running bind. A context manifest is a projection, not a new truth plane.

**Open questions.** Are pre-bind root signals included automatically? How is an
excessive default-in source set reduced without silently overriding the person?

## Candidate bind O2: Hold or resolve reference ambiguity

**Purpose.** Prevent surface form from silently deciding ontology while avoiding
premature expansion.

**Activation.** The preflight router detects a referent ambiguity and a downstream
operation now depends on its resolution.

**Affinity.** Exact source spans, discourse history inside the sealed radius,
current referent registry, intended operator/output schema, and user answer policy.

**Heads.** A human-answer request or bounded guide proposal when the distinction
cannot be determined from committed evidence.

**Service.** Resolve the referent, split it, preserve the existing identity, or
hold the ambiguity explicitly until a later dependency point.

**Emit.** `reference.resolved`, `reference.split`, or `ambiguity.held`, each with
source spans, confidence/authority, and the operation that made the decision
necessary.

**Holds.** Neither forced merging nor unlimited fragmentation. Asking a question
changes the path and must be recorded.

**Open questions.** Does the referent registry belong to a session, a branch, a
document, or a reusable domain vessel? How is a held ambiguity shown without
visual noise?

## Candidate bind O3: Qualify source and claim posture

**Purpose.** Distinguish what was observed, supplied, inferred, bridged, accepted,
or disputed before reuse or publication.

**Activation.** A new source enters, a model proposal returns, an integration is
about to be released left, or a result crosses the membrane.

**Affinity.** Claim spans, source refs, actor/carrier identity, deterministic
derivation trace, model/function signature, evidence policy, and prior
attestations.

**Heads.** Requests for missing evidence or human attestation where the policy
cannot qualify the claim automatically.

**Service.** Apply a small schema-closed source-sort vocabulary and preserve
unknown rather than manufacturing certainty.

**Emit.** `claim.qualified` or `qualification.requested` with scope, authority,
uncertainty, and evidence refs.

**Holds.** Log commitment proves occurrence, not proposition truth. Model fluency
does not increase grade. A legitimate marked bridge is preferable to source
paralysis.

**Open questions.** What vocabulary is domain-general enough for the shell but
precise enough for regulated cases? Who may upgrade a claim's grade?

## Candidate bind O4: Open a knot into a child bind

**Purpose.** Give operational meaning to the rightward depth gesture.

**Activation.** The person marks a visible knot for deeper treatment.

**Affinity.** Parent bind instance, selected knot projection and technical refs,
current wound understanding, source manifest, desired operator or requested guide
proposal, depth/fan-out budget, and parent completion policy.

**Heads.** A branch-scoped child-intent tuple carrying the parent knot's angle of
perception and the expected result shape.

**Service.** Instantiate an allowlisted child bind template or create an inert
topology proposal if no admitted template can satisfy the request.

**Emit.** `child.bind.opened` plus parent/child correlation and a declared return
demand. The child later publishes its integration normally; the parent demand
gathers it through the wave.

**Holds.** Depth is a real attributed cascade, not nested browser state. The parent
does not receive a private callback. Budget, reachability, and termination apply.

**Open questions.** Does a parent wait for all opened children, only required
children, or a user-selected subset? Can a child be closed as explicit unknown?

## Candidate bind O5: Form a seam-preserving integration

**Purpose.** Produce reusable understanding without laundering sources or turning
a summary into unquestioned truth.

**Activation.** The current bind's required knots and child demands are ready, or
the person requests integration of the currently eligible subset.

**Affinity.** Bound knot integrations, source qualifications, held ambiguities,
counter-evidence, operator signature, context manifest, path residue, result
schema, and uncertainty policy.

**Heads.** Optional bounded synthesis intention to an inference controller.

**Service.** Form a concise integration and a contribution map that keeps each
input addressable. Validate that mandatory contradictions and unknowns remain
visible.

**Emit.** `semantic.integration.candidate` using the provenance-rich integration
envelope defined in the cross-source analysis.

**Holds.** Integration is publication, not private return. Accepted synthesis is
not source erasure. The bind judges and publishes; knots only accumulate and test.

**Open questions.** What is the minimum contribution map that makes no-laundering
testable? Must user acceptance precede left-rail availability?

## Candidate bind O6: Test a seam under challenge

**Purpose.** Distinguish evidence-sensitive revision from capitulation under
pressure or self-protecting clamp.

**Activation.** A user challenges a knot/integration, conflicting evidence enters,
or a policy requires an alternative before publication.

**Affinity.** Target claim, original source and contribution map, objection,
objector/source grade, counter-evidence, prior confidence, and acceptance frame.

**Heads.** Parallel evaluation of support, contradiction, and framing error where
budget permits.

**Service.** Compare the objection's grounds rather than its rhetorical force.
Determine whether to revise, hold, split, or preserve the claim.

**Emit.** `challenge.resolved` containing outcome, changed fields, unchanged
fields, reasons, and a traceable seam to the superseded candidate if revised.

**Holds.** Every unbinding leaves a trace. Neither automatic obedience nor
unfalsifiable self-defence is acceptable.

**Open questions.** Which challenges require independent evaluation? How can the
UI reveal a consequential revision without reopening every historical panel?

## Candidate bind O7: Attest a carrier-boundary transfer

**Purpose.** Preserve judgement when meaning passes between model, human, team,
API consumer, or publishing surface.

**Activation.** A model result is offered for human adoption, a local integration
is released left, a root result is published, an override is requested, or an
artifact leaves the system.

**Affinity.** Candidate integration, source grades, visible seams, unresolved
uncertainties, acceptance frame, actor authority, carrier boundary, path residue,
and policy.

**Heads.** Human-answer request for responsibility-bearing decisions; independent
assessment request where required.

**Service.** Record accept, reject, qualify, override, or request revision. The
service validates authority but does not manufacture the human judgement.

**Emit.** `attestation.recorded`, optionally followed by
`semantic.integration.accepted` or an explicit revision/override request.

**Holds.** Model self-assessment is not human attestation. Silence is not consent.
An override carries rationale and never rewrites prior facts.

**Open questions.** Which left-rail releases are lightweight selections and which
are formal attestations? How does a multi-user session represent contested
attestation?

## Candidate bind O8: Preserve path residue

**Purpose.** Capture knowledge produced by traversal, revision, or phase order that
is not present in the final coordinate alone.

**Activation.** Return from a child bind, complete a phase loop, revise under
challenge, compare two paths, or close a session.

**Affinity.** Ordered semantic decisions, before/after integrations, operator
versions, source-set changes, branch ancestry, and declared path-sensitivity
policy.

**Heads.** Optional comparison of A→B and B→A runs or trajectories when a
non-commutativity question is material.

**Service.** Identify a bounded residue: what became knowable through the path,
which assumption changed, or which order affected the result.

**Emit.** `trajectory.residue.formed` with references to the relevant offsets and
integrations.

**Holds.** Do not log speculative psychology or every cursor movement. Preserve
semantic path only when it changes responsibility, interpretation, or result.

**Open questions.** Which gestures are semantic enough to enter the path? Can path
residue be generated deterministically from existing decisions in v1?

## Candidate bind O9: Propose longitudinal context

**Purpose.** Maintain focus across long sessions without hidden ambient prompting
or permanent authority for old interpretations.

**Activation.** A declared cadence, semantic pattern, repeated operator path, or
session-resume event matches a versioned keeper policy.

**Affinity.** Bounded historical signals and integrations, existing context
proposals, source qualifications, session policy, current root, and privacy budget.

**Heads.** A bounded synthesis intention when deterministic aggregation is
insufficient.

**Service.** Propose a longitudinal vessel and selection weight. Record cadence,
pattern version, source interval, reinforcement, contradiction, and decay policy.

**Emit.** `longitudinal.context.proposed`; after policy or human admission,
`longitudinal.context.admitted` may become a suggested source for future manifests.

**Holds.** Decay changes present influence, not historical existence. A keeper is
not a hidden agent and cannot silently alter topology or mandatory context.

**Open questions.** What is the first honest keeper use case? What user control is
needed to inspect, mute, or revoke its current influence?

## Candidate bind O10: Propose and admit topology

**Purpose.** Let repeated useful work evolve the operator catalogue without
granting model output immediate execution authority.

**Activation.** No admitted operator can satisfy a user purpose, repeated
trajectory residue suggests a reusable method, or structured failures expose a
missing knot/provider/gate.

**Affinity.** Acceptance frame, observed trajectories including failures, existing
operator catalogue, schemas, capability registry, compiler policy, budgets,
privacy constraints, and topology version.

**Heads.** Draft generation, compiler validation, fixture runs, bounded Trial,
independent assessment, and human review.

**Service.** Produce individual knot/descriptor records or a package proposal;
check reachability, termination, attribution, identity, capability, and policy.

**Emit.** `topology.proposed`; only a separate authorised admission decision emits
versioned records eligible for registration.

**Holds.** Understanding may author topology, but proposal is not admission.
Generated browser code and new controllers remain outside this bind unless an
explicit sandbox/capability is installed.

**Open questions.** Is admission performed inside the same session, in a child
Trial, or only through Studio? What proof runs are enough for an operator to become
available in a learning petal?

## Candidate bind O11: Evaluate and publish the root result

**Purpose.** Give the recursively open process a finite, honest product finish.

**Activation.** The person requests completion or the root result contract becomes
eligible for evaluation.

**Affinity.** Root candidate, required local integrations, child-demand status,
held ambiguity, explicit unknowns/skips, evidence and source grades, path residue,
assessment results, attestation policy, and session budget.

**Heads.** Missing-obligation requests, independent assessment, reflection, or
human attestation as declared by the session type.

**Service.** Deterministically evaluate completion gates. Form the final literary
projection only from accepted/qualified integrations while preserving open
uncertainty and provenance DAG references.

**Emit.** `session.result.candidate`, followed by `session.result.accepted` and
`session.completed` only after required attestation; or
`session.archived.incomplete` when the person closes without satisfying the
contract.

**Holds.** Quiescence is not completion. A polished document cannot silently close
missing responsibility. The final text is a surface over the knowledge topology,
not its canonical replacement.

**Open questions.** Which session petals require independent assessment or learner
reflection? Can an explicitly partial document be a valid terminal result type?

## UI architecture

### Spatial contract

The interface is a focused semantic surface, not a topology dashboard:

- **Centre:** one current bind instance as master heading, with only its current
  knot details below.
- **Left:** stable local integrations available for higher-order affinity. Values
  are default-in unless excluded, but the exact source snapshot is sealed when a
  new bind starts.
- **Right:** child binds opened from knots selected for depth. Each item preserves
  its parent knot and return demand.
- **Up:** parent/root ancestry and refinement through the same bind-plus-knots
  primitive.
- **Down:** continuation of the current scene.
- **Bottom:** one composer. Target context and optional operator alter the semantic
  meaning of one field; they do not create separate forms.

### Attention contract

The default surface shows only information needed for the next judgement:

- no diagnostic prose for valid inactivity;
- no full runtime graph;
- no permanent provenance wall;
- no automatic expansion of all distinction threads;
- no hidden source selection.

Source seams, grades, context radius, model signature, and path become visible at
their rising-cost points: operator execution, integration, challenge, release,
attestation, export, and replay inspection.

### Suggested visual states

1. **Root material:** the person's words with a quiet operator map; no bind is
   invented.
2. **Active scene:** bind heading plus the minimum current knots.
3. **Awaiting person:** the selected knot and one composer; no extra answer form.
4. **Depth opened:** child scene appears on the right; parent remains addressable.
5. **Local candidate:** concise integration with accept/revise/deepen actions.
6. **Released value:** stable left panel with collapsed qualification and
   provenance.
7. **Root candidate:** final literary projection, open uncertainties, completion
   gates, and attestation action.

## API architecture

### Command boundary

The primary public commands may be:

```text
POST /api/v1/sessions
POST /api/v1/sessions/{sessionId}/turns
POST /api/v1/sessions/{sessionId}/decisions
POST /api/v1/sessions/{sessionId}/artifacts
```

`turns` preserves the single-composer contract:

```json
{
  "clientTurnId": "uuid",
  "expectedOffset": 42,
  "text": "...",
  "targetKnotId": null,
  "operator": {
    "templateId": "unfold",
    "version": "1",
    "parameters": {}
  },
  "sourceSelection": {
    "included": ["value-4", "value-7"],
    "excluded": ["value-5"]
  },
  "focusRef": "root"
}
```

Working recommendation: `targetKnotId` and `operator` are mutually exclusive in
v1. Neither means a plain signal. The server, not the browser, stamps actor,
session, authoritative source snapshot, and submission time.

`decisions` carries responsibility-bearing gestures such as deepen, release,
exclude/include, challenge, attest, override, request completion, and archive.
Pure navigation—scrolling, moving up, opening a read-only inspector—does not need
to enter the wave unless an audit policy explicitly requires access logging.

All command endpoints require idempotency keys and optimistic offset checks. A
retry must not duplicate a turn, topology record, or external effect.

### Query and stream boundary

```text
GET /api/v1/sessions/{sessionId}/projection
GET /api/v1/sessions/{sessionId}/values/{valueId}
GET /api/v1/sessions/{sessionId}/provenance/{ref}
GET /api/v1/sessions/{sessionId}/events?after={offset}   # SSE
GET /api/v1/operator-catalogue?sessionType={id}
```

Queries return `asOfOffset`, projection version, topology version, and links to
deeper provenance. SSE mirrors committed tuples or stable product events and does
not invent client-only semantic state.

### Controller boundary

Together AI, other models, tools, notifications, webhooks, and human task delivery
use internal intention/answer protocols. Provider credentials and raw policy stay
server-side. Every response records provider/model version, correlation id, usage,
schema outcome, and bounded response digest or artifact reference.

## Backend architecture

### Required services around the invariant core

1. **Session manager.** Serialises ingress, retains a live runtime when available,
   and rehydrates honestly from log/snapshots after restart.
2. **Ingress mapper.** Validates commands, stamps authority, and commits canonical
   turns and decisions.
3. **Operator catalogue.** Maps product operators and versions to compiled bind
   templates and declared capabilities.
4. **Wave assembly.** Reuses `assembleWave()`, `WaveEngine`, topology graph,
   executors, and the normal settle cycle.
5. **Context projection service.** Seals semantic-radius manifests from explicit
   source selections and as-of offsets.
6. **Artifact store.** Holds large documents, model bodies, and final exports by
   digest; the log carries bounded refs and metadata.
7. **Epistemic policy service.** Validates source sort, qualification, seams,
   ambiguity, and attestation requirements outside the core.
8. **Controller outbox/inbox.** Claims committed intentions exactly once and
   returns correlated answers through ingress.
9. **Topology compiler and admission service.** Validates proposals, runs Trials,
   and registers only admitted versioned records.
10. **Projection builder.** Produces centre/left/right/up surfaces, value views,
    provenance, status, and SSE from committed history.
11. **Completion evaluator.** Applies the immutable session result contract and
    deterministic gates; external evaluators only propose criterion judgements.
12. **Log mirror and durable session store.** Preserves CLI-compatible JSONL or an
    equivalent durable ordered history plus metadata needed for recovery.

### Deployment boundary

The first implementation can keep these roles in one Next.js application process
with clear modules. The invariant is separation of contracts, not premature
microservices. Provider controllers, artifact storage, and durable session storage
are the first likely extraction boundaries because they own external power,
payload size, and lifecycle respectively.

## New scenario frontiers

### 1. Late binding of plain signals

Several user messages may accumulate before an operator is chosen. A later bind
must seal an explicit root projection rather than consume an accidental entire
chat history. This scenario tests restraint, focus, and replay.

### 2. Deferred ambiguity

A referent can remain folded-but-marked through several turns and become a user
question only when a document schema or integration depends on it. This tests
reference identity, holding, and minimal attention.

### 3. Parallel depth with unequal obligations

Several knots may open rightward child binds, but only some may be mandatory for
parent integration. This forces explicit barrier semantics and distinguishes open
interest from load-bearing demand.

### 4. Challenge after release

A left-side value reused by later binds may be challenged. The system must append a
revision/supersession seam and identify downstream integrations affected by the old
version without rewriting them.

### 5. Recompute under a new model or topology version

The same context manifest can be processed under a new model or admitted operator
version. The system must preserve both integrations, compare them, and prevent the
new result from laundering the old path.

### 6. Human/model carrier transfer

A model proposes a polished integration; the person accepts only part, qualifies
another part, and supplies an original judgement. The final vessel must preserve
these authorship boundaries.

### 7. High-stakes override

An authorised user overrides a gate or accepted integration. The override is an
additive responsibility fact with rationale, authority, scope, and downstream
effect—not a mutation.

### 8. Interrupted semantic winding

The process restarts while an inference intention is in flight or a knot has wound
some but not all deltas. Correlation, idempotency, snapshots, and rehydration must
prevent duplicate discharge and lost readiness.

### 9. Longitudinal keeper disagreement

A keeper proposes that the session's active context has shifted; the user rejects
the suggestion. Future context manifests must reflect the rejection without
deleting the observed pattern.

### 10. Topology gap discovered in a live session

The user asks for an operator that has no admitted template. The current session
stores an inert proposal and may open a child Trial, but cannot let generated YAML
replace its active topology.

### 11. Multi-user contested integration

Two people disagree over a local value. The log must preserve both attestations,
authority scope, and the unresolved seam. “Accepted” may need actor- or role-scoped
meaning rather than one global boolean.

### 12. Honest partial completion

The session budget ends with a useful root document and explicit unknowns. A
session type may permit a qualified terminal result rather than forcing either
false completeness or failure.

## Consolidated open questions

### Product and UI

1. What exact visual object represents root material before the first bind?
2. How are default-in left sources made inspectable without becoming a large form?
3. Does moving up select the immediate parent, root, or an ancestry chooser?
4. How does the UI distinguish an optional rightward exploration from a parent
   demand required for completion?
5. What compact language represents proposed, qualified, disputed, superseded,
   and accepted without badge overload?
6. At which moments should distinction threads become visible to the person?

### Runtime and data

7. What is the canonical semantic integration envelope for v1?
8. How are wound knot states rebuilt and verified after restart?
9. Are branch and ledger semantics sufficient for concurrent child binds, or is
   additional isolation required before more than one cascade is in flight?
10. Is aspect/facet a runtime schema field or only a compiler/provider index?
11. How are supersession and affected downstream values queried without mutating
    history?
12. Which semantic records belong in the wave log versus a referenced artifact or
    disposable projection index?

### API and membrane

13. Which gestures are committed commands and which are unlogged navigation?
14. Should plain signal, answer, and operator request remain one turn kind with
    deterministic interpretation, or should the ingress adapter publish dedicated
    derived facts for each?
15. What concurrency contract applies when source state changes between render and
    submission?
16. Which query/access events require audit logging in regulated session types?
17. How does a synchronous HTTP response represent unfinished quiescence without
    conflating processing, blocked, and completed?

### Governance and evolution

18. Who may attest an integration, admit topology, or override a gate in each
    session type?
19. Which keeper/context suggestions may be auto-admitted by policy?
20. What fixture, real-case, assessment, and review evidence is required before a
    topology proposal enters the operator catalogue?
21. How is learning telemetry minimised while still preserving useful semantic
    path residue?
22. What user test would falsify the claim that the four-direction workspace
    reduces cognitive load while preserving control?

