# First-turn and append-log protocol

**Status:** Working architecture synthesis; tuple kind names are provisional

## Purpose

This document describes what Nest commits before the first visible bind and how a
single composer produces either a plain signal, a knot answer, or a configured
semantic-operator request. It preserves the invariant that every durable screen
state is derived from the append-only wave log while allowing a plain message to
remain intentionally inactive.

## Session preparation

Selecting a session petal chooses an immutable session definition: its result
contract, allowlisted operator templates, schemas, controller capabilities,
budgets, and presentation hints. The backend creates a retained `WaveSession` and
loads the declared topology through the normal Nest loader.

The session then commits a fact equivalent to:

```yaml
kind: learning.session.opened
key: session-42
payload:
  sessionType: scenario-authoring
  definitionVersion: scenario-authoring@1
  resultContract: learning-scenario@1
  actorId: user-7
```

The exact kind is not yet a runtime contract. The required semantics are session
identity, selected definition version, actor attribution, and result contract.
The UI may render a clean scene from this tuple and immutable package data. No LLM
call is required merely to open the session.

## One ingress record per user turn

The composer should submit one canonical ingress record, avoiding partial state
between a text message and its selected context:

```yaml
kind: learning.turn.submitted
key: session-42
payload:
  turnId: turn-1
  actorId: user-7
  text: "I want to form a short AML learning scenario for a PSP role."
  targetKnotId: null
  operator:
    id: null
    parameters: {}
  sourceRefs: []
  focusRef: root
```

`WaveSession` validates the payload, stamps authoritative session and actor
identity server-side, serialises ingress, and calls `settle` only after the prior
turn has completed or reached a waiting quiescence.

The turn is a fact about what the person submitted. Deterministic interpretation
may publish more specific facts, but it must not rewrite or replace this record.

## Interpretation precedence

The same text field has three semantic outcomes:

### 1. Target knot present: answer

If `targetKnotId` identifies the current human-answer obligation and no conflicting
operator context exists, the ingress adapter validates the answer contract and
commits an attributed, correlated fact equivalent to:

```yaml
kind: learning.answer.submitted
payload:
  turnId: turn-9
  targetKnotId: knot-17
  requestUid: answer-request-17
  answer: "The exercise is for first-line transaction monitoring analysts."
```

The target activation knot winds this fact. Semantic winding may itself project a
winding intention, but only after the answer has been committed.

### 2. Operator present: configured bind request

If an allowlisted operator is selected, the same turn contains its user parameter
and an exact source snapshot:

```yaml
kind: learning.turn.submitted
payload:
  turnId: turn-2
  text: "Separate the learning goal, role context, evidence, and completion test."
  targetKnotId: null
  operator:
    id: unfold
    parameters:
      depthBudget: 1
  sourceRefs:
    - value-4
    - value-7
  excludedSourceRefs:
    - value-5
  focusRef: root
```

A deterministic selection knot admits only an operator declared by the selected
session definition. It normalises the request into a fact such as
`learning.bind.selected` or `learning.bind.requested`, preserving the turn id,
operator version, user parameters, source refs, and focus ref.

In the initial implementation, “create a bind” means create a new invocation or
instance of a precompiled bind descriptor template. It does not mean that model
text becomes executable topology. A bounded operator such as `unfold` may emit
new knot records through a predeclared template, as allowed by the Nest Education
seed; their shapes, budgets, ids, and closing behaviour remain compiler-controlled.

### 3. Neither present: plain informational signal

If no knot target and no operator are selected, the committed turn remains a plain
signal. A deterministic adapter may also publish a narrow
`learning.signal.submitted` fact for easier matching, but no semantic operator is
activated merely because text exists.

No bind instance, knot definition, inference intention, or fabricated explanation
is required. The wave may settle immediately. This is successful quiescence, not
an error or a condition requiring diagnostic UI copy.

The signal remains addressable by offset or uid so a later operator can include it
explicitly in its source snapshot.

## From the first operator to the first visible scene

For an inference-backed `unfold` operator, the log may grow in this conceptual
order:

1. `learning.turn.submitted` — the user's text, operator selection, parameters,
   current focus, and explicit source snapshot.
2. `learning.bind.selected` — deterministic admission of the allowlisted operator
   template and creation of a bind instance identity.
3. One or more head or intention tuples — the angle of perception and bounded
   request the bind projects.
4. `service.requested` — a committed intention claimed exactly once by the
   Together AI output controller.
5. `service.answered` or equivalent ingress fact — the model response, request
   correlation, model identity, usage, and response digest.
6. Schema validation and bounded topology publications, for example declared
   `sys.knot.defined` records and `learning.knot.proposed` facts.
7. Runtime knot winding/readiness and bind attempt facts or trace records from
   which the first scene projection is derived.

The controller never writes directly into browser state. The browser receives an
SSE projection of committed tuples. A refresh or replay therefore reconstructs
the same bind heading, knots, branch relations, and waiting obligations.

## What the user sees

Before an operator is selected, the user sees their own root material and the
quiet action map. The interface does not annotate the text with phrases explaining
that it is unbound. Multiple plain turns may remain as sparse root material while
the user decides what to do.

After the first operator produces accepted knot publications, the centre shows:

```text
bind master: operator purpose expressed in the user's domain
    knot detail: one affinity ray or answer obligation
    knot detail: one affinity ray or answer obligation
    knot detail: one affinity ray or answer obligation
```

The bind heading is meaningful scene language, not a trace label. Beneath it, each
knot shows only the content and action needed now. A knot may accept a direct
answer or be marked for depth, in which case its child bind appears in the right
rail. Completed local integrations appear on the left only when they become stable
sources for later work.

## Required record properties

Every user turn and derived operator request must preserve:

- authoritative session and actor identity;
- one stable turn id and ordering offset;
- the exact submitted text or a content-addressed reference for large material;
- the focused knot, root, or bind at submission time;
- selected operator id and version, if any;
- user parameters and exact included/excluded source refs;
- causation and correlation ids for every external request and answer;
- model, prompt-template, schema, and policy versions for semantic computation;
- branch and ledger attribution for child depth;
- acceptance, exclusion, skip, unknown, and completion decisions as separate facts.

## Hard boundaries

- A plain signal is a committed fact, not an integration and not accepted
  knowledge.
- The append log stores bounded facts and references, not unrestricted files or
  mutable UI objects.
- An LLM response is untrusted data until schema and policy checks pass.
- Outbound inference is an intention committed before discharge; the answer
  returns through committed ingress with the same correlation identity.
- Source inclusion is frozen into the bind request. Later movement on the left
  cannot change an already running bind's affinity.
- Browser navigation never changes historical tuples; it commits a new user
  decision only when the semantic state changes.
- Quiescence, local bind completion, human acceptance, and session completion are
  separate states.

## Open protocol questions

1. Should a plain signal be represented only by `learning.turn.submitted`, or is a
   derived `learning.signal.submitted` fact useful enough to justify another kind?
2. What deterministic rule selects pre-bind signals for the first operator: all
   root signals, current focus, or explicit source refs generated by the shell?
3. Can one turn carry both `targetKnotId` and an operator? If yes, the precedence
   and resulting source relation must be explicit; if no, the server must reject
   the ambiguous payload.
4. Which trace facts already emitted by Nest are sufficient for the bind scene,
   and which product semantic facts must be added rather than inferred from trace?
5. How are large user attachments content-addressed, access-controlled, and
   represented without placing their bodies in the wave log?
6. What is the durable rehydration protocol for a retained session after process
   restart?

