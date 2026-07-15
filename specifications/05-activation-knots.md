# Volume 05 — Activation Knots: the Accumulating Units

Status: CURRENT · Snapshot date: 2026-07-14 ·
Previous: [04-tuple-reference.md](./04-tuple-reference.md) ·
Next: [06-bind-descriptors.md](./06-bind-descriptors.md)

An activation knot is the machine's accumulator: it matches wave tuples, winds
them into wound state, and tests readiness. It *accumulates understanding*. Its
minimal form — a single condition matcher — is a degenerate configuration of the
same accumulator, never a different kind of unit. This volume specifies the knot
lifecycle, the two bundled strategies, the two winding policies, and the
registers each maintains.

## 1. Lifecycle

Every knot executor implements the lifecycle over `IKnotExecutor`
(Vol. 02 §2):

```text
          committed domain.fact
                  │
             matches(t)? ──no──► (ignored by this clew)
                  │yes
              wind(t) ──────────► emissions (winding intentions only, or none)
                  │
              test()? ──no──► (waits for more)
                  │yes
   topology commits sys.knot.ready {knotId, understanding()}   ← snapshot first
                  │
              reset()                                          ← policy applies
```

Normative rules:

1. `matches` MUST be a pure predicate over the tuple; it MUST NOT mutate state.
2. `wind` integrates the matched tuple into the clew's registers. It MAY return
   emissions, but only winding intentions bounded to the knot's own accumulation
   and correlated back to the knot (§5). It MUST NOT publish integrations for
   others or emit decisions.
3. `test` MUST be synchronous and read-only over wound state. While an
   integration is in flight, the knot is simply not ready.
4. `understanding()` MUST be a synchronous snapshot of the wound state — the
   value reified into `sys.knot.ready`.
5. `reset` clears the clew per its reset policy: `on_ready` (default) clears
   everything; `never` keeps wound state across readiness, allowing repeated
   readiness (the journal pattern).
6. Readiness is evaluated after every wind of the clew; the topology, not the
   knot, commits the readiness tuple (Vol. 02 §5).

## 2. Clews: instantiation and attribution by key

A knot **definition** (the registered record) is distinguished from its
**clews** (executor instances). The topology maintains one clew per
`(definition, key)` pair:

1. Registration eagerly constructs the null-key clew; construction failure is a
   registration defect (invalid configuration surfaces immediately).
2. A clew for key `k` is created lazily on the first `domain.fact` with
   `key = k` dispatched to the definition.
3. Clews never share registers: parallel keys wind independent understanding.
4. A clew's identity for correlation purposes is the knot id; uid sequences are
   per clew (`WIND.CTR` lives in the executor instance).

## 3. Collection rules (shared by both strategies)

The winding side of a knot configuration is a list of **collection rules**:

```ts
type CollectWhereClause = { field: string; equals?: unknown; not_equals?: unknown };
type SemanticCollectionRule = {
  as: string;                          // slot name in the clew
  match_type: string;                  // fact type to accept ('match' is the authoring alias)
  reduce: 'append' | 'latest' | 'overwrite';  // 'latest' ≡ 'overwrite' (keep most recent)
  field?: string;                      // payload data field to read; absent = whole data
  where?: readonly CollectWhereClause[];      // complementarity predicates
};
```

Matching (normative, shared function):

1. A rule accepts a fact iff `factType = match_type` **and** every `where`
   clause holds over `data`: `equals` requires strict equality of
   `data[field]`; `not_equals` requires strict inequality.
2. A knot matches a fact iff at least one rule accepts it (semantic knots
   additionally match their own correlated integration, §5.3).
3. A fact is wound once per accepting rule.
4. Delta extraction: with `field`, the delta is `data[field]` (for the semantic
   knot: if it is not a string, the whole `data` is serialised as JSON instead);
   without `field`, the whole `data`.
