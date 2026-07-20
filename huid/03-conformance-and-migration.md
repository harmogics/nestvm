# HUID 03 — Conformance, Worked Examples, Migration

Status: SEED · Snapshot date: 2026-07-19 ·
Previous: [02-module-contract.md](./02-module-contract.md) ·
Next: [04-attention-and-calm.md](./04-attention-and-calm.md)

This closing volume gives the checklists a module and the host must pass,
the diff test that proves the motherboard invariant, the fixture-based
verification method, three worked example modules (the ones that motivated
the layer), and the safe migration of the current workbench.

## 1. Module conformance checklist

A conforming module demonstrates:

1. a complete, truthful manifest; `reads` minimal — `"*"` only with an
   observer-class justification;
2. a pure single-pass fold; provenance joins only; no adjacency assumptions;
3. a pure `select`; only declared params read; only declared keys written;
4. gestures only through the port; each control names its declared body; no
   auto-fire; refusals surfaced verbatim;
5. honest states present in the model (unanswered, stalled, failed,
   unfinished), the four transitions distinct;
6. the removal test: with the module absent, every other surface's model is
   byte-identical (§3);
7. at least one reading fixture with a golden model, covering at least one
   honest-state case (§4);
8. no network, no storage, no imports of other modules' internals;
9. the calm obligations of [HUID 04 §7](./04-attention-and-calm.md): load
   budget, disclosure over dialogs, no unsolicited interruptions, visual
   weight by kind of act, raw records one disclosure away.

## 2. Host obligations

The host demonstrates:

1. exactly-once, offset-ordered, manifest-filtered delivery to every fold —
   replay then live (HUID 01 §2);
2. shared derivations computed once per batch, shapes evolving additively
   (HUID 01 §3);
3. parameter writes never leave the device and never become commits
   (HUID 01 §4);
4. one serialised ingress client; refusals and failures rendered honestly
   in chrome (HUID 01 §5);
5. docks and switches derived from registries — no hardcoded module
   knowledge anywhere in chrome (HUID 01 §6);
6. registration is declarative: adding or removing a module touches the
   module's own files plus one registry entry, nothing else;
7. the fixtures harness runs every registered fold over recorded logs
   without mounting views.

## 3. The motherboard diff test

The layer's acceptance criterion, mirroring the root-compatibility proof of
Vol. 11 §7.1:

> For a fixture set F and module set M: **adding** module m changes no other
> module's model over F, and requires no diff outside m's own files and one
> registry entry; **removing** m restores every remaining surface's model
> over F byte-identically.

A feature that cannot pass this test is not a module — it is a layer
widening (a new bus line, a new dock policy, a new shared derivation) and
goes through the recorded-decision path (HUID 00 §3), landing in these
documents in the same work item (the discipline of Vol. 14 §3).

## 4. Verification by fixtures

The instruments of [ADR-005 Decision 2](../spec/ADR-005-ui-derivation-and-replay.md)
apply directly:

1. **Reading fixtures** — recorded session logs; the harness replays them
   through every fold and asserts golden `select` outputs. No machine, no
   network, no views. Module models are pinned exactly as derivations are.
2. **Continuation fixtures** — gesture flows tested live from a recorded
   state; the module's commits drive the machine, and the resulting batch
   re-enters every fold through the feed.
3. **Port doubles** are a machine-side concern modules never meet: a module
   cannot reach inference at all (HUID 02 §7) — an asymmetry that is the
   point, not a gap.

## 5. Worked examples

### 5.1 Knot maturity map (centre view)

A graphical constellation of every knot: grade as radius against a
threshold ring, readiness as fill, unknown-marks and returns as glyphs,
scenes as clusters. Everything needed is already on the log — **zero
protocol change, zero host change**:

```ts
const maturityMap: ModuleManifest = {
  id: "centre.maturity-map",
  title: "Maturity",
  dock: "centre",
  reads: {
    kinds: ["sys.knot.defined", "sys.knot.ready"],
    factTypes: ["learning.knot.seeded", "inference.response", "learning.knot.marked"],
    joins: ["knotId", "bindId", "emittedBy"]
  },
  derives: ["projection"],
  params: ["focus.bindId"],
  commits: [],
  navigates: ["focus.bindId", "centre.view"]
};
```

