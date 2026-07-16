# ADR-004: Session runtime context — the UI↔backend API and the two storage planes

**Status:** Current architecture contract (v0 simulation; binding for the core swap)

## Context

The workbench runs today on a simulated machine (`lib/machine.ts` +
`lib/guide.ts`) behind a session API. The next phase implements the core —
wave rails organised as semantic vessels — **under the same API**. This ADR
fixes that API, the split between backend-owned storage (outside the machine)
and machine-owned persistent storage (pluggable, in-memory first), and the
assembly profile of the runtime for this product. It applies the agreements
of [manifest-of-conscious-movement.md](./manifest-of-conscious-movement.md):
one truth, human gestures as committed facts, mutable material only before
commitment.

## Decision 1 — the session API (UI ↔ backend)

### Commands and queries

```text
POST /api/sessions                     open a session {petal, subject}
GET  /api/sessions                     session registry (meta list)
GET  /api/sessions/:id                 {meta, tuples} — full replay
POST /api/sessions/:id/turns           one composer turn
POST /api/sessions/:id/decisions       responsibility-bearing gestures
GET  /api/sessions/:id/events          SSE tuple stream (planned; replay then live)
GET  /api/sessions/:id/workshop        list drafts (planned)
PUT  /api/sessions/:id/workshop/:d     create/update a draft (planned)
```

A **turn** carries `{clientTurnId?, text, targetKnotId?, vector?, operator?,
sourceRefs?, excludedSourceRefs?, focusRef?}` with the interpretation
precedence of [first-turn-log-protocol.md](./first-turn-log-protocol.md):
target → answer; operator → configured bind request; neither → plain signal.
`targetKnotId` and `operator` are mutually exclusive.

A **decision** carries `{clientCommandId?, kind, …}` with kinds:
`evidence · deepen · accept · revise (planned) · markUnknown · finish ·
attest`. There is deliberately no `integrate`: a scene's close bind publishes
itself at its barrier.

### Response envelope

- Success returns `{tuples: WaveTuple[]}` — the **committed batch in offset
  order**. The client keeps a tuple replica, appends batches, and derives
  every view through the shared pure projection (`lib/projection.ts`) — the
  same function the server uses; no view-private state on either side.
- Refusal returns HTTP 409 `{tuples, refused: {reasons[]}}` — honest reasons,
  nothing further committed. Tuples already committed by the same command
  (e.g. the turn fact preceding a refused operator) are included.
- The server, never the browser, mints ids, uids, offsets and stamps `actor`.
- Idempotency (planned with the command journal): a repeated
  `clientTurnId`/`clientCommandId` returns the original result and commits
  nothing.

### Tuple vocabulary (the wire contract)

Envelope: `{offset, kind, key, payload}`; kinds `sys.knot.defined`,
`sys.descriptor.defined`, `sys.knot.ready`, `domain.fact` (Vol. 03 shape).
Current fact families:

| Family | Fact types | Producer |
| --- | --- | --- |
| session | `learning.session.opened`, `learning.session.result.candidate`, `learning.session.completed` | ingress / completion gate |
| ingress | `learning.turn.submitted`, `learning.answer.submitted`, `learning.knot.marked`, `learning.integration.accepted`, `learning.integration.revised` (planned) | human via ingress mapper |
| authoring | `learning.bind.selected`, `learning.knot.seeded`, `learning.scene.unfolded` | machine (agent within declared templates) |
| winding | `inference.request/response/reasoning/failed` | knots / membrane controller |
| services | `service.request` (+ `service.reasoning/failed` reserved) | binds / membrane controller |
| publications | `learning.integration.candidate`, `learning.integration.returned`, `learning.evidence.registered` | close binds / evidence controller |

## Decision 2 — backend-owned storage (outside the machine)

The backend keeps, beside the machine, exactly these residents — none is a
second truth:

1. **Command journal** (planned): raw commands with idempotency keys and
   their resulting offsets. Infrastructure for retry safety and audit.
2. **Session registry**: metadata sidecars (`status`, counters, timestamps) —
   derived convenience, recomputable from the log (Vol. 03 §6.3 discipline).
3. **Workshop store** — *the only mutable plane*: human-authored artefacts
   **before commitment**, invisible to the machine:
   - revision drafts started from a bind publication (the read→revise→append
     step in progress);
   - source bundles prepared for future scenes (material ready to be sown or
     re-presented into the log);
   - notes.
   Shape: `{draftId, sessionId, kind: revision|source-bundle|note,
   sourceOffsets[], body, createdAt, updatedAt, committedOffset?}`.
   Invariants: `sourceOffsets` provenance is mandatory (no-laundering begins
   in the workshop); committing a draft turns it into a fact
   (`learning.integration.revised`, re-presentation facts, or seeds) and
   freezes it with `committedOffset`; drafts never route into knots.
4. **Navigation state**: client-held (focus, scroll, open inspectors); never
   semantic, never authoritative.
5. **Derived-reading caches** (optional): projections, manifest of conscious
   movement, attention queue — recomputable at any time.

## Decision 3 — machine-owned persistent storage (pluggable ports)

The machine persists exactly one thing: **the wave log**. Ports, with
in-memory adapters first:

```ts
interface WaveStore {
  append(key: string, tuples: readonly WaveTuple[]): Promise<void>;
  read(key: string): Promise<WaveTuple[]>;
}
```

