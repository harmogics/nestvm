# ADR-005: UI surfaces as derived readings — stations, replay verification, and the scene strata

**Status:** Accepted architecture normalisation, 2026-07-17. Builds on
[ADR-003](./ADR-003-spatial-bind-knot-workspace.md) and
[ADR-004](./ADR-004-session-runtime-context.md); supersedes nothing. The Nest
Runtime Specification Set (`specifications/`) is taken as the unchangeable
base; this ADR tunes the environment around it (`spec/`, `lib/`, `app/`,
`components/`). The companion rails document is
[ui-panel-rails.md](./ui-panel-rails.md).

## Context

The workbench has reached the point where the log is live, the centre switches
between three projections (focus / canvas / log), and knots accumulate
understanding that close binds gather and publish. While preparing the next
construction step — the left and right rails — three architecture questions
were raised:

1. Should UI panels be membrane output controllers with per-panel APIs, so all
   panel assembly logic lives behind the backend membrane? Should selecting
   the focused bind then be committed to the log, since a controller can learn
   of it only from the log — removing every undocumented way for the UI to
   peek at state?
2. How is this tested without walking every scene live? Can recorded append
   logs be replayed to a chosen state without inference controllers reaching
   external APIs, with normal service resuming afterwards?
3. Does the current "produced by this bind" list conflate producers? The
   knots of a scene are authored by the model at unfold time; the bind itself
   publishes only the final integration tuple. Have we arrived at an AI
   authoring engine?

Each question is normalised against the specification set below. The three
instincts behind the questions are each honoured; where the specification
assigns the mechanism to a different station than the question assumed, the
station rules win.

## Decision 1 — panels are derived readings and fact factories, not controllers

### 1.1 The station test

The station matrix (Vol. 01 §4, Vol. 02 §3) admits exactly four citizens.
Testing "a UI panel" against each:

- **Output controller** — claims committed tuples, discharges each **at most
  once** per runtime, must not judge, integrate, or originate semantic
  content, and returns the world's answers as correlated facts (Vol. 07
  §2–3). A display panel fails every clause: it re-reads history continuously
  rather than exactly once, answers nothing into the log, and its whole job
  is presentation-side composition. A panel that "accumulates state glued
  from log and user actions" would be shell-private truth — the exact thing
  Vol. 08 §8 forbids.
- **Observer** — mirrors tuples to any sink, emits nothing behavioural
  (Vol. 02 §3.4). This is the lawful **transport** for panels: the reference
  `LogMirror` feeding JSONL and live feeds from one sink (Vol. 08 §1), the
  planned SSE stream (ADR-004 Decision 1).
- **Derived reading** — a pure function of committed tuples (Vol. 08 §8).
  This is the panel itself.

Therefore: **every panel is a declared derived reading plus a set of fact
factories.** The membrane's roles in the UI story are transport (observer →
mirror → SSE) and ingress (commands → committed facts, Vol. 07 §6) — never
per-panel semantic state. In conformance terms the whole UI stack is a
Class L citizen — log-conforming reader tooling (Vol. 14 §1) — over the
Class M machine.

### 1.2 What the controller instinct lands as

The modularity behind question 1 is granted, at the reading face:

- **Per-panel backend APIs are admissible** as *materialised derivations*:
  the backend evaluates the same pure function the client could run and
  serves the panel model with an `asOfOffset` marker — the Projection
  builder already anticipated in
  [open-bind-architecture.md](./open-bind-architecture.md) (backend service
  10, query boundary). Materialisation is a cache of a fold, recomputable at
  any time; it never becomes a second truth.
- **Panel manifests make "no custom peeking" checkable.** Symmetric to
  controller configuration records (Vol. 07 §5) and the claim-manifest
  intention of Vol. 11 §6.4, every panel declares what it reads (kinds, fact
  types, correlation joins), which parameters it accepts, and which gestures
  it commits. A panel needing data not derivable from its declared reads is
  a protocol-widening request first (Vol. 08 §8) — never a bespoke query.
- **"Canvas as three controllers" lands as one reading surface with a
  renderer registry** (`lib/canvas.ts`). A renderer's `enabled` + `build`
  pair *is* a claim predicate at the reading face, mirroring the membrane's
  claim discipline in code. Presentation multiplicity lives in registries —
  cheap, versioned, code-level — not in the control plane, where controllers
  are installed statically and never toggled by facts (Vol. 07 §2.6).

### 1.3 Navigation is a parameter, not a fact

