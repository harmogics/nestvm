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
   is dropped. *Ledgered gap (§5.1): designed in design_proposal §5, not
   yet guarded in the host.*

## 3. Code

1. **`import type` across boundaries** wherever only types are needed —
   bundle hygiene beneath the `server-only` guard, not instead of it.
2. **`readonly` on manifest arrays and the tuple envelope**; committed
   payloads treated immutable (Vol. 03 §1.2).
3. **Device code is functions and plain objects**; classes only in
   machine-side adapters (the inference port).
4. **Files kebab-case; identifiers and comments British English**;
   registered ids dotted or kebab per their register.
5. **Comments state constraints, not narration** — the file-header
   style: role plus governing sections; nothing a reader sees in the
   next line anyway.

## 4. Adopted by reference (named, not restated)

- **HTTP status semantics with `{error}` bodies** — the machine
  refimpl 08 §2 house style (honest 400/404/409/413).
- **React list keys = stable identity** — bound here to truth anchors
  (offset, id); index keys only for content-static fragments.
- **SemVer** for seed versions (FORMAT §2.1).
- **JSON-representable payloads** (Vol. 03 §1.3) — extended to
  snapshot models verbatim.

## 5. Deviation ledger (opportunistic retirement)

1. The monotonic snapshot guard (§2.4) — lands with host transport
   generalisation (preparation P1).
2. Evidence excerpt lists in the focus lens key by index — retires with
   the `scene-detail` extraction.
3. Inline styles on strip links (Exit, Archive) — already ledgered on
   the themes side (nestvm-ink §4); one debt, one ledger entry each.
