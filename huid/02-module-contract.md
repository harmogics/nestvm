# HUID 02 — The Module Contract

Status: SEED · Snapshot date: 2026-07-19 ·
Previous: [01-motherboard.md](./01-motherboard.md) ·
Next: [03-conformance-and-migration.md](./03-conformance-and-migration.md)

A module is the unit of UI capability: one card seated in one dock. Its
contract spans the two sides of the formation boundary (HUID 00 §5) —
**formation** (a projector, server-only) and **presentation** (select +
view, client) — joined only by a **snapshot contract** (types, erased at
build; ADR-010). The presentation side speaks to the board through exactly
two verbs — **commit** and **navigate**. TypeScript is the reference
encoding (as in Vol. 02); the shapes, not the language, are normative.

## 1. The shape

```ts
// presentation side — src/huid/modules/<panel>/ (client)
type HuidModule<M, V> = {
  manifest: ModuleManifest;
  select(model: M, params: Params): V;             // pure parameter application
  View(props: { model: V; port: ModulePort }): ViewOutput;
};

type ModuleManifest = {
  id: string;                           // 'right.depth'
  title: string;                        // dock label / carousel caption
  dock: "strip" | "left" | "centre" | "right" | "composer";
  order?: number;                       // position within stacked docks
  consumes: readonly string[];          // snapshot contract ids the panel is fed
  params?: readonly string[];           // parameter keys read
  commits?: readonly string[];          // decision kinds / operator ids shaped
  navigates?: readonly string[];        // parameter keys written
  // reserved key: claims — obligation sockets (ADR-005 §1.4), not yet open
};

// formation side — src/huid/projectors/<contract>.ts (server-only)
type SnapshotProjector<S, M> = {
  manifest: ProjectorManifest;
  init(): S;                                       // the empty accumulated state
  step(state: S, tuple: WaveTuple): S;             // pure; called in offset order
  snapshot(state: S): M;                           // the wire model
};

type ProjectorManifest = {
  contract: string;                     // the snapshot contract id
  reads: {
    kinds?: readonly string[];          // envelope kinds beyond domain.fact
    factTypes: readonly string[] | "*"; // '*' is the observer-class claim
    joins: readonly string[];           // correlation fields the fold uses
  };
};

type ModulePort = {
  commit(body: TurnBody | DecisionBody): Promise<CommandResult>;
  navigate(patch: Readonly<Record<string, unknown>>): void;
};
```

The split between fold and `select` is load-bearing and is now the wire
itself: the fold accumulates the **parameter-independent** snapshot
server-side; `select` applies navigation client-side over the delivered
model. Fold state is a rebuildable cache, testable without any view;
parameter changes never re-fold and never cross the wire.

## 2. Fold rules

1. **Pure, single-pass, offset order.** `step` MUST be a pure function; the
   projector runtime guarantees order and exactly-once delivery per cache
   entry (HUID 01 §2, §7).
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

1. **Reads are physical.** The plane's runtime feeds a fold only tuples
   matching its projector manifest's `reads` (`matchesReads`) — an
   undeclared read is impossible rather than reviewable; and the
   `server-only` marker makes any client-graph import of the plane a
   build-time error (ADR-010 Decision 2).
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

## 8. The two sides and the contract join

Since ADR-010 the sides are physically separated and joined only by the
snapshot contract (superseding the one-directory sketch this section
carried earlier — the 1:1 assumption broke once one projector could feed
several panels):

```text
src/huid/contracts/<contract>.ts    types + id constant — the only
                                    compile-time join; erased at build
src/huid/projectors/                server-only formation plane:
  manifest.ts   reads declaration + matchesReads (single source)
  runtime.ts    cache-of-fold(replay), asOfOffset, catch-up, advance
  registry.ts   contract → projector; wireProjectors() to the store hook
  <contract>.ts one projector: ProjectorManifest + fold → snapshot
src/huid/modules/<panel>/           purely client presentation:
  manifest.ts   consumes, dock, params, commits, navigates
  view.tsx      select(model, params) + View(model, port)
  README.md     the lid
```