- Adapters: `InMemoryWaveStore` (first core adapter), `JsonlWaveStore`
  (current behaviour: one file per session, one tuple per line — the
  persisted wire format of Vol. 03 §6), later a durable DB adapter. All
  adapters preserve dense offsets and never renumber.
- **Registers are not persisted** (Vol. 02 §4.7): topology state lives in
  memory for the lifetime of a session runtime. v0 simulation derives
  register-equivalents by replaying the log per command; the core will hold
  live registers and, on restart, rebuild by replay **without re-discharging
  intentions** (Vol. 08 §9) — full restart-safe continuation remains the
  recorded open decision (Vol. 11 §6.1) and is not silently assumed.
- Controller configuration (model, budgets) comes from the environment and
  configuration records at assembly; secrets never enter records or the log.

## Decision 4 — the machine port (backend ↔ NestVM)

The seam beneath the ingress mapper, stable across the swap:

```ts
interface StudyMachinePort {
  seed(key: string, emissions: readonly WaveEmission[]): Promise<WaveTuple[]>;
  ingest(key: string, emissions: readonly WaveEmission[]): Promise<WaveTuple[]>;
  read(key: string, from?: number): Promise<WaveTuple[]>;
}
```

- `ingest` commits ingress facts, drives the wave to settlement (propagation
  ⇄ membrane discharges, Vol. 08 §3) and returns everything committed by
  this wave.
- **Product interpretation stays in the backend** either way: turn
  precedence, operator allowlisting, actor stamping, completion contract —
  the ingress mapper is not the machine's concern.
- v0: `lib/machine.ts` implements the port with orchestration folded in
  (documented simulation liberty). Core: the port is implemented by
  `Runtime(Engine([Topology]), Membrane([controllers]))`, with the current
  agent roles becoming output controllers:
  - `GuideController`: claims `inference.request` (winding) and
    `service.request` (scene authoring, folds) — content within declared
    forms. Inference itself is a pluggable seam (`lib/inference.ts`,
    `InferencePort`): the first adapter is Together AI; a machine without a
    credential gets the null adapter and deterministic fallbacks;
  - `EvidenceController`: claims evidence intentions, discharges the
    deterministic corpus retriever, answers with correlated facts.

## Decision 5 — resources by reference and the resolver port

Some tuples reference internal documents as **resources**. The log stays
bounded: a fact carries an immutable reference, an optional digest and a
bounded excerpt — never the full body (Vol. 03 §8; Vol. 13 §3). Content is
resolved **at attention time**: when a knot winds, the discharging controller
resolves the referenced resources into content, within a declared budget, and
feeds it to the integration task.

```ts
type ResourceRef = {
  store: "spec" | "workshop" | "wave";  // resolver namespace
  ref: string;                          // '05-activation-knots#3-…' | draftId | 'offset:42'
  digest?: string;                      // when frozen
  title?: string;                       // display label
  excerpt?: string;                     // bounded preview carried in the tuple
};

interface ResourceResolver {
  resolve(ref: ResourceRef): Promise<{ title: string; content: string } | null>;
}
```

- Adapters (pluggable, like the WaveStore): `SpecCorpusResolver` (volume
  sections by slug#anchor), `WaveResolver` (committed tuples by offset —
  released values), `WorkshopResolver` (frozen drafts only: a committed
  source-bundle becomes a readable resource). A composite resolver routes by
  `store`.
- **Presentation facts** carry references into the machine:
  `learning.source.presented {bindId | knotId, resource: ResourceRef}` —
  committed after registration (no retroactive delivery). Scene-targeted
  presentations form the scene's context registry (the authoring agent reads
  them; knots do not auto-wind them — winding budgets stay honest);
  knot-targeted presentations are collected by the knot's `source` socket and
  wound with resolved content.
- Resolution lives in the controller, never in the knot: deltas may carry
  refs; the guide controller resolves them at discharge within a content
  budget. The tuple keeps ref + excerpt; the trace stays bounded and
  replayable.

## Decision 6 — assembly profile of this product

- One machine instance per session; wave key = session id; single lane;
  serialised ingress (one settling command at a time).
- Machine class: **hybrid** — semantic winding/authoring through the agent
  membrane, deterministic evidence and completion gates.
- Petal `understand-the-machine`, result contract `defended-articulation@1`.
- Run metadata marked `class: simulated` until the core lands; the flag flips
  per session when a real assembly serves it.

## Consequences

- The core replaces the simulation behind two stable seams (session API,
  machine port) — the UI cannot tell the difference.
- The workshop gives the revise step a home before commitment, keeping the
  log clean of half-formed material while preserving provenance.
- Storage adapters swap independently: in-memory for tests and the first
  core, JSONL for the public site, DB later — same ports.

## Open questions

1. SSE (`/events`) versus batch-only responses for v1 of the core — batches
   are sufficient for one user; SSE is required for observers/live feeds.
2. Draft retention after commitment: freeze in place (current choice) or
   archive to a separate history.
3. Actor identity: nominal `learner` until an identity layer exists; the
   contract already reserves server-side stamping.
4. Multi-lane sessions (branches/ledgers per child scene) stay DECLARED until
   the core enforces them; the port signature already admits them via keys.