Selecting the focused bind is **not committed**. Pure navigation — focus,
view mode, filters, expansion — is a read-model reference (thinking rail 1;
ADR-003 "navigation in a read model"; ADR-004 Decision 2.4;
open-bind-architecture command boundary: pure navigation does not enter the
wave unless an audit policy explicitly requires it). Panels take navigation
as **parameters** of their derivation, client-held or passed to the query
API.

Focus becomes durable at exactly the moment it bears consequence: the
committed gesture carries the coordinate inside its own payload —
`focusRef` on a turn, the sealed `sourceSnapshot` on `learning.bind.selected`,
`parameters.targetOffset` on a reframe — stamped server-side (the
exact-snapshot rule, ADR-003). Nothing about a running figure ever depends
on where the user is looking.

If attention itself is ever wanted as data (study analytics, audit), that is
a deliberate widening — a declared `learning.attention.*` family under the
namespace rules of Vol. 04 §6 — never a side effect of navigation.

### 1.4 Reserved: obligation sockets

One future surface genuinely is a membrane crossing: when the machine asks
the human — a human-answer strategy (Vol. 05 §8), the `awaiting_human` state
(Vol. 13 §5) — the intention is discharged to the surface by a human-task
controller and the human's answer re-enters as the correlated fact. That is
an **obligation socket**: a widget bound to one intention uid, not a display
panel. It arrives with the `WaveSession` layer of the core phase; the panel
contract reserves the slot so the paradigm does not have to bend later.

## Decision 2 — replay-based verification: three instruments, one profile rule

Ground truths: **replay is reading** (Vol. 03 §6.4); re-execution differs by
machine class, so tests substitute deterministic controller doubles and
acceptance runs are recorded, not re-run (Vol. 08 §5); a machine must never
re-discharge intentions from a reloaded log (Vol. 08 §9), continuation being
the recorded open decision (Vol. 11 §6.1).

### 2.1 Instrument one — reading fixtures

A recorded session (`.jsonl` + meta sidecar — the wire format of Vol. 03 §6,
already what `var/sessions/` holds) is copied into a fixtures directory and
becomes a golden input to every derivation: `project()`, `buildCanvas()`,
trace summaries, panel models. No machine, no membrane, no network are
involved **by construction** — a derivation cannot reach a controller.
Expensive-to-reach UI states (deep scenes, candidates awaiting review,
stalls, failures) become cheap goldens. This is the learning-shell
application of the golden-log discipline (Vol. 14 §2): for deterministic
profiles the log itself is the golden; for semantic recordings the
derivation outputs are.

### 2.2 Instrument two — continuation fixtures

A live session started from a recorded log — "continue from a chosen
state". In v0 this is sound by construction: `loadSession` replays the JSONL
into memory; the simulated machine holds no registers (it re-derives per
command through `project()`); commands only append; nothing is ever swept
again. In the core phase the rule is fixed now: rehydration rebuilds
registers by replay with `MEMBRANE.CURSOR` initialised to `|LOG|`, so
recorded intentions are never re-swept and never re-discharged (Vol. 08 §9).
Unanswered intentions in the fixture stay honestly unanswered — a
settled-unfinished fixture is an admissible and valuable test state
(Vol. 08 §7). New intentions whose conditions come to hold after
continuation (a barrier settling on the next command) may lawfully project:
that is machine behaviour, not replay.

The worry inside question 2 — "inference controllers must not run to
external APIs during replay" — dissolves: replay never propagates, so
controllers never see replayed tuples. "Switching back to normal service"
requires no switch: loading is reading, and the same live assembly simply
continues appending.

### 2.3 Instrument three — port doubles

Where a test must drive the machine live (commit new turns and observe new
windings), the inference port is substituted **at assembly**:

| Profile | Adapter | Behaviour |
| --- | --- | --- |
| `live` | Together adapter | real discharges; recorded, not re-run |
| `null` | `NullInference` | deterministic fallbacks in `lib/guide.ts` |
| `scripted` | recorded-answer adapter | answers consumed from a script per request; exhaustion is an expected failure or an explicit deterministic fallback — never a silent network call |

Recording at the port seam (`{system, user} → content`, in call order) turns
one semantic session into a deterministically re-runnable one — the machine
class flip of Vol. 08 §5.

### 2.4 The profile rule

The profile — port adapter, store adapter, class marker — is fixed at
assembly, per session or process, inspectable in the session meta
(ADR-004 Decision 6), and never changes mid-wave: no committed fact may
install, enable, disable, or re-credential a controller (Vol. 07 §2.6,
Vol. 12 §9–10). "Replayed then live" is not a mode switch, because replay
was never a mode of the controllers in the first place.

