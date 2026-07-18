# huid refimpl 00 — Reference Implementation Book: Map and Reading Rules

Status: CURRENT · Snapshot date: 2026-07-18 · Specifies against HUID 00–04 ·
Next: [01-contracts-and-projectors.md](./01-contracts-and-projectors.md)

The HUID volumes state the device layer normatively; this book is the
design record of its **reference implementation** — the study workbench in
`src/` — unit by unit, the way `specifications/refimpl/` records the
machine's. Nothing here overrides a volume; where the implementation holds
a documented interim liberty, the book says so plainly. The worked example
throughout is the **right panel**: the `scene-registry` contract, its
projector, and the `depth-rail` module (ADR-009, ADR-010).

## 1. The assembly at a glance

```text
SERVER — formation                       CLIENT — presentation
─────────────────────────────────        ─────────────────────────────────
src/nest/wave/store.ts                   src/huid/workbench.tsx (interim host)
  append-only log · JSONL ·                snapshot transport per contract
  onCommit (the mirror's one sink)         parameter space · command port
src/huid/projectors/  [server-only]        docks · chrome
  manifest.ts  reads + matchesReads      src/huid/modules/depth-rail/
  runtime.ts   cache-of-fold(replay)       manifest.ts  consumes · params ·
  registry.ts  contract → projector                     commits · navigates
  scene-registry.ts  the fold              view.tsx     select + View
src/app/api/sessions/[id]/               src/huid/modules/session-archive/
  snapshots/[contractId]/route.ts          strip.tsx    a materialised reading

            ═══ the join: src/huid/contracts/scene-registry.ts ═══
            types + id constant only — erased at build (ADR-010)
```

What crosses the wire is enumerable (HUID 01 §1): contract snapshots
`{model, asOfOffset}` and command acks down; declared bodies and snapshot
requests up; never parameters, fold state, or the tuple stream.

## 2. Reading rules

1. Each chapter names the volumes and ADRs it specifies against; file
   paths are the ground truth — when prose and code disagree, read the
   code and fix the prose in the same work item (Vol. 14 §3 discipline).
2. Interim liberties are marked as such and each carries its successor
   (the workbench monolith as interim host → HUID 03 §6 steps; refetch →
   SSE).
3. British English; terminology defers to Vol. 15 and the HUID volumes.

## 3. Chapters

- **[01 — Contracts and projectors](./01-contracts-and-projectors.md)**:
  the formation side — contract files, the projector manifest and
  single-source claims, the fold, the runtime cache, registration and
  wiring, the snapshot route; scene-registry worked in full.
- **[02 — Modules and the host](./02-modules-and-host.md)**: the
  presentation side — module manifests, select and View, the port, the
  interim host's duties, the two seated modules.
- **[03 — Verification and growth](./03-verification-and-growth.md)**:
  the instruments actually used (parity oracle, fixtures, live smoke,
  diff test) and the recipes for growing the device without touching the
  board.
