# ADR-010: Snapshot contracts — full separation of projectors and UI modules

**Status:** Accepted 2026-07-17 (proposed by the user); executed
2026-07-18 on the right panel — contract `scene-registry`, its projector,
the `depth-rail` module, the `/snapshots/:contractId` route, the
`server-only` guard; parity re-verified (18 sessions, 0 divergences) and
the old `/panels` path retired. HUID 01/02 amended in the same work item;
the reference walk-through is the new refimpl book
([huid/refimpl](../huid/refimpl/00-map.md)). Refines ADR-009 and
supersedes the one-directory sketch HUID 02 §8 carried earlier.

## Context

Two observations against the freshly landed projector shape:

1. **Bundle safety is discipline, not mechanics.** The pure projector fold
   sits inside the module directory; nothing but convention stops a client
   import from bundling it. The `node:fs` tripwire guards the plane's
   infrastructure, not the fold.
2. **One projector may serve many panels.** A tabular rail and a graphical
   maturity map both read the same scene registry. The projector's product
   is a **data product**, not a panel — naming it after a dock
   (`right.depth`) miscasts its identity, and the 1:1
   module-directory-with-two-halves assumption breaks at N:1.

## Decision 1 — snapshot contracts are first-class

- `src/huid/contracts/<contract-id>.ts` — the wire contracts: **types
  only** (plus the contract id constant), imported by both sides, erased
  at build. The contract is the single compile-time join between
  formation and presentation; everything else crosses as data
  (`{model, asOfOffset}` over the API).
- Contract ids name the data product (`scene-registry`), never a dock.
- Contract shapes evolve **additively** (the shared-derivation rule,
  HUID 01 §3); a breaking change is a new contract id. A version field is
  an open question below.

## Decision 2 — physical separation with a mechanical guard

- Projector folds move into the server plane:
  `src/huid/projectors/<contract-id>.ts` (reads declaration + fold →
  snapshot), beside `runtime.ts` and `registry.ts`.
- Every file of the plane carries the `server-only` marker (the npm
  package): any client-graph import becomes a **build-time error**, not a
  convention. The store's `node:fs` remains the second tripwire.
- `src/huid/modules/<panel>/` becomes purely client: manifest, `select`,
  view, lid. A module never imports the plane, not even types — contract
  types come from `contracts/`.

## Decision 3 — the manifest split

- **ProjectorManifest** (with the projector): `{contract, reads, joins}` —
  the formation declaration; claims derive from it mechanically
  (`matchesReads`, single source — the ADR-009 refinement carries over).
- **ModuleManifest** (with the panel): drops `reads`/`derives`, gains
  `consumes: readonly contractId[]` plus dock, params, commits,
  navigates. Presentation declares what it consumes, never what the log
  contains — the final form of the answer recorded in HUID 02 §8.

## Decision 4 — the snapshot API

- Route becomes `GET /api/sessions/:id/snapshots/:contractId` — the
  resource is the data product; several panels share it. The registry is
  keyed by contract id.
- The host fetches **per contract, deduplicated**: one snapshot feeds
  every consuming module (table and graph alike); SSE later multiplexes
  by contract.

## Migration (on the go signal)

1. `npm i server-only`; mark the plane.
2. `modules/depth-rail/model.ts` → `contracts/scene-registry.ts`
   (types renamed to contract terms; module and projector imports follow).
3. `modules/depth-rail/projector.ts` → `projectors/scene-registry.ts`;
   registry keyed `scene-registry`; ProjectorManifest introduced.
4. ModuleManifest: `consumes` replaces `reads`/`derives`; depth-rail and
   session-archive manifests updated.
5. Route renamed to `/snapshots/:contractId`; host fetch updated and
   deduplicated by contract.
6. Docs in the same work item: HUID 01 §7, HUID 02 §1 + §8 (amended to
   the contract-join shape), lids, parity re-run (folds unchanged —
   goldens must hold byte-identically).

## Open questions

1. A `version` field in the contract constant vs new-id-per-break only.
2. Whether contracts eventually carry JSON Schema beside the TypeScript
   types, for shells in other languages (Class L tooling parity).
3. An alias period for the old `/panels/right.depth` path (v0: none).