Fixture format (advisory): `fixtures/sessions/<name>.jsonl` +
`<name>.meta.json` + optional `<name>.script.json`. Fixtures are recorded
from real sessions rather than handcrafted, except minimal negative anchors;
a handcrafted fixture must still satisfy the wire rules (dense offsets,
JSON-representable payloads).

## Decision 3 — the scene figure has three strata; one lid per bind

### 3.1 The attribution, as the specification already states it

An unfold scene records three causally distinct acts, and the log already
separates them precisely:

1. **Admission** — `learning.turn.submitted` + `learning.bind.selected`:
   deterministic interpretation of the human gesture
   ([first-turn-log-protocol.md](./first-turn-log-protocol.md)). No oracle
   is involved; the human authors purpose, emphasis, and the act itself.
2. **Sowing** (authoring) — the scene bind's `service.request` (uid); the
   oracle supplies the plan — *content only* (Vol. 01 §2.5); the declared
   template fixes record shapes, ids, collect rules, sockets, and emit
   targets (Vol. 06 §7; in v0 `expandScenePlan` in `lib/machine.ts`); every
   sown record and head fact carries `emittedBy: uid`; the terminal
   delegated publication closes the intention. Neither "the AI produced the
   knots" nor "the bind produced the knots" is complete: **form is the
   bind's declared template; content is the world's; commitment is by
   proxy** (Vol. 06 §6). The answer to "have we arrived at an AI authoring
   engine?" is that the specification already names it — the planner
   service (planner descriptor, Vol. 06 §7, Vol. 10 §6; Vol. 15 §8),
   played in v0 by `lib/guide.ts` inside the machine's template (the
   documented liberty of ADR-004 Decision 4), and becoming the
   `GuideController` on the membrane in the core phase. What is load-bearing
   is not a new engine but the standing discipline: declared form, supplied
   content.
3. **Harvest** — the close bind is a *different* bind (the "closing harvest
   bind" of Vol. 06 §7) with its own rendezvous, uid, and publication. The
   integration candidate is the close bind's produce, never the scene
   bind's.

Knot windings belong to neither bind: `inference.*` tuples correlate by
`knotId` + uid (Vol. 04 §4) and hang under knot cards as winding tacts.

### 3.2 The UI rail

One lid per bind, after the vault-of-lids derivation (Vol. 08 §8):

- the **scene bind's lid** shows admission → intention → sown topology
  (grouped under its `emittedBy` stamp and presented as *authoring* —
  typographically distinguished, per thinking rail 6) → terminal
  publication → presented sources;
- the **close bind's lid** shows demands → barrier state → publication
  (candidate or return);
- **winding tacts** render under their knots, joined by correlation, never
  by adjacency (Vol. 03 §3.3).

The current flat "produced by this bind" list in the focus view is
superseded by a strata derivation in `lib/` (a consequence below). Flattening
the three strata into one list was the defect question 3 detected: it
erased the boundary between the deterministic admission, the oracle-fed
sowing, and the close bind's own harvest.

## Consequences

1. **Migration targets in the environment** (non-binding until the
   implementation instruction, listed in
   [ui-panel-rails.md §8](./ui-panel-rails.md)): the trace summary registry
   moves from `components/workbench.tsx` into `lib/`; `producedTuples` is
   replaced by a scene-strata derivation; the composer context chip and
   placeholder draw from one source; panel manifests appear as code
   constants beside their derivations.
2. **The rails are built next as reading surfaces** under the panel
   contract; the right rail grows toward the attention queue
   ([manifest-of-conscious-movement.md §7](./manifest-of-conscious-movement.md)).
3. **Testing gains a fixtures directory and the scripted port adapter**;
   the session meta already carries the class marker the profile rule
   needs.
4. **The swap surfaces of ADR-004 are unchanged.** This ADR constrains how
   surfaces read and how tests drive; the session API and machine port are
   untouched.

## Open questions

1. SSE increments: panel derivations are single-pass folds today; fixing the
   fold form (`init` / `step` / `result`) as a stated contract would make
   incremental SSE consumption mechanical (ADR-004 open question 1).
2. Attention telemetry: whether a `learning.attention.*` family is ever
   wanted, and under which consent and retention policy.
3. Obligation sockets: their arrival is tied to `WaveSession` and a
   human-task controller; the panel contract reserves the slot only.
4. Fixture governance: recording provenance, refresh cadence when the
   authoring templates change, and whether provider-generated content in
   fixtures needs marking or redaction.
