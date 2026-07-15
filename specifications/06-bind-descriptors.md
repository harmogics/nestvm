# Volume 06 — Bind Descriptors: Gather, Judge, Publish

Status: CURRENT · Snapshot date: 2026-07-14 ·
Previous: [05-activation-knots.md](./05-activation-knots.md) ·
Next: [07-membrane-and-controllers.md](./07-membrane-and-controllers.md)

A bind descriptor is a **bind**: woken by an activation knot's readiness, it
gathers named understandings from the space, judges them in that bound scope,
runs a service, and publishes an integration. It never returns a value privately
— publication is the composition mechanism. This volume specifies the two
descriptor forms of the current machine (emit descriptor, operator bind), the
rendezvous algorithm, gates, service intentions, and the two delegated emit
declarations including the topology-sowing template.

## 1. The bind as a form

Conceptually every bind is the same scoped expression:

```text
bind {
  <name₀> ← ⟨activation: knot A⟩
  <name₁> ← ⟨demand:     knot D₁⟩
  …
} at barrier(all)
in if gates(name₀ … nameₙ)
   then emit    = service(name₀ … nameₙ)      — the integration, published
   else reject                                  — the verdict, published
```

Understanding enters a bind through exactly two channels: the **activation**
(the one knot whose readiness wakes it) and the **demands** (named bindings to
knots whose integrations it gathers). The **barrier** is the rendezvous at which
the bound names become simultaneously available; **gates** are predicates over
the bound scope; the **service** is the function evaluated over the scope; the
current barrier policy is `all`.

## 2. Emit descriptor (`action: emit`)

Status: CURRENT. The minimal bind: one activation, no demands, no gates; its
service is the identity over the activation understanding.

Registration payload: `{id, subscribesTo, actionConfig: {writes}}`
(Vol. 04 §2.2). Execution:

1. On activation `{knotId, key, understanding}` emit exactly one fact of the
   declared type on the same key:
   `{factType: writes, data: {triggeredBy: [knotId], understanding}}`.
2. The payload MUST be truthful — the activating knot's snapshot, never invented
   values.
3. Emit descriptors are not one-shot: every readiness of the subscribed knot
   produces a publication (pair with knot reset policy deliberately).

Limitation fixed by the current stage: emit-descriptor output carries
`triggeredBy` but no bind-level uid; it is therefore not accepted where
publication provenance is required (a rule the Cell extension states for
results, Vol. 12 §5.3).

## 3. Operator bind (`action: operator`)

Status: CURRENT. The full bind: activation + demands + gates + service crossing
the membrane. Configuration (carried in the registration record and echoed into
every intention):

```ts
type OperatorBindConfig = {
  on?: string;             // activation knot id; absent = demands-only bind
  on_as?: string;          // scope name of the activation entry (default 'activation')
  demands: readonly { as: string; knot: string }[];
  gates?: readonly { scope: string; min_grade: number }[];
  service: {
    instruction: string;   // the operator instruction
    schema?: JsonSchema;   // embedded result contract (required for unfold)
    emit: { writes: string } | { unfold: UnfoldEmitTemplate };
  };
};
```

