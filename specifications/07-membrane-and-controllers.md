# Volume 07 — The Membrane and Output Controllers

Status: CURRENT · Snapshot date: 2026-07-14 ·
Previous: [06-bind-descriptors.md](./06-bind-descriptors.md) ·
Next: [08-virtual-machine.md](./08-virtual-machine.md)

The membrane is the boundary where the wave meets the world: **output
controllers** face outward, claiming committed tuples and discharging them to
external systems; **ingress** faces inward, committing external events as fact
tuples. Nothing reaches the world that was not first a committed fact, and
nothing external enters except as a committed fact. This volume specifies the
sweep algorithm, the controller contract, the reference inference controller's
protocol behaviour, controller configuration records, and the failure
discipline.

## 1. One publication, two receptions

A committed tuple is received twice over: inward by knots that wind it, outward
by controllers that claim it. The two receptions are not exclusive — one tuple
may both wind a knot and leave through a controller. Which kinds flow where is
declared by the topology and the installed claims, like every other binding. The
membrane is therefore a **second reading of the one truth, never a second
truth**.

## 2. The controller contract

```ts
interface IOutputController<T extends WaveTuple> {
  readonly id: string;
  claims(tuple: T): boolean;                                 // synchronous predicate
  discharge(tuple: T): Promise<readonly WaveEmission<T>[]>;  // the only async seam
}
```

1. `claims` MUST be a pure, fast predicate (typically over kind and factType).
2. `discharge` performs the external effect and resolves with the world's
   answers as emissions. It is the **only** asynchronous point of the machine.
3. A controller MUST neither judge nor integrate: it converts an intention into
   an effect and the effect's answer into correlated facts. Semantic content
   originates in the world or in the intention, never in the controller.
4. **Expected external failures** — transport errors, HTTP errors, timeouts,
   unparsable or schema-violating output — MUST resolve as failure facts
   (`inference.failed` / `service.failed`), so the wave settles and the log
   records what the world answered.
5. **A rejected promise is a defect** — reserved for configuration and
   programming errors (a missing API key is the canonical example). A defect
   fails the settle; it is not converted into a fact.
6. Controllers are installed statically at assembly. No committed fact may
   install, enable, disable, or re-credential a controller (the control-plane
   rule, restated in Vol. 12 §9–10).

## 3. The sweep algorithm

The membrane owns its own cursor over the same log (register
`MEMBRANE.CURSOR`, Vol. 02 §4.6):

```text
sweep(log):
  discharges ← []
  while MEMBRANE.CURSOR < |log|:
      t ← log[MEMBRANE.CURSOR++]
      for each controller c:
          if c.claims(t): discharges += c.discharge(t)   // started, not awaited
  return discharges
```

1. The cursor advances exactly once per offset: a committed tuple is swept once
   per runtime, so an intention is **discharged at most once**. There is no
   redelivery, no acknowledgement, no retry at this layer; retry, where wanted,
   is topology (a new intention).
2. Controllers receive tuples outside the propagation cycle: sweeping happens
   between engine runs (Vol. 08 §3), never inside `apply`.
3. Several controllers MAY claim one tuple; each discharges independently.
   Implementations SHOULD keep service-protocol claims exclusive by
   configuration review — overlapping claims on `service.request` would
   double-publish under one declaration (recorded hold, Vol. 11 §6).

## 4. The reference service/inference controller

The reference controller claims both intention kinds of Vol. 04 and demonstrates
the normative discharge behaviour for each. Any conforming controller for these
protocols — LLM-backed, deterministic function host, rule engine, human-task
queue — MUST honour the same observable contract.

### 4.1 Winding discharge (`inference.request`)

1. Compose the integration task from the intention: questions (the angle),
   state (possibly empty), deltas.
2. Obtain an integration `{state, grade}` from the world. Grade MUST be clamped
   to `[0, 1]`; an unparsable answer is an expected failure.
3. Resolve with `inference.response {knotId, uid, state, grade, lane?}` — `lane`
   echoed verbatim from the request — plus `inference.reasoning {knotId, uid,
   reasoning}` when the world supplied non-empty reasoning.
4. On expected failure resolve with `inference.failed {knotId, uid, reason}`.

