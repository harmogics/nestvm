# huid refimpl 01 — Contracts and Projectors: the Formation Side

Status: CURRENT · Snapshot date: 2026-07-18 · Specifies against HUID 00 §5,
01 §2/§7, 02 §1–2/§8; ADR-009, ADR-010 ·
Previous: [00-map.md](./00-map.md) ·
Next: [02-modules-and-host.md](./02-modules-and-host.md)

## 1. The contract file

`src/huid/contracts/scene-registry.ts` is the complete join between the
sides — types plus the id constant, nothing executable:

```ts
export const SCENE_REGISTRY = "scene-registry";

export type SceneCard = {
  bindId: string;
  parentBindId?: string;   // present on scenes born by deepen
  sourceKnotId?: string;   // the knot whose deepening sowed the scene
  title: string;
  status: "projecting" | "active" | "candidate" | "integrated";
  awaitingReview: boolean; // a published integration not yet accepted
  stalled: boolean;        // a *.failed answer landed within the scene
};

export type SceneRegistrySnapshot = { scenes: SceneCard[] };
```

Rules the file embodies: the id names the **data product**, never a dock;
both sides import it freely because types erase at build; shapes evolve
additively — a breaking change is a new contract id (ADR-010 D1). The
`awaitingReview`/`stalled` flags are formed now but rendered later: they
are the attention queue's data arriving ahead of its surface.

## 2. The projector manifest — single-source claims

`src/huid/projectors/manifest.ts` declares the formation vocabulary:

```ts
export type ProjectorManifest = {
  contract: string;         // which data product this projector forms
  reads: {
    kinds?: readonly string[];
    factTypes: readonly string[] | "*";   // '*' = observer-class claim
    joins: readonly string[];             // correlation fields the fold uses
  };
};

export function matchesReads(reads, tuple): boolean { … }
```

`matchesReads` is the whole enforcement: the runtime feeds a fold only
tuples the declaration accepts, so an undeclared read is impossible rather
than reviewable, and declaration/behaviour drift is structurally excluded
(HUID 02 §6.1). `joins` is honest documentation of the correlation fields
the fold navigates by — reviewable, not mechanically enforced.

## 3. The projector — scene-registry worked in full

`src/huid/projectors/scene-registry.ts`. The reads:

```ts
kinds:     sys.knot.defined · sys.descriptor.defined
factTypes: learning.bind.selected · learning.scene.unfolded ·
           learning.integration.candidate · learning.integration.returned ·
           learning.integration.accepted · inference.failed · service.failed
joins:     bindId · parentBindId · emittedBy · knotId · uid
```

The fold, case by case — every ownership resolution is a provenance join,
never adjacency (Vol. 03 §3.3):

| Claimed tuple | Effect on the fold state | Join used |
| --- | --- | --- |
| `sys.knot.defined` | `bindOfKnot[knot] = bind` | `emittedBy` uid → its bind |
| `sys.descriptor.defined` | `bindOfClose[close] = bind` | `emittedBy` uid → its bind |
| `learning.bind.selected` | new card: id, parent/source links, initial title, `projecting` | payload fields |
| `learning.scene.unfolded` | title from the authored result; `active` | `bindId` |
| `learning.integration.candidate` / `.returned` | `candidate`, `awaitingReview = true` | close-bind id → scene via `bindOfClose` |
| `learning.integration.accepted` | `integrated`, `awaitingReview = false` | `bindId` |
| `inference.failed` | `stalled = true` on the knot's scene | `knotId` → scene via `bindOfKnot` |
| `service.failed` | `stalled = true` on the owning scene | `bindId`, falling back through `bindOfClose` |

Purity is defined over the log: internal state mutates freely inside the
fold, but replay from offset 0 reproduces the snapshot byte-identically —
which is exactly what the parity oracle asserts (chapter 03 §1).

A real snapshot, from the deepen session `s-mrndrage-nq4s` (36 tuples):

```json
{ "model": { "scenes": [
    { "bindId": "bind-1", "title": "Understanding: How love can manifest itself",
      "status": "active", "awaitingReview": false, "stalled": false },
    { "bindId": "bind-2", "parentBindId": "bind-1", "sourceKnotId": "bind-1.k1",
      "title": "Understanding: What exactly is meant by …",
      "status": "active", "awaitingReview": false, "stalled": false }
  ] }, "asOfOffset": 36 }
```

The deepen gesture is visible as pure data: `parentBindId` + `sourceKnotId`
carry the child's provenance to any consuming view.

## 4. The runtime — a cache of fold(replay)

`src/huid/projectors/runtime.ts`. Load-bearing semantics:

1. **`asOfOffset`** is the log length the snapshot reflects (tuples
   `0…asOfOffset−1` folded).
2. **Lazy catch-up**: a cold or lagging cache entry folds the missing
   suffix at read time; **eager advance**: the store's commit hook pushes
   warm entries forward batch by batch. Both paths run the same
   `step` — divergence is impossible by construction.
3. **Rebuild rule**: an entry ahead of the log (a replaced session) is
   dropped and re-folded from 0 — "readings and indexes may be rebuilt"
   (PHILOSOPHY §2) made mechanical.
4. The whole plane opens with `import "server-only"`: any client-graph
   import is a build-time error (ADR-010 D2); the store's `node:fs` is
   the second tripwire.

## 5. Registration and wiring

`src/huid/projectors/registry.ts`: one Map entry per contract —

```ts
const projectors = new Map([[sceneRegistryProjector.manifest.contract,
                            sceneRegistryProjector]]);
```

`wireProjectors()` subscribes the plane **once per process** to the
store's observer hook (`onCommit`, `src/nest/wave/store.ts` — the mirror's
one sink, Vol. 08 §1.2). It is called by the snapshot route at module
load, because assembly is the app shell's job (Vol. 08 §1). The wave
registers nothing and knows nothing of panels: the formation boundary
holds at the seam (HUID 00 §5). A listener that throws never fails a
commit (observers must not alter machine behaviour, Vol. 02 §3.4).

## 6. The snapshot route

`src/app/api/sessions/[id]/snapshots/[contractId]/route.ts` — the only
wire for formed information:

```text
GET /api/sessions/:id/snapshots/scene-registry
  → 200 { model, asOfOffset }
  → 404 { error: "Unknown session." | "Unknown snapshot contract …" }
```

One snapshot per contract serves every consuming panel; the SSE upgrade
(replay-then-live per the refimpl 08 §2.3 protocol of the machine set)
replaces the host's refetch when it lands — the route shape is already
final.