5. Reduction: `append` accumulates a sequence; `latest`/`overwrite` keeps only
   the newest value in the slot.

`where` clauses are the **canvas subscription** mechanism: they let one clew
collect only complementary tuples (for example, siblings' integrations on a
particular `lane`) — see §7 and Vol. 10 §4.

## 4. The deterministic strategy

Status: CURRENT. The degenerate clew that winds locally and projects nothing.

Configuration:

```ts
type DeterministicKnotConfig = {
  wind: { collect: readonly SemanticCollectionRule[]; reset?: 'on_ready' | 'never' };
  condition: string;   // null-guard conjunction over slot names
};
```

Semantics:

1. Winding stores collected values into `COLLECTED[as]` per rule (§3); no
   emissions ever.
2. The condition language at this stage is the closed subset
   `name != null` / `name == null` joined by `&&`, where every `name` is a
   declared slot. Parsers MUST reject anything richer explicitly — richer
   conditions are an extension rail (Vol. 11 §4.5).
3. `test()` evaluates the parsed conjunction against the slots; `understanding()`
   is the record of collected slots.
4. Duplicate `as` names across a deterministic knot's rules are an authoring
   error (the slots would alias).

Deterministic knots are the machine's gates and rendezvous latches: "wait until
these named things exist" (Vol. 10 §2).

## 5. The semantic strategy

Status: CURRENT. The accumulator whose integration is semantic. Configuration:

```ts
type SemanticKnotConfig = {
  wind: {
    collect: readonly SemanticCollectionRule[];
    integrate?: 'local' | 'through_world';   // default: local
    reset?: 'on_ready' | 'never';            // default: on_ready
    lane?: string;                            // canvas mark echoed by controllers
    budget?: number;                          // max winding intentions per clew
  };
  condition: {
    evaluate_understanding: boolean;          // false disables readiness entirely
    questions: readonly string[];             // the knot's angle of perception
    threshold_grade: number;                  // readiness threshold over GRADE
  };
};
```

`test()` is `evaluate_understanding && GRADE ≥ threshold_grade`;
`understanding()` is `{ state: STATE, grade: GRADE }`.

### 5.1 Local winding (`integrate: local`)

Each accepted delta is stored into `SLOTS` per rule, and the clew's injected
**local integrator** — a function `(deltas) → {state, grade}` supplied by the
strategy registry, not chosen by the knot — recomputes `STATE`/`GRADE` from all
collected values. No emissions. A deterministic machine uses a pure function
here; the reference bundles a demonstration heuristic (refimpl 05 §6).

### 5.2 Winding through the world (`integrate: through_world`)

Semantic growth cannot complete locally: integrating a delta into wound
understanding is an inference. Winding therefore unfolds as a two-tact cascade
through the world; the knot gains a projecting face bounded to its own
metabolism.

**Tact one — accept and project.** On accepted deltas:

1. push each delta (labelled per §5.4) into `DELTAQ`;
2. if `INFLIGHT.UID ≠ null` → return no emissions (at most one intention in
   flight per clew);
3. if `budget` is declared and `WIND.CTR ≥ budget` → return no emissions (the
   resonance damper: queued deltas stay unwound; the wave settles unfinished
   and the stall is visible on the log);
4. otherwise: `WIND.CTR += 1`; `uid ← "<knotId>#<WIND.CTR>"`; move the whole
   `DELTAQ` into the intention; set `INFLIGHT.UID ← uid`; emit one
   `inference.request` `{knotId, uid, questions, state: STATE, deltas, lane?}`
   on the clew's key (Vol. 04 §4.1).

**Tact two — wind the integration.** On a committed `inference.response` whose
`data.knotId` equals the knot id:

1. if `data.uid ≠ INFLIGHT.UID` → ignore (stale or foreign answer);
2. `STATE ← data.state`; `GRADE ← data.grade`; `INFLIGHT.UID ← null`;
3. if `DELTAQ` is non-empty, project the next intention per tact one (budget
   permitting).

