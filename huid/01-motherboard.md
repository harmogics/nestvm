# HUID 01 — The Motherboard: Host, Feed, Docks

Status: SEED · Snapshot date: 2026-07-17 ·
Previous: [00-overview.md](./00-overview.md) ·
Next: [02-module-contract.md](./02-module-contract.md)

The host is the invariant part of the device. It owns transport, the tuple
replica, the shared derivations, the parameter space, the command port, and
the docks. It knows nothing about any particular module beyond its manifest.

## 1. The boundary

| Concern | Host | Module |
| --- | --- | --- |
| Session lifecycle and transport | owns (fetch, later SSE) | never touches the network |
| Tuple replica | owns; feeds in offset order | receives a filtered, read-only feed |
| Shared derivations | computes once per batch | consumes those it declared |
| Parameter space | owns the key registry; applies patches | reads declared keys; writes via `navigate` |
| Ingress | owns the session-API client; serialises commands | shapes declared bodies; calls `commit` |
| Docks and chrome | renders registries, notices, busy state | declares its dock; renders its view |
| Enforcement | filters the feed by manifests; warns in dev | declares truthfully |
| Fixtures harness | runs folds over recorded logs | ships golden models |

Everything in the left column is written once and does not change when
modules come and go. Everything in the right column is per module.

### Sides and the wire

The boundary has **two axes**, and both must be read together: the *role*
axis (host / module, the table above) and the *side* axis (server /
client) — which components physically sit where, and what crosses the
wire. Since ADR-009 the side axis is architectural, not a deployment
detail: **the server side forms information; the client side presents
it** (HUID 00 §5).

```text
SERVER — information is formed          CLIENT — information is presented
─────────────────────────────────       ─────────────────────────────────
machine · src/nest/{machine,membrane}   host, client half · src/huid
  commits tuples; knows no panels         snapshot replicas per panel
store + commit hook · src/nest/wave       parameter space (focus, options)
  append-only log, JSONL, notifies        command-port client
  listeners (the mirror's one sink)       docks, registries, chrome
readings library · src/nest/readings    modules · src/huid/modules
  the pure folds projectors evaluate      select(model, params) — pure
projectors, host's server half            view(model, port) — render only
  · src/huid/projectors                   gestures → declared bodies
  claims = manifest.reads;              nothing else: no fetch, no
  fold → snapshot + asOfOffset            semantic state, no second truth
routes · src/app/api
  panels (GET/SSE) · commands · Class L
```

**The wire — everything that crosses it, exhaustively:**

