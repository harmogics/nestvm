# huid refimpl 03 — Verification and Growth

Status: CURRENT · Snapshot date: 2026-07-18 · Specifies against HUID 03;
ADR-005 D2, ADR-008 D1, ADR-010 ·
Previous: [02-modules-and-host.md](./02-modules-and-host.md)

## 1. The instruments as actually used

1. **The compiler**: `npx tsc --noEmit` — the cheapest gate; import-DAG
   violations and contract drift surface here first.
2. **Reading fixtures** (`fixtures/sessions/`): recorded session logs in
   the wire format — the ADR-005 pin. Projector folds replay them without
   any machine, membrane, or network.
3. **The independent parity oracle**: a plain-JS script derives card
   expectations straight from the raw JSONL **by a different path** than
   the projector (the `.close` naming convention instead of provenance
   joins), then compares against the live snapshot API for every stored
   session. At the ADR-010 migration: 18 sessions, 0 divergences —
   twice (before and after the contract split), proving the fold moved
   without changing a byte of formed truth.
4. **Live smoke**: import a re-keyed recording → snapshot at
   `asOfOffset = N` → commit a plain-signal turn → snapshot at `N + 1`
   (the commit hook advancing a warm cache); the browser pass confirms
   render parity and port navigation; honest refusals probed explicitly
   (unknown session, unknown contract, collision, malformed lines).
5. **The diff test** (HUID 03 §3): adding the maturity-map view over the
   existing contract must touch one module directory and its mount —
   nothing in the plane, the wave, or other modules.

## 2. Growth recipes on this implementation

**A second view over an existing contract** (the maturity map):
`src/huid/modules/maturity-map/` — manifest
`{dock: "centre", consumes: [SCENE_REGISTRY], …}`, a `select` shaping
constellation data from the same cards, an SVG `View`; mount it in the
host (interim: one line in the workbench; post-host: one registry entry).
Zero server changes — that is the N:1 point of ADR-010 working.

**A new data product**: contract file in `contracts/` (types + id, named
for the data) → projector in `projectors/` (manifest + fold) → one
registry line → panels declare `consumes`. The parity oracle pattern of
§1.3 is the template for its regression net.

**A new gesture**: declared body in `product/commands.ts` → handler in
the machine → the module lists it under `commits` and its control shapes
it through the port. No bespoke endpoints (ADR-008, gesture rules).

**A panel needing data the log lacks**: widen the protocol first — a
declared fact family per Vol. 04 §6 — then claim it in a projector.
Panels never infer (HUID 02 §7).

## 3. Migration status (honest ledger)

| Surface | State |
| --- | --- |
| right rail (depth) | contract-backed: `scene-registry` end to end |
| strip (archive) | module, fold-less by nature |
| centre (focus/canvas/log) | contract-backed 2026-07-19: `scene-detail` / `produced-texts` / `trace` — three modules seated from the carousel registry; the shared row-former registry and the widget seam (resolution table, raw-JSON floor) landed with them |
| left rail, strip counters, result panel, composer | interim: formed client-side from the tuple replica — awaiting their contracts (shelf/session-meta) |
| host proper | interim: the workbench plays it; HUID 03 §6 step 2 |
| SSE events channel | pending; refetch-per-command until then |
| obligation sockets | reserved (ADR-005 §1.4), arrive with WaveSession |

The ledger shrinks surface by surface along the ADR-008 request path;
each migration repeats the shape recorded in chapters 01–02 and re-runs
the §1 instruments.
