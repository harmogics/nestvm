# refimpl 04 — Descriptor Executors

Status: CURRENT · Specifies against Vol. 06 ·
Previous: [03-knots.md](./03-knots.md) ·
Next: [05-membrane-and-controllers.md](./05-membrane-and-controllers.md)

## 1. `ActionDescriptor` (emit descriptor)

Constructor `(id, subscribesTo, writes)`. `execute(activation)` returns
exactly one emission:

```ts
{ kind: 'domain.fact', key: activation.key,
  payload: { factType: writes,
             data: { triggeredBy: [activation.knotId],
                     understanding: activation.understanding } } }
```

No state, no latch: every readiness of the subscribed knot publishes again.
The payload is deliberately truthful — the snapshot, never invented values.

## 2. `OperatorBind`

Constructor `(id, config: OperatorBindConfig)`. Derived subscription:
`subscribesTo = config.on ?? config.demands[0]?.knot ?? id`. State:

```ts
states: Map<string | null, { activated: boolean;
                             scope: Map<string, unknown>;
                             projected: boolean }>
intentionCounter: number        // never reset — uids unique per instance
```

`interests()` returns the de-duplicated set of every demand's knot plus `on`
when declared — the ids the topology indexes the bind under.

### 2.1 `execute` — the rendezvous

Implements Vol. 06 §4 exactly:

1. `stateFor(key)` lazily creates the lane with
   `activated = (config.on === undefined)`.
2. If the activating knot is `on`: set `activated`, bind the understanding
   under `on_as ?? 'activation'`.
3. If the activating knot matches a demand: bind under `demand.as`
   (latch/refresh — a later readiness of the same demand overwrites until
   projection).
4. Return `[]` if already `projected` or not yet `activated`, or if any
   declared demand name is still absent from the scope.
5. Latch `projected = true`; snapshot the scope into a plain record.
6. Judge: for each gate in declared order read
   `(scope[gate.scope] as {grade?}).grade`; if it is not a number or is below
   `min_grade`, return one `bind.rejected` fact on the activation key with
   reason `gate '<scope>': grade <value> below <min>` (first failure wins —
   the value is rendered via `String(...)`, so a missing grade reads
   `undefined`).
7. Otherwise increment the counter and return one `service.request` fact:
   `{ bindId, uid: `${id}#${counter}`, instruction, scope, schema?
   (included only when the config declares one), emit }` — the
   machine-complete intention.

### 2.2 Behavioural notes

- One rendezvous per key lane; the `projected` latch never reopens (recorded
  limitation, Vol. 11 §6.5).
- A demands-only bind (no `on`) starts activated and projects when the last
  demand binds; an activation-only bind projects immediately on activation.
- Repeated readiness after projection is absorbed silently (`[]`).
- The bind copies its declared emit into the intention verbatim; it neither
  interprets nor validates it — that is the controller's and the compiler's
  work respectively.

**Liberty:** the two executor classes may be any code organisation (the
topology only sees the executor interface). Not liberty: uid format, latch
semantics, gate reason text intent (naming the failing scope, the value, and
the threshold), scope snapshot timing, inclusion rule for `schema`.
