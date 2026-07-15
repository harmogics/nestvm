# Volume 02 — Machine Model and the Architectural Register File

Status: CURRENT · Snapshot date: 2026-07-14 ·
Previous: [01-overview.md](./01-overview.md) ·
Next: [03-wave-log.md](./03-wave-log.md)

This volume defines the execution environment of the Nest runtime: its memory
model, its core contracts, its stations, and the complete architectural state — 
the register file — a conforming implementation must maintain. Everything here is
language-neutral; the TypeScript shapes shown are the reference encoding.

## 1. Execution environment

A Nest machine instance consists of:

1. one **wave log** — the ordered, append-only sequence of committed tuples
   (Vol. 03);
2. an ordered list of **wave processors** — units that receive every committed
   tuple exactly once, in log order, and may return follow-up emissions;
3. a **membrane** — an independent reader of the same log that dispatches
   claimed tuples to **output controllers** (Vol. 07);
4. a **runtime loop** that alternates propagation with membrane discharges until
   the machine settles (Vol. 08).

The standard assembly registers exactly one behavioural processor — the
**topology** — plus any number of passive observers. The topology materialises
knot and descriptor records from the log and dispatches facts and readiness to
them. Nothing in the core knows what a knot or a bind is; the topology is itself
a pluggable processor (a fact the Cell extension exploits, Vol. 12 §4).

```text
                 ┌────────────────────────────────────────────┐
   seeds ──────► │  WAVE ENGINE                               │
                 │  log[  t0 t1 t2 t3 t4 … ]  ◄─ append only  │
                 │        ▲                                   │
                 │        │ ENGINE.CURSOR (propagation)       │
                 │        ▼                                   │
                 │  processors: [ TOPOLOGY, observers… ]      │
                 └───────┬────────────────────────────────────┘
                         │ committed log (read-only view)
                 ┌───────▼───────────────────────────────────┐
                 │  MEMBRANE   MEMBRANE.CURSOR (sweep)        │
                 │  controllers: claims → discharge (async)   │
                 └───────┬───────────────────────────────────┘
                         │ world answers as emissions
                         └───────────► back to seeds of the next tact
```

## 2. Core contracts

The invariant core is three interfaces and one envelope. A conforming
implementation MUST provide semantically identical contracts, whatever the host
language's idiom.

```ts
// The machine word (Vol. 03).
type WaveTuple<K extends string = string, P = unknown> = Readonly<{
  offset: number;          // assigned by the engine at append
  kind: K;                 // envelope kind
  key: string | null;      // attribution lane
  payload: P;              // kind-specific content
}>;
type WaveEmission<T extends WaveTuple> = Omit<T, 'offset'>;

// A processor: receives each committed tuple once, in order.
interface WaveProcessor<T extends WaveTuple> {
  apply(tuple: T): readonly WaveEmission<T>[];
}

// A knot executor: the accumulator lifecycle (Vol. 05).
interface IKnotExecutor<T extends WaveTuple> {
  readonly id: string;
  matches(tuple: T): boolean;
  wind(tuple: T): readonly WaveEmission<T>[]; // emissions bounded to its own winding
  test(): boolean;                            // synchronous readiness
  understanding(): unknown;                   // synchronous snapshot of wound state
  reset(): void;
}

// The activation a descriptor receives when a knot becomes ready.
type DescriptorActivation = Readonly<{
  knotId: string;
  key: string | null;
  understanding: unknown;
}>;

// A descriptor executor: reacts to readiness (Vol. 06).
interface IDescriptorExecutor<E extends WaveEmission> {
  readonly id: string;
  readonly subscribesTo: string;
  execute(activation: DescriptorActivation): readonly E[];
}
```

Contract rules:

1. `apply`, `wind`, `test`, `understanding`, and `execute` MUST be synchronous.
   Asynchrony exists only at the membrane (Vol. 07). Readiness never awaits.
2. `wind` MAY return emissions, but only winding intentions bounded to the
   knot's own accumulation — never integrations for others, never decisions.
   This is the first agreed widening of the core (Vol. 11 §2).
3. `test` MUST read accumulated state only; it must not recompute, fetch, or
   mutate. The grade is state, not computation.
4. A processor MUST NOT mutate a tuple, reorder reception, or observe a tuple
   before it is committed.
5. Core modules MUST NOT depend on domain, extension, shell, or test modules;
   the dependency arrow always points at the core.

## 3. Stations and their competences

Normative restatement of the station matrix (Vol. 01 §4):

1. An **activation knot** MUST match and wind facts, MUST test readiness
   synchronously, MAY project winding intentions correlated to itself, and MUST
   NOT publish integrations for others, judge scopes, or reach the world.
