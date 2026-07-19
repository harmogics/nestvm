# src conventions — the implicit contracts, made explicit

**Status:** 2026-07-18. House conventions that are load-bearing are
stated; standard practices are adopted **by reference** (named, never
restated); known deviations are ledgered and retired opportunistically
(the themes/ pattern). Pointed to from the master lid and FORMAT §2.4.

## 1. Wire-model shapes (contracts and snapshots)

1. **Absence over null.** Optional fields are absent (`?:` +
   `undefined`; `JSON.stringify` drops them from the wire). Readers
   check presence — the mechanical ally of additive contract evolution.
2. **Flags are present booleans with honest names** (`awaitingReview`,
   `stalled`) — never optional; a genuine third state is an explicit
   union, never `boolean | undefined`.
3. **Anchoring by shape.** Append-shaped items carry their `offset` (the
   truth anchor); kneaded cards carry identity keys (`bindId`,
   `knotId`). Nothing is anchored by list position.
4. **Bounded at formation.** Excerpts and summaries are bounded in the
   fold/former, never trimmed in the view; full bodies live behind
   one-disclosure endpoints (Vol. 03 §8 extended to snapshots).
5. **Form keys use the factType idiom** — dotted lowercase namespaces
   (`integration.candidate`, `turn.plain`) — one naming discipline for
   both vocabularies (Vol. 04 §6 mirrored lightly).
6. **Names by contract.** Model types named for the contract
   (`SceneRegistrySnapshot`, `SceneCard`); the contract id constant is
   exported beside the types; ids kebab-case.

## 2. Flow

1. **Ack, then refresh.** `applyResult` appends the committed batch to
   the replica first, then refreshes the consumed snapshots — the
   replica is never behind a snapshot it triggered.
2. **One settling command client-side** (`busy`), mirroring the server's
   serialised ingress (ADR-004 D6).
3. **Quiet degradation.** A transport hiccup keeps the last snapshot; an
   absent capability *states* its absence — affordances are never
   silently hidden (seed §9 discipline).
4. **Monotonic snapshots.** A snapshot with `asOfOffset` ≤ the held one
   is dropped. *Ledgered gap (§6.1): designed in proposal-centre-dock §5, not
   yet guarded in the host.*

## 3. The construction paradigm — functional, atomic, stratified

Not taste but entailment: purity is what the standing law runs on —
rebuildable readings (Art. 2), replayable folds, location-free
derivations (Class L), parity oracles — and in a workshop developed by
several models it makes the unit of review equal the unit of meaning,
with diffs that localise.

1. **Functions over classes; plain data over instances.** Classes only
   where a port demands an adapter shape (the membrane); no inheritance —
   composition is calls.
2. **Atoms compose upward within a file** — the anatomy files converge
   to: the role header, then seams/state (if any), then private atoms,
   then composed operations, then the narrow exported surface. A file
   reads as its own figure: gathered atoms → composition → published
   exports (a degenerate instance, meta-bind-01 §3).
3. **Narrow exports are a file's publication face.** Export only what
   the outer ring consumes; a widening export list is reviewed like a
   widening claim.
4. **Effects live at named seams only.** Backend: `fs` in the store,
   network in membrane adapters, process caches in commented
   `globalThis` registries — each explicitly a cache of replay. Device:
   state and effects in the host only; modules are pure `select` plus
   components (`props → view`).
5. **Two sides, one discipline, different strata.** Backend strata:
   atoms → operations → exported commands and ports. Device strata: pure
   selects/formers → components → host glue. The difference is where
   state may live — never how code is written; forking the paradigm per
   side would fork the shared language of the models developing it.

## 4. Code

1. **`import type` across boundaries** wherever only types are needed —
   bundle hygiene beneath the `server-only` guard, not instead of it.
2. **`readonly` on manifest arrays and the tuple envelope**; committed
   payloads treated immutable (Vol. 03 §1.2).
3. **Files kebab-case; identifiers and comments British English**;
   registered ids dotted or kebab per their register.
4. **Comments state constraints, not narration** — the file-header
   style: role plus governing sections; nothing a reader sees in the
   next line anyway.

### React and Next.js — the carrier framework

Standard practice is adopted by reference (function components, the
hooks rules, App Router semantics, server components by default). Only
what our law bends is stated:

1. **The client boundary is drawn by the host, never by modules.**
   `"use client"` sits on the host and on standalone app chrome (the
   forms); module views carry no directive — they are side-neutral pure
   components, seated by whoever owns the boundary.
2. **No hooks in modules.** `useState`/`useEffect` live in the host
   only; a module is a pure `select` plus a stateless view — the HUID
   law expressed in React terms, against the habitual sprinkle of local
   state.
3. **Props are the contract: `{model, port}`.** No prop spreading, and
   **no React Context for semantic data** — context would be an
   undeclared bus around the manifests; explicit props keep the flow
   reviewable. (Context may one day carry host plumbing such as a theme
   handle — never truth.)
4. **No semantic computation in JSX** — mapping model fields only
   (HUID 02 §3.4); `select` computes.
5. **Async effects carry the cancelled-flag cleanup** (the host's load
   effect pattern); no effect exists outside the host.
6. **No UI-kit and no CSS-in-JS dependencies.** Widgets are plain
   components over theme tokens — which is precisely what keeps a
   guild's widget hints portable: a seed may assume tokens, never a
   component library (themes rule 5; the vanilla discipline of the
   machine refimpl 08 §4 echoed).

## 5. Adopted by reference (named, not restated)

- **HTTP status semantics with `{error}` bodies** — the machine
  refimpl 08 §2 house style (honest 400/404/409/413).
- **React list keys = stable identity** — bound here to truth anchors
  (offset, id); index keys only for content-static fragments.
- **SemVer** for seed versions (FORMAT §2.1).
- **JSON-representable payloads** (Vol. 03 §1.3) — extended to
  snapshot models verbatim.

## 6. Deviation ledger (opportunistic retirement)

1. The monotonic snapshot guard (§2.4) — lands with host transport
   generalisation (preparation P1).
2. Evidence excerpt lists in the focus lens key by index — retires with
   the `scene-detail` extraction.
3. Inline styles on strip links (Exit, Archive) — already ledgered on
   the themes side (nestvm-ink §4); one debt, one ledger entry each.
