# ADR-009: Panel projectors — backend-computed snapshots per panel

**Status:** Accepted direction, 2026-07-17; implementation planned (right
panel first). Builds on ADR-005 (materialised derivations), ADR-008 (the UI
request path), HUID 01–04. Amends HUID 01 with §8 in the same work item.

## Context

The transport built so far ships the whole tuple replica to the browser and
derives every view client-side. That was the conformant interim (ADR-004
Decision 1 blessed the shared projection on both sides), but the product
direction is now fixed: **panels do not receive the append log; each panel
has its own backend module and receives only a snapshot shaped for the
UI**, over GET first and SSE later. The right panel is the proving ground,
because its successor — the attention queue — is exactly the meta-mechanism
that watches bind lifecycle tuples and will help digitise the operator's
gestures.

## Decision 1 — the station: projector, not output controller

The backend engine that watches claimed tuples and maintains a panel
snapshot is stationed as an **observer-class reading service** — the
**panel projector** — not as a Vol. 07 output controller:

- an output controller's sweep cursor advances exactly once per offset
  (Vol. 02 §4.6, Vol. 07 §3.1): it can never re-read history, while a
  snapshot engine MUST be able to rebuild from offset 0 (restart, new
  subscriber, changed snapshot shape). Readings hold exactly that right:
  they are pure functions of the log, rebuildable at will (Vol. 08 §8;
  PHILOSOPHY §2 "Readings and indexes may be rebuilt");
- the reference mechanism for UI delivery is the mirror observer feeding
  JSONL and SSE from one sink (Vol. 08 §1.2; refimpl 08 §2.3) plus
  server-computed pure derivations (`digestTrace`, refimpl 08 §3) — the
  projector is precisely that pattern, given a per-panel form;
- Vol. 01 §1's "a human interface … reached only through output
  controllers" is honoured in the **other direction**: when the machine
  addresses the operator (asks, notifies, awaits an answer), that is an
  intention discharged exactly once by a human-task controller whose
  answer re-enters as a correlated fact — the obligation-socket path
  (ADR-005 §1.4). The gesture-digitising meta-mechanism therefore has two
  faces: the **queue** (projector, reading face) and the **ask**
  (controller, membrane face). This ADR builds the first; the second
  arrives with `WaveSession`.

## Decision 2 — the projector contract

A panel projector is the server half of a HUID module. The four-part module
contract splits across the boundary exactly along the fold/select seam
(HUID 02 §1):

| Part | Where | Contract |
| --- | --- | --- |
| claims | backend | the manifest's `reads`, now enforced physically server-side: the projector is fed only matching tuples |
| fold | backend | `init` / `step(state, tuple)` — pure, offset order, provenance joins; accumulates the **parameter-independent** snapshot |
| snapshot | wire | the serialisable model + mandatory `asOfOffset`; never a second truth — rebuildable from the log at any time |
| select + view | client | parameter application (focus, filters) and rendering; the module still never fetches — the **host** transports snapshots and feeds models in |

Rules:

1. **Feed-in**: projectors subscribe to a commit hook at the store (the
   LogMirror seam: JSONL append and listener notification from one sink);
   on start or restart they rebuild by replaying the persisted log —
   replay is reading (Vol. 03 §6.4).
2. **Serve**: `GET /api/sessions/:id/panels/<moduleId>` →
   `{model, asOfOffset}`; the SSE upgrade (replay-then-live per panel, or
   one multiplexed events channel) follows the refimpl 08 §2.3 protocol.
3. **No second truth**: a projector holds no state that `fold(replay)`
   would not reproduce byte-identically; fixtures pin this (reading
   fixtures apply to projector folds unchanged).
4. **Full-log endpoints remain** for Class L instruments — archive,
   replay, trace payload inspection ("raw truth one disclosure away",
   HUID 04 §3.3) — but panels are no longer their consumers.

## Decision 3 — the right-panel adaptation plan

1. **Commit hook (wave)**: `store.ts` gains an in-process listener
   registry beside the JSONL append — the mirror's "one sink" completed.
   No semantics; pure infrastructure.
2. **Projector seam (device, server half)**: `src/huid/projectors/` —
   registry + the projector type `{manifestId, claims, fold, snapshot}`;
   wired to sessions by the app shell at load (assembly is the app's job).
   Server-only code; client components never import it.
3. **Depth/attention projector**: the first instance. Its claims make the
   depth-rail manifest's `reads` truthful at last: `learning.bind.selected`
   (a bind enters the queue), `learning.scene.unfolded` (title, status),
   `sys.descriptor.defined` (close bind, return address),
   `learning.integration.candidate`/`returned` (awaiting review),
   `learning.integration.accepted` (leaves the queue),
   `learning.knot.marked`, `service.failed`/`inference.failed` (honest
   stalls). The snapshot is the scene registry with parent/child links and
   attention flags — the attention queue's data, param-independent.
4. **Panel route**: `GET /api/sessions/:id/panels/right.depth` →
   `{model, asOfOffset}`.
5. **Client adaptation**: the interim host (workbench) fetches the
   snapshot on load and after each command result, and hands `model` to
   the module's `select` (which now applies only `focus.bindId`); the
   module contract is untouched — it still receives `{model, port}` and
   never fetches. SSE replaces refetch when the events channel lands.
6. **Parity regression**: during the transition, assert over the fixture
   logs that `select(projectorSnapshot, params)` equals the current
   client-derived model — the migration is pinned tuple-for-tuple.
7. **Rollout after proof**: trace projector (serving the matched template
   rows of ADR-008 Decision 3 — payloads stay one disclosure away, fetched
   per offset), then left rail, then canvas.

## Consequences

1. Manifest enforcement becomes physical on the server: a panel cannot
   read beyond its claims because its projector is never fed the rest.
2. The client host thins toward its final shape: params, port, docks,
   snapshot transport — no shared-derivation computation for
   projector-backed panels.
3. The attention-queue successor (manifest §7.3) lands as a projector
   evolution, not a UI rewrite.
4. HUID 01 gains §8 (the projector plane) in this work item.

## Open questions

1. One SSE channel multiplexing all panels vs a channel per panel.
2. Projector lifecycle: per-session on demand vs per-process warm registry.
3. Snapshot versioning when a fold's shape changes (rebuild is the
   answer; the question is cache invalidation discipline).
4. Whether command responses shrink to acks + `asOfOffset` once SSE
   carries the feed.