Clicking a knot navigates (`focus.bindId`, `centre.view: "focus"`) — a
parameter move, not a fact. Offering "deepen" from the map would add
`commits: ["deepen"]` and nothing else.

### 5.2 Bind trajectories (centre view)

A timeline of every bind: selected → intention projected → published →
accepted, with parent/child edges. Reads `learning.bind.selected`,
`service.request`, `learning.scene.unfolded`,
`learning.integration.candidate/returned/accepted`, `service.failed`;
joins `bindId`, `uid`, `parentBindId`. The offset axis is a legitimate time
axis (the log's total order, Vol. 03 §3.1) while every edge is still drawn
from payload joins, never adjacency. Zero protocol change.

### 5.3 Terms index (left dock) — and the semantic boundary

A panel listing every term encountered in bind publications, with counts,
first-seen offsets, and source binds. The **deterministic** version is pure
fold work: tokenise `learning.integration.*` statements, group, count —
a module, no machine involvement. Cross-surface filtering (click a term,
the canvas narrows) is a **promoted shared parameter** (HUID 01 §4.3), not
a module-to-module call.

The **semantic** version — normalised terminology, definitions, Vol. 15
reconciliation — is not a module concern: that is machine work behind the
membrane (an analysis figure publishing a declared fact family, e.g.
`learning.term.observed`; HUID 02 §7), which this same module then reads.
The example is retained here precisely because it shows where the boundary
runs: the panel idea splits cleanly into a fold (device) and a figure
(machine), joined by the log.

### 5.4 Session archive — the registry boundary

The first module seated in the field (ADR-008). Its lesson is a boundary:
saving and loading a session split along the feed. The **in-session face**
(export — the log materialised as a `.jsonl` download) is a true strip
module: a read-model reference, no commits, no fold. The **registry face**
(import — a recording replayed into a new live session, ADR-005 §2.2) acts
*before a session's feed exists*, so it is app-shell chrome beside the
new-session form, not a module. Session-registry operations (open, list,
import) are app chrome by nature; in-session capability is a module. Both
faces are dialog-free (HUID 04): export is the download itself; import is
one native file input with inline honest refusals.

## 6. Migration of the current workbench

The current `components/workbench.tsx` implements all surfaces inline. The
migration is five pinned steps; each is reversible, and the machine side
(session API, log, `lib/machine.ts`) is untouched throughout:

- **Step 0 — pin.** Record reading fixtures from live sessions (copy
  `var/sessions/*.jsonl` + meta into the fixtures directory); pin
  `project()` and `buildCanvas()` golden outputs. No code change.
- **Step 1 — lift derivations.** Move component-held derivations into
  `lib/`: the trace summary registry (`describeTuple`), the scene-strata
  derivation (superseding `producedTuples`, per ADR-005 Decision 3), one
  composer context map. Fixtures re-run identical.
- **Step 2 — seat the board.** Introduce the host skeleton (feed, params,
  port, dock frames, registries) and wrap the nine existing surfaces as
  modules — manifests written, JSX moved verbatim into views, folds
  initially trivial (`derives: ["projection"]`). Visual parity plus fixture
  parity.
- **Step 3 — energise enforcement.** Switch on manifest-filtered feeds.
  Any undeclared read now surfaces as missing data against the goldens;
  manifests are corrected until models match again — after this step the
  manifests are true **by construction**.
- **Step 4 — prove the slot.** Land the first foreign module (the maturity
  map of §5.1) with zero host diffs. This is the layer's acceptance run —
  the diff test of §3 passed in the field.

The safety argument is the one already established: every step preserves
derived models over fixed fixtures (replay-as-reading, Vol. 03 §6.4;
ADR-005 §2.1), so a regression is caught as a byte diff before it is ever a
visible defect.

## 7. Open questions

1. **SSE increments** — the fold form is ready for incremental feeds; the
   transport decision remains ADR-004 open question 1.
2. **Strip indicators** — whether the session strip opens a registered
   indicator slot or stays wholly host chrome.
3. **Obligation sockets** — arrive with the `WaveSession` layer and a
   human-task controller; the manifest reserves `claims`.
4. **Parameter URL sync** — whether some promoted keys mirror into the URL
   for shareable navigation; never for private module keys.
5. **Server-materialised folds** — evaluating module folds server-side with
   `asOfOffset` (the Projection builder of
   [open-bind-architecture](../spec/open-bind-architecture.md)); the
   contract already permits it because folds are pure.
6. **Reflexive study** — whether the HUID volumes join the studied corpus,
   so the workbench can study its own interaction device the way it studies
   its machine (the bootstrap of Vol. 13 §7 turned one level up).

## 8. The persona network — the standing self-check (2026-07-19)

The third level of drift detection, beside the checklists and the diff
test. Every cell has a demonstrable answer or a recorded gap —
pretending is the only non-conforming option (Vol. 14 §4.8). Drift is a
question that used to have an answer and lost it.

**The panel author asks (human or model alike):**

1. Where exactly do I write this? — one module directory; the routing
   table names it without guessing.
2. Where does my data come from? — a contract; and if none fits: one
   contract file, one projector, one registry line.
3. Who forms my data, under which frames? — a projector: claims from its
   own manifest, a pure fold, a snapshot with `asOfOffset`, rebuildable
   from the log, server-only.
4. What may my view do? — render model fields and speak two verbs;
   never fetch, never classify.
5. How do I know I broke nothing? — the compiler, the parity oracle, the
   diff test: my change touches only my registration sites.
6. Is my manifest truthful to a reader who never opens my code? —
   `consumes` equals my fetches; `commits` equals my controls.

**The platform architect (configurator) asks:**

1. Can I see, without reading implementations, which contracts exist,
   who forms each, and who consumes each? — manifests as the complete
   review surface.
2. Is widget placement configuration, not code? — the resolution table
   is a declarative artefact; re-routing is a table line, never an edit
   to widget or former.
3. Can I predict the exact blast radius of adding or removing a panel,
   widget, or contract? — the diff test, including removal restoring
   byte-identical models elsewhere.
4. Can I trace any pixel to its formation? — widget → form key →
   projector → claims → tuples, every step named and inspectable.
5. Are the two sides mechanically separated? — the `server-only` guard
   and the import DAG, not convention.
6. Do configurations compose without coordination? — registries are
   additive; overlapping claims are normal; no factType has an owner.

**The learner's experience asks (silently):**

1. Does the same fact look consistent wherever it appears — and is its
   truth identical across surfaces?
2. Where representation varies, is it my visible, per-place, reversible
   choice — and does choosing ever change the truth? (It must not.)
3. Is the raw record one disclosure away from every representation?
4. Do I ever need to know which widget, module, or contract serves me?
   — plumbing surfacing to the learner is drift.
5. Can I predict what a control does from its weight and place before
   reading its label? (HUID 04 §5.)
6. Does anything move, appear, or interrupt unbidden? (HUID 04 §4.)

## 9. Growth is registration — the table (2026-07-19)

The device-side statement of the growth rule (Vol. 11 §1 mirrored): each
want has exactly one registration site, and nothing else moves.

| Wanted | Registration site (and nothing else) |
| --- | --- |
| a new fact family | machine template (+ projector claims where read) |
| a new data product | contract file + projector + one registry line |
| a new lens / view | module directory + one dock-registry entry |
| a new row / block form | one former (plane) + one widget (client) |
| a new representation | one widget + one resolution-table line |
| a new gesture | product body + machine handler + `commits` entry |
| a new world capability | membrane adapter + configuration record |

A wanted change with no row here is a layer widening — the
recorded-decision path (HUID 00 §3), never an improvisation. Seating is
configuration: dock registries are filterable; an absent entry shortens
its dock honestly — never a dead tab — and «off» is verified by the
removal test (§3).