1. **Contracts are first-class data products.** Named for the data
   (`scene-registry`), never for a dock; shapes evolve additively; a
   breaking change is a new contract id. One contract may feed any number
   of panels — a tabular rail and a graphical map alike — and the host
   fetches once per contract for all of them.
2. **The projector manifest is executable and single-source.** Claims
   derive from `reads` mechanically (`matchesReads`); declaration and
   enforcement cannot drift. Presentation manifests declare `consumes`,
   never reads — what a panel is fed, not what the log contains.
3. **Separation is mechanical, not conventional.** The plane carries the
   `server-only` marker: a client-graph import is a build-time error; the
   store's `node:fs` is the second tripwire. A module never imports the
   plane — contract types come from `contracts/`.
4. **Registration is one line; the wave registers nothing.** The plane's
   registry maps contract → projector; `wireProjectors()` subscribes the
   plane to the store's observer hook (`onCommit`) once per process,
   called by the app shell because assembly is the app's job (Vol. 08 §1).
   The wave stays panel-ignorant — the formation boundary holding at the
   seam (HUID 00 §5).

Adding a panel over an existing contract is one module directory; adding a
new data product is one contract file, one projector file, and one
registry line — the motherboard diff test (HUID 03 §3) holds across both
sides. The worked walk-through is the refimpl book
([huid/refimpl](./refimpl/00-map.md)).

## 9. Contract shapes and the lens law (2026-07-19)

1. **A view is a lens: view = contract × select × view-form.** The
   contract's projector fixes which tuples participate and what of them
   survives (the formation filter); the module fixes how the survivors
   read (the presentation form). Every lens preserves offset order and
   provenance joins: it re-forms truth, never reorders or invents it.
   Adding a lens therefore adds no truth and no mechanism — one contract
   if new information is needed, one module if only a new form.
2. **A contract declares its shape.** *Append-shaped* products grow only
   at the tail (rows and blocks keyed by offset); *kneaded* products are
   cards mutated by later tuples (keyed by identity). The shape is part
   of the declaration: append products admit natural delta transport
   (`{contract, appendFrom, items}`); kneaded products travel as whole
   snapshots. A product may keep its append list pure by carrying
   late-arriving effects (an acceptance, a supersession) in small
   kneaded side-maps beside it, re-formed in `select`.
3. **Overlapping claims are normal.** Any number of projectors may claim
   the same kinds and factTypes; readings are independent, rebuildable,
   and share the one log. No factType has an owner, and no exclusivity
   rule exists or should.

## 10. The presentation factory: forms and widgets (2026-07-19)

Offset-anchored items render through a two-sided factory split exactly
along the formation boundary (HUID 00 §5):

1. **Form keys are formed server-side.** A projector's former registry
   classifies each offset-anchored item and stamps a `form` key plus the
   fields that survive formation, plus always the offset. Formers claim
   tuples the way collection rules and controller claims do elsewhere;
   first claim wins in declared order; a **generic former closes every
   chain**, so an unknown factType still forms — the total-coverage
   property: no tuple is ever invisible. Form keys use the factType
   idiom (dotted lowercase) and evolve additively, collision-reviewed.
2. **Widgets resolve client-side.** A shared library of pure components
   is routed by a declarative resolution table keyed **(lens, form)** —
   never `form` alone — cascading exact form → family (`<family>.*`) →
   the **lazy raw-JSON widget**, the total fallback every chain ends in.
   Re-routing a form is a table line, never a widget edit; the user's
   representation choice is an ordinary per-form navigation parameter
   selecting within the resolved candidates.
3. **Raw truth crosses only through the host.** The raw widget receives
   a host-injected tuple reader over the payload endpoint (a Class L
   materialised reading); widgets and modules never fetch. Templates
   front the record and never replace it: the committed tuple stays one
   disclosure away (HUID 04 §3.3).
4. **Must never:** a resolution table keyed without the lens (a
   god-object); widgets parsing payloads (classification lives in
   projectors only); representation preferences as standing chrome
   (icons rest in the quiet meta line or on disclosure); an aggregate
   card treated as a factory item — kneaded cards (identity-keyed
   aggregates) **compose** factory widgets inside their disclosures,
   they are not instances of it.