2. A **bind descriptor** MUST be woken only by committed readiness tuples, MUST
   gather its bound scope only from activation and demands, MAY judge with gates
   and publish emit/reject facts or project a service intention, MAY emit
   topology records under a declared template, and MUST NOT wind ambient facts
   or reach the world directly.
3. An **output controller** MUST receive tuples on the membrane's own cursor,
   MUST discharge a claimed tuple at most once per runtime, MUST return the
   world's answers (including expected failures) as fact emissions under the
   intention's correlation identity, and MUST NOT judge, integrate, or
   originate uncorrelated semantic content.
4. An **observer** MAY mirror tuples to any sink and MUST return no emissions
   that alter machine behaviour.

## 4. The architectural register file

The following registers constitute the complete mutable state of a standard
machine between tuples. An implementation MAY represent them differently but
MUST preserve their semantics, their visibility (none of them is readable by
programmes except through committed tuples), and their reset rules. Names are
specification names; reference-implementation fields are shown for anchoring
and are described unit by unit in the refimpl book.

### 4.1 Engine registers

| Register | Reference field | Semantics |
| --- | --- | --- |
| `LOG` | `WaveEngine.log` | The append-only tuple sequence. Grows only at the tail; the next offset is always `LOG.length`. |
| `ENGINE.CURSOR` | `WaveEngine.cursor` | Index of the next tuple to propagate. The machine's instruction pointer: propagation is `LOG[ENGINE.CURSOR++]` until it reaches `LOG.length` (quiescence). Never rewinds. |

### 4.2 Topology registers

| Register | Reference field | Semantics |
| --- | --- | --- |
| `KNOT.DEFS` | `knotDefinitions` | Map knot-id → {factory, config}. Written by `sys.knot.defined`; re-registration of an id replaces the definition **and resets its clew bank** to a fresh null-key probe — accumulated clews of the old definition are discarded. |
| `CLEWS[k]` | `clews` | Map knot-id → (key → knot executor instance). The per-lane register bank: each registered knot winds one independent clew per tuple key. A clew is created lazily on the first fact of its key; registration eagerly creates the null-key clew as a configuration probe. |
| `BIND.DEFS` | `descriptors` | Map descriptor-id → executor instance. |
| `DISPATCH` | `dispatchTable` | Map knot-id → list of descriptor executors interested in its readiness (an operator bind registers under its activation and every demand knot). |

### 4.3 Per-clew registers (semantic knot)

| Register | Reference field | Semantics | Reset (`on_ready`) |
| --- | --- | --- | --- |
| `SLOTS` | `collectedData` | Named collection slots filled per rule (`append` pushes, `latest` overwrites). Used by local integration. | cleared |
| `STATE` | `woundState` | The integrated understanding text — the accumulator proper. | cleared |
| `GRADE` | `grade` | The current sufficiency grade in [0, 1]. Readiness reads it. | 0 |
| `DELTAQ` | `queuedDeltas` | Deltas accepted but not yet integrated (through-world winding). | cleared |
| `INFLIGHT.UID` | `inFlightUid` | Correlation id of the winding intention in flight, or null. While non-null the clew accepts new deltas into `DELTAQ` but projects nothing and is not ready. | null |
| `WIND.CTR` | `windCounter` | Count of winding intentions projected; the budget comparand and the uid sequence (`<knotId>#<n>`). | 0 |

With reset policy `never`, none of these clears at readiness; the clew may
report readiness repeatedly (the journal pattern, Vol. 10 §5).

### 4.4 Per-clew registers (deterministic knot)

| Register | Reference field | Semantics |
| --- | --- | --- |
| `COLLECTED` | `collected` | Map slot-name → value (or array under `append`). `understanding()` is its record snapshot; the condition is a null-guard conjunction over it. Cleared at readiness unless `reset: never`. |

### 4.5 Per-bind registers (operator bind)

One rendezvous state per key lane:

| Register | Reference field | Semantics |
| --- | --- | --- |
| `RDV[key].ACTIVATED` | `states.get(key).activated` | Whether the activation knot's readiness has arrived on this lane. Initialised true when the bind declares no `on`. |
| `RDV[key].SCOPE` | `states.get(key).scope` | The bound scope being gathered: name → understanding. A later readiness of the same demand refreshes its entry until projection (latching barrier). |
| `RDV[key].PROJECTED` | `states.get(key).projected` | One-shot latch: once the scope is judged and the intention projected (or rejected), the lane never fires again. |
| `INTENT.CTR` | `intentionCounter` | Sequence for service intention uids (`<bindId>#<n>`), shared across lanes. |

### 4.6 Membrane and runtime registers