Interests: the bind registers under its activation knot and under every demand
knot — it is woken by each of those readiness tuples. `subscribesTo` (the
executor's nominal subscription) is `on`, else the first demand's knot, else the
bind's own id.

## 4. Rendezvous algorithm

One rendezvous state per key lane (registers of Vol. 02 §4.5). On each
activation `{knotId, key, understanding}`:

```text
 1  S ← RDV[key]            (create: ACTIVATED = (on undeclared), SCOPE = ∅, PROJECTED = false)
 2  if knotId = on:            S.ACTIVATED ← true;  S.SCOPE[on_as ?? 'activation'] ← understanding
 3  if ∃ demand d: d.knot = knotId:                 S.SCOPE[d.as] ← understanding   (latch/refresh)
 4  if S.PROJECTED ∨ ¬S.ACTIVATED:                  return []
 5  if ∃ demand d: d.as ∉ S.SCOPE:                  return []          (barrier 'all' not met)
 6  S.PROJECTED ← true;  scope ← snapshot(S.SCOPE)
 7  for each gate g in declared order:
        grade ← scope[g.scope].grade
        if grade is not a number ∨ grade < g.min_grade:
            return [ bind.rejected {bindId, reason} ]                  (first failure wins)
 8  INTENT.CTR += 1;  uid ← "<bindId>#<INTENT.CTR>"
 9  return [ service.request {bindId, uid, instruction, scope, schema?, emit} ]
```

Normative points:

1. **Latching barrier.** A later readiness of the same demand refreshes its
   scope entry until projection; the scope snapshot at step 6 is what gates and
   the service see. The barrier is met by presence of all demand names, not by
   simultaneity.
2. **One-shot per key.** `PROJECTED` latches on both outcomes (intention or
   rejection). The rendezvous never reopens in the current machine; revision
   patterns create fresh binds instead (Vol. 12 §6, blind spot §11.4 of the
   design proposal). Repeated readiness after projection is absorbed silently.
3. **Gate semantics.** A gate reads the top-level `grade` field of the named
   scope entry — the convention that knot understandings expose their
   sufficiency as `grade` (deterministic understandings without one simply fail
   a gate). Richer gate expressions are an extension rail (Vol. 11 §4.5).
4. **Machine-completeness.** The projected intention carries scope, instruction,
   schema, and emit declaration in full: the bind is complete at projection, and
   completion is the controller's commit. Nothing about the bind needs to be
   consulted afterwards.
5. A demands-only bind (`on` absent) is activated from creation and projects as
   soon as all demands are bound; an activation-only bind (`demands: []`)
   projects on activation immediately.

## 5. Judgement and rejection

Gate failure publishes `bind.rejected {bindId, reason}` on the activation key
(Vol. 04 §3.2), carrying the first failing gate's reason. Rejection is a
published verdict — visible, bindable (a guard or journal may collect it) — and
terminal for that rendezvous. There is no retry at this station.

## 6. Delegated emit: `writes`

The simple declaration `emit: { writes: T }` instructs the discharging
controller to publish the validated result as one fact of type `T`, key
preserved, `data: {bindId, uid, result}` (Vol. 04 §5.3). Publication by proxy
keeps the station rules intact: the bind judged and projected; the controller
merely commits under the declared form.

## 7. Delegated emit: `unfold` — sowing topology

Status: CURRENT. The constrained in-wave authoring form: a service result
instantiates new topology from a **declared template**. The model (or other
oracle) supplies only the items; the pipeline fixed the record shapes, ids,
schemas, and closing form at authoring time.

```ts
type UnfoldEmitTemplate = {
  for_each: string;                       // answer field holding the items array
  knot: { id: string; strategy: 'semantic_evaluator'; config: Record<string, unknown> };
  head: { writes: string; data: Record<string, unknown> };
  close: {
    id: string;
    demands_from_items: { as: string; knot: string };  // both contain {index}
    gates?: readonly OperatorGate[];
    service: OperatorServiceConfig;                    // emit must be 'writes'
  };
};
```

Instantiation algorithm (controller-side, after schema validation):

```text
 1  items ← result[for_each];  if not a non-empty array → service.failed
 2  contexts ← [{index: i+1, item: items[i], scope} for i in 0..|items|-1]
 3  emissions ← for each context: sys.knot.defined
        {payload: substitute(knot, ctx) + emittedBy: uid, key: null}
 4  emissions += one sys.descriptor.defined
        {id: close.id,
         operator: {demands: [substitute(demands_from_items, ctx) for each ctx],
                    gates?, service: close.service},
         emittedBy: uid, key: null}
 5  emissions += for each context: domain.fact
        {factType: head.writes, key: intention key,
         data: substitute(head.data, ctx) + emittedBy: uid}
 6  return emissions in exactly this order: knots, close, heads
```

Normative points:

1. **Order is load-bearing**: knot records first, the closing bind once, head
   facts last — registration always precedes the facts that reach it
   (Vol. 02 §5.1).
2. **Placeholders.** `{index}` (one-based), `{item.path…}`, `{scope.path…}`.
   A string that is exactly one placeholder keeps the resolved raw type;
   embedded placeholders stringify (non-strings as JSON). A placeholder
   resolving to nothing aborts instantiation (→ `service.failed`).
3. **Static coherence** is checked at compile time: every `{item.*}` path must
   exist in the declared items schema; every `{scope.*}` must name a bound
   scope entry; knot and demand templates must contain `{index}`; the closing
   service's emit must be a simple `writes` (no recursive unfold at this stage);
   an unfold requires the service schema (Vol. 09 §5).
4. **Provenance.** Every emission carries `emittedBy` = the sowing intention's
   uid. The topology ignores the stamp; trace derivations and the proposed Cell
   ownership rules rely on it (Vol. 12 §4).
5. **Termination.** The fan-out is bounded by the schema (`maxItems` where
   declared); extensions performing admission MUST bound worst-case fan-out
   statically rather than trusting one answer (Vol. 12 §6, check 13).

The canonical figure produced by an unfold — question cells + closing harvest
bind + head facts seeding each cell — is treated as a construct in Vol. 10 §6.

## 8. Third emit form (PROPOSED)

The Cell extension adds `emit: { cell: CellEmitDeclaration }` as a third,
mutually exclusive variant: the validated result is treated as a CellBlueprint
and wrapped, together with parent-owned Charter/policy/context, into a
`cell.seed` (Vol. 12 §3). Binds and this volume's rendezvous algorithm are
unchanged by it — the declaration passes through the intention like any other
emit form, which is precisely why the extension can live on these rails.

## 9. Demonstration: the reference operator bind (abridged)

```ts
class OperatorBind implements IDescriptorExecutor<AnyEmission> {
  readonly id: string; readonly subscribesTo: string;
  private readonly states = new Map<string | null, RendezvousState>();
  private intentionCounter = 0;

  execute(a: DescriptorActivation): readonly AnyEmission[] {
    const s = this.stateFor(a.key);
    if (this.config.on === a.knotId) {
      s.activated = true;
      s.scope.set(this.config.on_as ?? 'activation', a.understanding);
    }
    const d = this.config.demands.find(d => d.knot === a.knotId);
    if (d) s.scope.set(d.as, a.understanding);              // latch / refresh
    if (s.projected || !s.activated) return [];
    if (this.config.demands.some(d => !s.scope.has(d.as))) return [];
    s.projected = true;
    const scope = Object.fromEntries(s.scope);
    const rejection = this.judge(scope);                     // first failing gate
    if (rejection !== null)
      return [fact('bind.rejected', a.key, { bindId: this.id, reason: rejection })];
    const uid = `${this.id}#${++this.intentionCounter}`;
    return [fact('service.request', a.key,
      { bindId: this.id, uid, instruction: this.config.service.instruction,
        scope, ...(this.config.service.schema && { schema: this.config.service.schema }),
        emit: this.config.service.emit })];
  }
}
```