The reference implementation fixes the semantic task in a system prompt —
"rewrite STATE into one updated, self-contained integrated understanding that
absorbs the DELTAS and addresses the QUESTIONS; assess with a grade in [0,1]" —
and requires a single JSON object `{"state", "grade"}` in reply. The prompt
wording is implementation detail; the *task semantics* (absorb deltas, address
questions, self-contained state, honest grade) are the portable contract of the
winding protocol.

### 4.2 Service discharge (`service.request`)

1. Compose the operator task: instruction + bound scope (+ declared schema).
2. Obtain a single JSON object as the result.
3. If a schema is declared, validate the result against it (Vol. 09 §7); a
   violation is an expected failure (`service.failed`), never a partial
   publication.
4. Publish under the intention's emit declaration — **publication by proxy**:
   - `writes`: one fact `{bindId, uid, result}` of the declared type;
   - `unfold`: the instantiated batch of Vol. 06 §7 (knots, close, heads, each
     stamped `emittedBy: uid`). An instantiation error (missing placeholder,
     empty items) is an expected failure.
5. Add `service.reasoning` when non-empty reasoning was supplied.
6. On expected failure resolve with `service.failed {bindId, uid, reason}`.

The controller fills content and never alters form: the declaration fixed at
projection is executed verbatim. Deterministic machines implement §4.2 by
dispatching `instruction` to a registered function over `scope` — the
declaration-level contract is identical.

### 4.3 Budgets

The reference controller enforces two budgets per completion from its
configuration record: `max_tokens` and `timeout_ms` (abort → expected timeout
failure). Declared-but-unenforced budget fields (`max_in_flight`, `retries`)
remain configuration surface (DECLARED) — an implementation MAY enforce them,
MUST NOT reinterpret them.

## 5. Controller configuration records

Controllers are configured by YAML records — inspectable manifests kept beside
the pipelines (reference layout: refimpl 00 §4); the live record is read at
wiring time (refimpl 05 §4):

```yaml
id: controller.inference.together
kind: output.controller
claims:
  - match_type: inference.request        # the claim predicate, declaratively
correlation:
  field: uid                             # payload field joining intention and answers
answers:
  - type: inference.response
  - type: inference.reasoning
  - type: inference.failed
model:                                   # controller-specific block
  provider: together
  name: zai-org/GLM-5.2
  base_url: https://api.together.ai/v1
  reasoning_effort: high
budget:
  max_tokens: 16384                      # enforced per completion
  timeout_ms: 180000                     # enforced
  max_in_flight: 4                       # declared; not yet enforced
  retries: 0                             # declared; not yet enforced
```

1. The record declares claims, correlation field, answer types, and budgets —
   the inspectable manifest of the controller's protocol surface.
2. **Secrets never live in records or the log**: credentials resolve from the
   environment (or an ignored local file) at assembly. A missing credential is
   a configuration defect at discharge (§2.5), so a misconfigured machine fails
   the settle loudly instead of stalling silently.
3. Extensions introducing new controllers MUST ship such a record; claim-overlap
   review over these manifests is the intended exclusivity mechanism
   (Vol. 11 §6).

## 6. Ingress

Ingress is the inward half of the membrane: shells commit external events —
user messages, declared inputs, review decisions, delivery receipts — as fact
tuples through the runtime's seed path (Vol. 08 §3).

1. Shells MUST commit only declared input fact forms and MUST NOT accept
   reserved-namespace fact types from external callers (Vol. 04 §6).
2. Ingress assigns the attribution key server-side/shell-side; external callers
   do not choose arbitrary lanes.
3. The world's answers to intentions are not shell ingress: they re-enter
   through the discharge path with their correlation identities.

## 7. Failure discipline summary

| Condition | Manifestation | Effect on the run |
| --- | --- | --- |
| expected external failure | `inference.failed` / `service.failed` fact | wave continues; may settle unfinished; visible on log |
| schema-violating world answer | `service.failed` fact | same as above; nothing partial is published |
| unparsable world answer | failure fact with excerpt | same |
| configuration/programming defect | rejected discharge promise | settle fails; shell reports non-zero / `defect` status |
| budget stop (knot winding) | no emission; queued deltas remain | settled unfinished; stall visible |
