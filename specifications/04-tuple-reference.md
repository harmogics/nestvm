# Volume 04 — Tuple Reference

Status: CURRENT · Snapshot date: 2026-07-14 ·
Previous: [03-wave-log.md](./03-wave-log.md) ·
Next: [05-activation-knots.md](./05-activation-knots.md)

This volume is the machine's instruction-set reference: the normative catalogue
of every tuple the current runtime commits or consumes, followed by the reserved
namespaces and the rules for defining new protocol families. Each entry gives
the payload contract, the producer, the consumers, and the correlation
discipline. Shapes are shown as reference TypeScript; field presence and meaning
are the normative content.

Conventions: all entries live on the envelope of Vol. 03 §1. Entries under §3–§5
are `domain.fact` tuples distinguished by `factType`. "Key" states the required
`key` value relative to the causing tuple.

## 1. Payload data conventions

1. `data` of a `domain.fact` is a JSON object (record). Open fact types
   (§3.1) impose no further structure; protocol fact types (§4, §5) impose the
   closed shapes below.
2. Unknown additional fields in protocol payloads SHOULD be preserved by readers
   and MUST NOT change meaning; producers MUST NOT emit conflicting duplicates
   of protocol fields.
3. Grades are finite numbers in `[0, 1]`; producers MUST clamp before emitting.

## 2. System tuples (topology protocol)

### 2.1 `sys.knot.defined`

Registers an activation knot. Key: `null`.

```ts
payload: {
  id: string;                                    // unique knot id in this machine
  strategy: 'deterministic' | 'semantic_evaluator'; // resolved via the strategy registry
  config: KnotConfig;                            // strategy-specific, Vol. 05 §3–4
  emittedBy?: string;                            // provenance stamp when sown by a delegated emit
}
```

- Producer: the loader (compiled pipeline seeds) or a delegated emit template.
- Consumer: the topology — registers the definition, eagerly builds the null-key
  clew as a configuration probe (invalid configuration fails at registration,
  not first use).
- An unknown `strategy` is a registration error (defect), not a silent skip.

### 2.2 `sys.descriptor.defined`

Registers a bind descriptor. Key: `null`. Exactly one of the two variants:

```ts
// emit descriptor
payload: { id: string; subscribesTo: string; actionConfig: { writes: string }; emittedBy?: string }
// operator bind
payload: { id: string; operator: OperatorBindConfig; emittedBy?: string }   // Vol. 06 §3
```

- Consumer: the topology — constructs the executor and indexes its interests:
  an emit descriptor under `subscribesTo`; an operator bind under its activation
  knot and every demand knot.

### 2.3 `sys.knot.ready`

Readiness reified. Key: the key of the completing fact.

```ts
payload: { knotId: string; understanding: unknown }
```

- Producer: the topology, when a clew's `test()` passes — snapshot taken
  **before** reset, committed **before** any descriptor runs.
- Consumer: the topology's activation dispatch; every descriptor registered
  under `knotId` executes with `{knotId, key, understanding}`.
- Under `reset: never` the same clew may reify readiness repeatedly; readers
  fold repetition at read time (Vol. 03 §8).

## 3. Open domain facts

### 3.1 Pipeline facts

```ts
payload: { factType: string; data: Readonly<Record<string, unknown>> }
```

Any fact type declared by an authoring pipeline: inputs (`inputs[].writes`),
emit-descriptor publications, operator delegated publications, head facts.
Structure is fixed, when needed, by declared JSON Schemas at authoring time
(Vol. 09 §7), not by the runtime.

Two conventional producer shapes exist today and are relied on by shells:

