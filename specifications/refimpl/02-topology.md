# refimpl 02 — Topology: Registration, Clews, Dispatch

Status: CURRENT · Specifies against Vol. 02 §5, Vol. 05 §2/§8 ·
Previous: [01-kernel.md](./01-kernel.md) · Next: [03-knots.md](./03-knots.md)

`TopologyGraph` is the one behavioural processor of the standard assembly. It
materialises registrations from the log and dispatches facts to clews and
readiness to descriptors. It holds no business logic of its own.

## 1. State

```ts
knotDefinitions: Map<string, { id, factory, config }>   // KNOT.DEFS
clews:           Map<string, Map<string | null, IKnotExecutor>>  // CLEWS
descriptors:     Map<string, IDescriptorExecutor>       // BIND.DEFS
dispatchTable:   Map<string, IDescriptorExecutor[]>     // DISPATCH (by knot id)
```

The constructor takes a strategy registry, defaulting to the bundled one (§4).

## 2. `apply` — kind dispatch

Four-way switch on `tuple.kind`, exactly Vol. 02 §5:
`sys.knot.defined` → register knot, return `[]`; `sys.descriptor.defined` →
register descriptor, return `[]`; `sys.knot.ready` → descriptor dispatch;
`domain.fact` → knot dispatch.

## 3. Registration semantics

**Knot.** Resolve the factory by `payload.strategy`; an unknown strategy
throws (`Unknown strategy: <name>`) — a defect, not a skip. Build one probe
executor eagerly: invalid configuration therefore fails at registration, not
first use. Store the definition and set the clew bank to a fresh
`Map([[null, probe]])`. Consequence a port must keep: **re-registration of an
id replaces the definition and discards its accumulated clews** (the probe
becomes the new null-key clew).

**Descriptor.** If `payload.operator` is present, construct the operator bind
and register it in `dispatchTable` under **every** id in its `interests()`
(activation plus demands). Otherwise require `subscribesTo` and
`actionConfig` (else throw a defect naming the id) and register an emit
descriptor under its one subscription. Multiple descriptors may subscribe to
one knot; they execute in registration order.

## 4. Default strategy registry

```ts
type KnotFactory = (id, config) => IKnotExecutor;
type KnotStrategyRegistry = ReadonlyMap<string, KnotFactory>;
```

Two entries:

- `semantic_evaluator` — rejects a string condition with a defect
  (`… requires a structured condition`), constructs `SemanticKnot` with the
  injected **local integrator**: join the collected values with a single
  space and grade them with the demonstration heuristic (chapter 05 §6). The
  integrator is injected here precisely so the knot stays free of any concrete
  evaluator — the seam a deterministic-class machine swaps.
- `deterministic` — rejects a non-string condition, constructs
  `DeterministicKnot`.

**Liberty:** additional strategies; a different bundled integrator (this
changes the machine's log content — deterministic-class fixtures are defined
per integrator); registry construction style.

## 5. Clew instantiation (`clewFor`)

Lazy per key: look up the definition's lane map, create the executor via the
factory on first sight of a key, memoise. The null-key probe doubles as the
clew for `key: null` facts.

## 6. Knot dispatch (`dispatchToKnots`)

For each definition in registration order: `clew = clewFor(def, tuple.key)`;
if `clew.matches(tuple)` — append `clew.wind(tuple)` emissions; then if
`clew.test()` — append the readiness emission and reset:

```ts
{ kind: 'sys.knot.ready', key: tuple.key,
  payload: { knotId: def.id, understanding: clew.understanding() } }
clew.reset()   // the executor applies its own reset policy
```

Order inside one fact's dispatch: a knot's winding emissions precede its
readiness emission; definitions contribute in registration order; everything
is returned as one batch (contiguous append, chapter 01 §3.1).

**Liberty:** replacing the linear scan with an index by `match_type` — only
if emission order (registration order of accepting knots) is preserved.

## 7. Descriptor dispatch (`dispatchToDescriptors`)

Build the activation `{knotId: payload.knotId, key: tuple.key, understanding:
payload.understanding}` and flat-map `execute` over
`dispatchTable[knotId] ?? []` in registration order.

Note the loop closure: readiness reaches descriptors only as a committed
tuple — dispatch happens when the engine processes `sys.knot.ready`, one
offset after the fact that completed the clew. The log always records the
full activation chain.