Readiness then follows the ordinary lifecycle: `test()` reads the freshly wound
`GRADE`. Note the two-tact discipline preserves rule 3 of §1: between tacts the
clew is not ready.

### 5.3 Own-integration matching

A through-world clew's `matches` accepts, besides its collection rules, exactly
the facts `factType = 'inference.response' ∧ data.knotId = id`. Reasoning and
failure facts are NOT matched by the clew: a failure leaves `INFLIGHT.UID` set
and the clew stalls honestly (Vol. 04 §4.4) unless the topology collects the
failure deliberately.

### 5.4 Delta labelling on a canvas

With a single collection rule the delta stays raw. With several rules — a
**canvas** cell collecting from complementary sources — each delta is labelled
by its rule name: `"[<as>] <text>"`, so the integration sees where material came
from.

## 6. Budgets and stalling

The winding `budget` caps intentions per clew, bounding cost and divergence:

1. A clew whose budget is exhausted below its threshold leaves the wave
   **settled but unfinished** — never an exception, never a retry loop; the
   stall is visible on the log (queued deltas unwound, no readiness).
2. Budget accounting counts projections, including those answered by failure.
3. Extensions layering wider budgets (per-run, per-Cell) MUST keep this
   semantics: the first action over a hard ceiling is withheld and the state is
   reported honestly (Vol. 12 §8).

## 7. Lanes and the understanding canvas

A clew's `lane` mark is written into its winding intentions and echoed verbatim
by controllers into the answers (Vol. 04 §4). Complementary cells subscribe by
`where` clauses over `lane` (or any payload field), which composes into the
**understanding canvas**: several clews winding in parallel, cross-pollinating
through each other's committed integrations, each guarded by its own budget.
The construct-level treatment with a worked figure is Vol. 10 §4.

## 8. Strategy registry (extension point)

Strategies are resolved by name through a registry of factories:

```ts
type KnotFactory = (id: string, config: KnotConfig) => IKnotExecutor<AnyTuple>;
type KnotStrategyRegistry = ReadonlyMap<string, KnotFactory>;
```

1. The bundled names are `deterministic` and `semantic_evaluator`; an unknown
   name is a registration defect.
2. An implementation MAY install additional strategies (a rules engine, a
   vector accumulator, a human-answer latch) provided the executor honours §1
   and the station rules of Vol. 02 §3.
3. The registry is also the injection seam for the local integrator: the knot
   itself stays free of any concrete evaluator.
4. Authoring-format visibility of a custom strategy requires the compiler to
   accept its name and validate its config; unknown strategies in YAML are
   rejected explicitly (Vol. 09 §5).

## 9. Demonstration: minimal conforming deterministic knot

```ts
class GateKnot implements IKnotExecutor<AnyTuple> {
  readonly id: string;
  private slots = new Map<string, unknown>();
  constructor(id: string, private readonly rules: SemanticCollectionRule[],
              private readonly wants: (lookup: (n: string) => unknown) => boolean) {
    this.id = id;
  }
  matches(t: AnyTuple) {
    return t.kind === 'domain.fact' &&
      this.rules.some(r => ruleMatches(r, t.payload.factType, t.payload.data));
  }
  wind(t: AnyTuple) {
    if (t.kind !== 'domain.fact') return [];
    for (const r of this.rules)
      if (ruleMatches(r, t.payload.factType, t.payload.data))
        this.slots.set(r.as, r.field === undefined ? t.payload.data
                                                   : (t.payload.data as any)[r.field]);
    return [];
  }
  test() { return this.wants(n => this.slots.get(n)); }
  understanding() { return Object.fromEntries(this.slots); }
  reset() { this.slots = new Map(); }
}
```

Anything beyond this skeleton — projection, budgets, canvases — is additive
behaviour inside the same five-method lifecycle.