- **emit descriptor publication** — `data: { triggeredBy: [knotId],
  understanding }` (the activating knot's snapshot; never invented values);
- **operator delegated publication** (`emit: writes`) — `data: { bindId, uid,
  result }` where `result` is the schema-validated answer (§5.3).

### 3.2 `bind.rejected`

An operator bind's gate failure. Key: the activation key.

```ts
payload: { factType: 'bind.rejected'; data: { bindId: string; reason: string } }
```

Produced instead of a service intention when a gate fails at rendezvous
completion; the rendezvous latches as projected (one-shot, Vol. 06 §5).

## 4. The winding protocol (`inference.*`)

The two-tact protocol by which a semantic knot grows its own wound state through
the world (Vol. 05 §5). All four carry `knotId` + `uid` correlation; `lane` is
an optional mark echoed verbatim by the controller (canvas subscription,
Vol. 05 §7).

### 4.1 `inference.request` — winding intention

Key: the clew's key. Producer: semantic knot (`integrate: through_world`).
Claimed by: the inference controller.

```ts
data: {
  knotId: string;            // the projecting clew — answers route back to it
  uid: string;               // `<knotId>#<n>`
  questions: readonly string[]; // the knot's angle of perception
  state: string;             // previously integrated understanding ('' initially)
  deltas: readonly string[]; // new material to integrate
  lane?: string;
}
```

### 4.2 `inference.response` — the world's integration

Key: same as request. Producer: controller. Consumer: the projecting clew (winds
it as its second tact; ignores non-matching uid).

```ts
data: { knotId: string; uid: string; state: string; grade: number; lane?: string }
```

### 4.3 `inference.reasoning`

The model's reasoning behind one integration, same correlation; emitted when
non-empty. Consumer: none in the runtime (trace material; a journal knot may
collect it, Vol. 10 §5).

```ts
data: { knotId: string; uid: string; reasoning: string }
```

### 4.4 `inference.failed`

An expected external failure — transport error, HTTP error, timeout, unparsable
output — returned as a fact so the wave settles and the log records what the
world answered.

```ts
data: { knotId: string; uid: string; reason: string }
```

Note: a failure does **not** clear the clew's `INFLIGHT.UID`; the clew stays
awaiting its integration and the run surfaces the stall honestly (settled
unfinished) unless topology collects the failure deliberately. Terminality per
uid: exactly one of `inference.response` / `inference.failed` is the terminal
answer; `inference.reasoning` never terminates a uid.

## 5. The operator protocol (`service.*`)

The protocol by which an operator bind's judged scope crosses the membrane and
its result is published by proxy (Vol. 06 §6, Vol. 07 §4).

### 5.1 `service.request` — service intention

Key: the activation key. Producer: operator bind. Claimed by: the service
controller. The intention is **machine-complete**: everything needed to execute
and publish is inside it.

```ts
data: {
  bindId: string;
  uid: string;                       // `<bindId>#<n>`
  instruction: string;               // the operator instruction
  scope: Readonly<Record<string, unknown>>;  // the bound scope at projection
  schema?: JsonSchema;               // expected result contract (embedded, Vol. 09 §7)
  emit: EmitDeclaration;             // { writes } | { unfold } — fixed at projection
}
```

### 5.2 `service.reasoning`, `service.failed`

Mirror §4.3/§4.4 with `bindId` + `uid` correlation:

```ts
data: { bindId: string; uid: string; reasoning: string }   // service.reasoning
data: { bindId: string; uid: string; reason: string }      // service.failed
```

Terminality per uid: exactly one of the delegated publication (§5.3) /
`service.failed`; reasoning never terminates.

### 5.3 Delegated publication

Not a fixed fact type: the controller commits the validated answer **directly
under the intention's `emit` declaration**:

- `emit: { writes: T }` → one `domain.fact` of factType `T`, key preserved,
  `data: { bindId, uid, result }`;
- `emit: { unfold: template }` → an instantiated batch: sown `sys.knot.defined`
  records first, one closing `sys.descriptor.defined`, head facts last — each
  emission stamped `emittedBy: uid` (Vol. 06 §7).

The controller fills content and never alters form; schema validation precedes
publication, and a violation becomes `service.failed` instead.

## 6. Reserved namespaces

FactType namespaces are the machine's opcode map. Current reservations:

| Namespace | Status | Owner / purpose |
| --- | --- | --- |
| `sys.*` (envelope kinds) | CURRENT | topology protocol; new kinds only via core widening |
| `inference.*` | CURRENT | winding protocol (§4); minted by knots, answered by controllers |
| `service.*` | CURRENT | operator protocol (§5); minted by binds, answered by controllers |
| `bind.*` | CURRENT | bind verdict facts (`bind.rejected`) |
| `charter.*` | PROPOSED | Charter lifecycle (Vol. 12 §5.1) |
| `cell.*` | PROPOSED | Cell lifecycle (Vol. 12 §5.2–5.5) |
| `artefact.*`, `chat.*` | PROPOSED | artefact store, chat surface protocols (Vol. 12) |
| `experience.*`, `evidence.*`, `system.*` (fact types), `claim.*`, `description.*`, `pipeline.*`, `library.*` | SEED | CoAgnes experience protocols (Vol. 13 §3) |
| `learning.*` | SEED | Nest Education protocols (Vol. 13 §5) |

Rules:

1. Ordinary user/shell ingress MUST NOT be allowed to commit reserved-namespace
   facts; shells accept only declared input fact forms (a normative security
   rule the Cell extension restates, Vol. 12 §10).
2. A pipeline MAY read protocol facts (e.g. a journal knot collecting
   `inference.reasoning`) but MUST NOT forge them: producer classes per
   namespace are fixed by this volume and Vol. 12 §9's producer matrix.
3. New protocol families are introduced as `domain.fact` namespaces with closed
   payload shapes, a correlation identity where asynchronous, an explicit
   producer class, and a collision review against this table — never as new
   envelope kinds unless the core is deliberately widened (Vol. 11 §2).

## 7. Quick reference card

```text
kind                    factType               producer            terminal answer for uid
────────────────────────────────────────────────────────────────────────────────────────────
sys.knot.defined            —                  loader / unfold             —
sys.descriptor.defined      —                  loader / unfold             —
sys.knot.ready              —                  topology                    —
domain.fact             <declared input>       shell ingress               —
domain.fact             <emit writes>          emit descriptor             —
domain.fact             bind.rejected          operator bind               —
domain.fact             inference.request      semantic knot          response | failed
domain.fact             inference.response     controller             (terminal)
domain.fact             inference.reasoning    controller                  —
domain.fact             inference.failed       controller             (terminal)
domain.fact             service.request        operator bind          delegated pub | failed
domain.fact             <delegated writes>     controller (proxy)     (terminal)
sys.* / domain.fact     <unfold batch>         controller (proxy)     (terminal)
domain.fact             service.reasoning      controller                  —
domain.fact             service.failed         controller             (terminal)
```