| Register | Reference field | Semantics |
| --- | --- | --- |
| `MEMBRANE.CURSOR` | `Membrane.cursor` | Index of the next committed tuple to sweep. Advances exactly once per offset per runtime: the exactly-once discharge guarantee. Independent of `ENGINE.CURSOR`. |
| `DISCHARGE.TABLE` | `WaveRuntime.inFlight` | The set of in-flight discharge promises with their slots. The machine is settled only when this is empty at quiescence. |
| `SETTLING` | `WaveRuntime.settling` | Re-entrancy latch: one settling wave at a time; a second concurrent `settle` is a caller error. |

### 4.7 Register discipline

1. No register is programme-addressable. A programme observes machine state only
   through committed tuples (`sys.knot.ready` carries the understanding
   snapshot; intentions carry uids). If a shell needs more state, the protocol
   is widened first (cf. the UI-truth hold, Vol. 08 §8).
2. All registers are per machine instance and in-memory. Restart-safe
   rehydration of registers from a persisted log is an open, explicitly
   unresolved decision (Vol. 11 §6); a conforming v1 machine is not required to
   provide it.
3. Uid sequences are monotonic per owner: `INTENT.CTR` never resets, so
   service uids are unique per machine instance; `WIND.CTR` is cleared by a
   clew reset (`on_ready`), so winding uids are unique **per accumulation
   episode** and may recur across episodes of one clew. Correlation stays
   sound because at most one winding intention is in flight per clew and
   answers are matched against `INFLIGHT.UID`; log readers correlate
   `{knotId, uid}` within episode boundaries (a recurrence after readiness
   starts a new episode).

## 5. Dispatch model

On each committed tuple the topology performs kind dispatch:

```text
sys.knot.defined        → register knot definition; create null-key probe clew
sys.descriptor.defined  → construct executor; index interests in DISPATCH
sys.knot.ready          → activation dispatch: execute every descriptor in
                          DISPATCH[knotId] with {knotId, key, understanding}
domain.fact             → knot dispatch: for every knot definition,
                          clew = CLEWS[id][key] (create lazily);
                          if clew.matches(t): emissions += clew.wind(t);
                          if clew.test(): emit sys.knot.ready snapshot; clew.reset()
```

Normative points:

1. Registration is data-driven and ordered: a record MUST be committed before it
   can receive anything; a fact committed before its knot's registration is not
   delivered retroactively. Authoring layers therefore order records before
   facts (Vol. 06 §7, Vol. 09 §6).
2. Readiness is **reified**: the topology MUST commit a `sys.knot.ready` tuple
   carrying the knot id and the understanding snapshot, taken before reset, on
   the same key as the triggering fact. Descriptors MUST be activated by that
   committed tuple, never synchronously — the log records the full activation
   chain.
3. Clews are attributed by key: parallel keys wind independent understanding.
   The key of a readiness tuple is the key of the fact that completed it.
4. Dispatch order over knots follows registration order; emissions produced by
   earlier knots for the same tuple are appended before later processors run,
   but every processor still sees every tuple in identical log order.

## 6. Modes of a machine (execution profile)

A machine instance is characterised by an execution profile fixed at assembly:

| Profile element | Deterministic class | Semantic class | Hybrid class |
| --- | --- | --- | --- |
| Knot strategies installed | `deterministic` (and pure-local `semantic_evaluator`) | `semantic_evaluator` with `through_world` | both |
| Local integrator | pure function | pure function (used only by `local` knots) | both |
| Controllers | none, or deterministic function hosts | inference controller(s) | both |
| Replay of a run | re-execution reproduces the log | log replay only; re-execution may differ | mixed |

The profile changes no format and no algorithm; Vol. 08 §5 defines the
conformance consequences (notably determinism requirements).

## 7. Demonstration: the machine's inner loop

The complete reference engine, shown to fix the semantics of §1 and §4.1 — an
implementation in any language MUST be observationally equivalent:

```ts
class WaveEngine<T extends WaveTuple> {
  private readonly log: T[] = [];
  private cursor = 0;
  constructor(private readonly processors: readonly WaveProcessor<T>[] = []) {}

  run(seeds: readonly WaveEmission<T>[]): ReadonlyArray<T> {
    this.append(seeds);
    while (this.cursor < this.log.length) {
      const tuple = this.log[this.cursor++];
      for (const p of this.processors) {
        const out = p.apply(tuple);
        if (out.length > 0) this.append(out); // whole batch appended atomically
      }
    }
    return this.log;
  }

  private append(emissions: readonly WaveEmission<T>[]): void {
    for (const e of emissions) this.log.push({ ...e, offset: this.log.length } as T);
  }
}
```

Consequences an implementer must preserve: emissions of one `apply` call are
appended as a contiguous batch, in returned order, before the next processor is
called on the same tuple; every processor receives every tuple exactly once and
in the same order; offsets equal final log positions; `run` returns only at
quiescence.