| Direction | Crosses |
| --- | --- |
| down (server → client) | panel snapshots `{model, asOfOffset}` · command results (acks with the committed batch) · Class L materialisations (archive download, payload by offset) |
| up (client → server) | declared `TurnBody` / `DecisionBody` through the command port · panel snapshot requests (`after` offset) |
| **never** | navigation parameters (client-only) · fold state (server-only) · machine registers (no one's, Vol. 02 §4.7) · the raw tuple stream to panels (ADR-009 Decision 3) |

Component by component:

| Component | Side | Region | Does | Never does |
| --- | --- | --- | --- | --- |
| machine | server | `src/nest/machine`, `membrane` | commits tuples; discharges intentions | knows panels exist |
| store + commit hook | server | `src/nest/wave` | append-only log; JSONL; notifies listeners | edits; interprets |
| readings library | server (and any Class L tool) | `src/nest/readings` | pure folds: projection, canvas, trace, strata | store access; fetch |
| panel projector (host, server half) | server | `src/huid/projectors` | claims + fold → snapshot + `asOfOffset`; rebuilds by replay | discharge; judgement; second truth |
| routes | server | `src/app/api` | serve snapshots; accept commands; Class L endpoints | machine semantics |
| host (client half) | client | `src/huid` | snapshot transport; params; port; docks; chrome | forming information |
| module (`select` + view) | client | `src/huid/modules` | apply params; render model fields; shape gestures | fetch; compute semantics |

Interim honesty: until the ADR-009 steps land, panels without a projector
form their models in the **client** host over the tuple replica — the same
pure folds on the provisional side. The map above states the target
contract; the interim is recorded in ADR-009 and HUID 03 §6.

## 2. The feed

The feed is the device-side continuation of the machine's own feed — "tuples
in offset order" (Vol. 08 §8) — delivered to module folds:

1. **Replay, then live.** On mount the host replays the whole replica
   through each fold, then appends live batches (command results today; the
   SSE stream when it lands, ADR-004 open question 1). On remount the replay
   runs again from offset 0 — folds are pure and cheap.
2. **Exactly once, in order.** Each module's fold receives each matching
   tuple exactly once per replica lifetime, in offset order — the reception
   rule of Vol. 02 §2.4 applied at the reading face.
3. **Filtered by manifest.** The host delivers to a fold only tuples
   matching the module's declared `reads` (envelope kinds and fact types).
   The manifest is thereby not documentation but a **dispatch table**: a
   module's reads are its collection rules, and the host is the dispatcher —
   the mirror of topology dispatch (Vol. 02 §5) and knot collection
   (Vol. 05 §3). A module physically cannot read what it did not declare.
   Where a fold evaluates server-side, the same filter feeds its projector
   (§8) and the enforcement moves behind the wire entirely.
4. **Folds always run; views render on demand.** An inactive centre view's
   fold still steps (state stays warm; switching is instant); only rendering
   is deferred.
5. **Batches are atomic.** A command's committed batch enters the feed
   whole, in offset order, before any view re-renders.

Cost note: filtered feeds make each fold O(matching tuples); shared
derivations are computed once per batch and memoised; `select` is memoised
by (fold state, params) identity.

## 3. Shared derivations

The host computes canonical derivations once and offers them to modules that
declare them (`derives`):

| Id | Derivation | Source |
| --- | --- | --- |
| `projection` | the canonical session read model | `lib/projection.ts` |
| `canvas` | text-canvas blocks | `lib/canvas.ts` |
| `trace` | per-tuple actor + summary | trace registry (migration step 1) |
| `strata` | per-scene admission / sowing / harvest grouping | strata derivation (migration step 1) |

Rules: shared derivations are pure folds of the same replica; their shapes
grow **additively** — a removal or a meaning change is a recorded layer
widening, never a silent edit. A module needing structure none of these
carry writes its own fold rather than asking the shared shape to bend.

## 4. The parameter space

One flat record of navigation state, never committed, never a truth:

1. **Host keys** (well known): `focus.bindId`, `centre.view`,
   `session.busy`, `session.status`. Their semantics are fixed here.
2. **Module keys** are namespaced by module id (`<moduleId>.<key>`) and are
   private to the module.
3. **Shared keys** — cross-module coordination (e.g. a term filter several
   surfaces respect) — are **promoted**: added to the host key registry by a
   recorded decision, additively. Cross-module coupling through private keys
   is a defect; coupling through promoted keys is reviewed.
4. Writes go only through `port.navigate(patch)`; reads only through the
   declared `params`. The host may log parameter traffic in development;
   parameters never persist as truth and never enter the log.
5. When a gesture depends on a coordinate, the coordinate travels **inside
   the committed payload** (`focusRef`, sealed `sourceSnapshot`,
   `parameters.targetOffset`) — the exact-snapshot rule (ADR-003). After
   commitment the log, not the parameter space, is the record.

## 5. The command port

The port is the device's single ingress client of the session API
(ADR-004 Decision 1):

1. Two verbs only: `commit(turn | decision)` and `navigate(patch)`.
2. The host serialises commits (one settling command at a time — ADR-004
   Decision 6), owns busy state, and surfaces refusals honestly in chrome
   (`refused.reasons` verbatim — the machine refused, the device reports).
3. The committed batch returned by a command enters the feed, and every
   fold steps: **one gesture updates every module through the bus** — the
   device's own wave. Modules never notify each other.
4. The port stamps nothing: ids, uids, offsets, actor are the server's
   (ADR-004). A module that mints an id has left the contract.

## 6. The five docks

Docks are the physical form factor of the spatial grammar (ADR-003); a
module declares its dock and MUST NOT relocate at runtime.

| Dock | Policy | Meaning (ADR-003) |
| --- | --- | --- |
| `strip` | host chrome; a registered-indicator registry is reserved | session identity and state |
| `left` | stack of modules, ordered by declared `order`; collapsible | released history — what may feed later work |
| `centre` | **carousel**: registered views; `centre.view` selects exactly one; the switch renders from the registry | the focused figure |
| `right` | stack, like left | chosen depth; grows toward the attention queue ([manifest §7.3](../spec/manifest-of-conscious-movement.md)) |
| `composer` | the one composer (ADR-003); a fact-factory switchboard; modules may register composer contexts, not second composers | ingress |

Adding a centre view adds its switch button by registration alone; adding a
rail module adds its section in declared order. The host's dock frames do
not change.

## 7. The projector plane — where folds evaluate

A module's fold MAY evaluate server-side as a **panel projector**
(ADR-009): an observer-class reading service fed by the store's commit
hook (the mirror's one sink), filtered by the module's `reads`,
accumulating the parameter-independent snapshot and serving it with a
mandatory `asOfOffset` (GET first, SSE later). The module contract is
unchanged — `select` and the view stay client-side over `(model, params)`,
and the module still never fetches: the host transports snapshots. A
projector is rebuildable from the log at any time and holds no second
truth; it is not a Vol. 07 output controller — controllers discharge
exactly once and address the world, and their UI face is the reserved
obligation socket (ADR-005 §1.4). The component-by-component sides and the
wire contract are the map in §1.

## 8. What never crosses the board

Restated from the module side in HUID 02 §5; stated here as host law:

1. No module reaches the network, storage, or timers-with-effects; the port
   is the only egress and it leads to the session API alone.
2. No module imports another module's internals; there is no module-to-module
   call path on the board.
3. No module receives unfiltered feed without an observer-class claim
   (`reads.factTypes: "*"`).
4. No parameter write is ever translated into a commit by the host; the two
   kinds of act do not blur (HUID 00 §4).
