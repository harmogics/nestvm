# depth-rail — the reference presentation module

**Role.** The right dock: chosen depth (ADR-003) — child scenes of the
focused scene, plus the whole scene registry once more than one scene
exists. The reference shape of a contract-backed panel (ADR-010): it
consumes the **scene-registry** contract; its formation lives in the
server-only plane.

**Shape (HUID 02 §8, ADR-010).** Purely client:
[manifest.ts](./manifest.ts) — `consumes: [scene-registry]`, dock, params,
gestures; [view.tsx](./view.tsx) — `select` (applies `focus.bindId`) +
`View` (renders cards, navigates through the port). The wire contract is
`src/huid/contracts/scene-registry.ts`; the projector is
`src/huid/projectors/scene-registry.ts`; the walk-through is
[huid/refimpl 01–02](../../../../huid/refimpl/00-map.md).

**May import.** `contracts/` (types, erased), `../../manifest`,
`../../text` — never the projector plane (build-guarded by `server-only`),
never machine/membrane, never another module's internals.

**Audit trail.** Extracted from the monolith 2026-07-17 (derivation
purity, navigation-only gestures, calm notes); projector-backed the same
day; contract-split 2026-07-18. Parity with the former client formation
pinned by the independent JSONL oracle over every stored session (18/0,
twice). Recorded successor: the attention queue (manifest §7.3) — the
`awaitingReview`/`stalled` flags already arrive in the snapshot.
