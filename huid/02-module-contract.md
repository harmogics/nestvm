# HUID 02 — The Module Contract

Status: SEED · Snapshot date: 2026-07-17 ·
Previous: [01-motherboard.md](./01-motherboard.md) ·
Next: [03-conformance-and-migration.md](./03-conformance-and-migration.md)

A module is the unit of UI capability: one card seated in one dock. It has
exactly four parts — **manifest, fold, select, view** — and speaks to the
board through exactly two verbs — **commit** and **navigate**. TypeScript is
the reference encoding (as in Vol. 02); the shapes, not the language, are
normative.

## 1. The shape

```ts
type HuidModule<S, M> = {
  manifest: ModuleManifest;
  fold: {
    init(): S;                                   // the empty accumulated state
    step(state: S, tuple: WaveTuple): S;         // pure; called in offset order
  };
  select(state: S, shared: SharedDerivations, params: Params): M;  // pure
  View(props: { model: M; port: ModulePort }): ViewOutput;
};

type ModuleManifest = {
  id: string;                           // 'centre.maturity-map'
  title: string;                        // dock label / carousel caption
  dock: "strip" | "left" | "centre" | "right" | "composer";
  order?: number;                       // position within stacked docks
  reads: {
    kinds?: readonly string[];          // envelope kinds beyond domain.fact
    factTypes: readonly string[] | "*"; // '*' is the observer-class claim
    joins: readonly string[];           // correlation fields the fold uses
  };
  derives?: readonly ("projection" | "canvas" | "trace" | "strata")[];
  params?: readonly string[];           // parameter keys read
  commits?: readonly string[];          // decision kinds / operator ids shaped
  navigates?: readonly string[];        // parameter keys written
  // reserved key: claims — obligation sockets (ADR-005 §1.4), not yet open
};

type ModulePort = {
  commit(body: TurnBody | DecisionBody): Promise<CommandResult>;
  navigate(patch: Readonly<Record<string, unknown>>): void;
};
```

The split between `fold` and `select` is load-bearing: the fold accumulates
the **parameter-independent** state of the module over the log; `select`
applies navigation cheaply. Fold state is cacheable and testable without any
view; parameter changes never re-fold.

## 2. Fold rules

1. **Pure, single-pass, offset order.** `step` MUST be a pure function; the
   host guarantees order and exactly-once delivery (HUID 01 §2).
2. **Provenance joins only.** Ownership and causality come from `uid`,
   `emittedBy`, `bindId`, `knotId`, `key`, `valueId` — never from adjacency
   (Vol. 03 §3.3–4). A missing join field is a protocol gap to raise, not a
   heuristic to invent.
3. **Tolerant reading.** Unknown extra payload fields are preserved or
   ignored, never a failure (Vol. 04 §1.2).
4. **Strata awareness.** Derivations that group scene tuples group by the
   three strata — admission, sowing, harvest — one lid per bind, winding
   tacts under knots (ADR-005 Decision 3).
5. **Repetition folds at read time** («×N», Vol. 03 §8).
6. **Honest states are outputs.** Unanswered intentions, stalls, failures,
   settled-unfinished are model fields (Vol. 08 §7); the four transitions
   stay distinct fields even where the design shows one badge (ADR-003).

## 3. Select and view

1. `select` is pure over `(state, shared, params)` and reads only declared
   parameter keys.
2. The view receives `(model, port)` and nothing else. **Rendering
   technology inside the view is the module's liberty** — DOM, SVG, canvas,
   WebGL — the mirror of "the types of functions bound in knots and binds
   are an implementation liberty" (Vol. 08 §5). The contract is data in,
   gestures out.
3. Inner structure is free: a module MAY keep its own inner renderer
   registries (as the text canvas does); the contract governs the module
   boundary only.
4. A view never computes semantic state in render; whatever the view needs
   is a field of the model, so fixtures can assert it (HUID 03 §4).

## 4. Gesture rules

1. **Every committing control names its declared body** — which
   `TurnBody`/`DecisionBody` it shapes, listed in `commits`. A control that
   cannot name its fact is navigation, listed in `navigates`, or does not
   belong.
2. **No auto-fire.** Render, scroll, focus, and timers commit nothing;
   display creates no obligation; silence is never consent
   ([manifest §2](../spec/manifest-of-conscious-movement.md)).
3. **Coordinates seal at commitment** inside the payload (exact-snapshot
   rule, ADR-003; HUID 01 §4.5).
4. **Authoring weight is visible.** Controls that sow topology (unfold,
   deepen, reframe) carry distinguished presentation (product thinking
   rail 6).
5. **Refusals are the machine's voice.** A module surfaces
   `refused.reasons` (or defers to host chrome); it never retries silently
   and never rewords a refusal into success.

## 5. Station rules

Mirroring the station matrix (Vol. 01 §4) at the device:

| Module class | Receives | May | Must never |
| --- | --- | --- | --- |
| **Reading module** (typical panel) | filtered feed + declared shared derivations + declared params | fold, select, render; expose gestures | hold semantic state outside its fold; read beyond its manifest; reach the network; import other modules |
| **Observer module** (trace-class) | the whole feed (`reads: "*"`) | everything a reading module may | commit gestures that alter the machine beyond what it displays warrants; justify `"*"` in review |
| **Composer module** | composer dock + params | shape and commit every declared turn form | interpret text into operators itself (interpretation precedence is the server's — [first-turn-log-protocol](../spec/first-turn-log-protocol.md)) |
| **Obligation socket** (reserved) | one discharged intention (uid) | present the obligation; return the human's answer as the correlated fact | answer on the human's behalf; outlive its uid; double-answer (ADR-005 §1.4) |

## 6. Enforcement

1. **Reads are physical.** The host's filtered feed makes an undeclared read
   impossible rather than reviewable — the module simply never sees the
   tuple (HUID 01 §2.3).
2. **Params are audited.** Undeclared parameter reads/writes warn in
   development and fail module conformance (HUID 03 §1).
3. **Manifests are the review surface** for everything the feed cannot
   enforce (joins honesty, commits list, dock fit) — the mirror of
   controller claim review (Vol. 11 §6.4).

## 7. The semantic boundary: panels never infer

A module derivation is deterministic. When a wanted surface needs semantic
work — normalising terms, judging similarity, summarising — that work
belongs to the machine, not to the module:

1. widen the protocol: a declared fact family per Vol. 04 §6 (e.g.
   `learning.term.observed`), produced by an analysis figure on the machine
   side — a journal knot collecting publications, a bind publishing the
   analysis (Vol. 10 §5–6);
2. then the module **reads** those facts like any others.

Deterministic extraction (tokenising, counting, grouping, thresholding) is
legitimate fold work. The rule in one line: **panels never infer; the
machine infers, the log carries, panels read.** This keeps every inference
on the membrane where it is budgeted, correlated, and replayable
(Vol. 07 §4) — a panel that called a model would be an unbudgeted,
uncorrelated, unreplayable side channel.
