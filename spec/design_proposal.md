# Design proposal: the centre dock on snapshot contracts

**Status:** Working analysis, 2026-07-18 — a living document; understandings
are appended as they form. **The working canvas of the `guild.centre-dock`
cycle** ([capabilities/seed_centre-dock.md](../capabilities/seed_centre-dock.md)):
while the cycle is open this document governs and the seed follows; at
close the seed receives the learned detail and this canvas retires to
[spec/history/](./history/README.md) (PROTOCOL_DEV, the cycle). Anchors:
ADR-008 Decision 3 (the trace trajectory), ADR-009/ADR-010 (projectors,
contracts), HUID 01–02, the refimpl book
([huid/refimpl](../huid/refimpl/00-map.md)).

## 1. The questions under analysis

1. Is the central panel one UI module, two, or three?
2. How many projectors does it need on the backend?
3. What *is* a view (focus / canvas / log), given that each shows nothing
   but tuples — in a different UI form, selected by a different backend
   filter?
4. How do dynamic updates reach the centre from its projectors?

## 2. Answer 1 — the centre is a dock; the views are three modules

The "central panel" is not a module at all: it is the **centre dock**, and
the carousel policy (exactly one active view, the switch rendered from the
registry — HUID 01 §6) is host chrome. Focus, canvas, and log are **three
separate modules**, because they differ in every dimension the manifest
declares:

| Manifest axis | focus | canvas | log |
| --- | --- | --- | --- |
| consumes | `scene-detail` | `produced-texts` | `trace` |
| params | `focus.bindId` | block-kind toggles | actor filter, expansion |
| commits | `evidence`, `readSource`, `deepen`, `markUnknown`, `accept` | `accept` | — |
| navigates | crumbs, child links, composer target | open-bind, composer target (reframe) | offset disclosure |

The deciding argument is the motherboard diff test (HUID 03 §3): a fourth
centre view — the maturity map over the existing `scene-registry`
contract — must land as one module directory touching none of the three.
A single "centre module with three modes" would have to be edited for
every new view and fails the test; a two-module compromise (document-like
focus+canvas vs technical log) fails it too and collapses genuinely
different capability boundaries (different contracts, params, gestures).

**Formed understanding:** *dock = slot policy (host chrome); view =
module; the switch is derived from the registry.* "The centre" names a
place, not a thing.

## 3. Answer 2 — three projectors, cut by data product, not by view

The rule (ADR-010): a projector forms a **data product**; any number of
views may consume it. Inventorying what the three views actually consume
yields three products — the 1:1 correspondence with today's views is
incidental, and the maturity-map example (a centre view over the *rail's*
contract) proves contract ≠ view.

### 3.1 `scene-detail` — the figure product (kneaded shape)

Everything the focus lens needs, for **all** scenes (parameter-independent;
`select` picks the focused one client-side — the fold/select seam of
HUID 02 §1 is exactly the wire cut):

- per scene: identity and links (`bindId`, `parentBindId`,
  `sourceKnotId`), title, purpose, status, close bind and `returnTo`,
  barrier tally, presented sources;
- per knot: question, angle, grade/threshold, ready/unknown/returned,
  wound state text, evidence excerpts, read sources, winding tacts
  (offsets + grades + failures);
- the strata (ADR-005 Decision 3): admission / sowing / harvest as
  summarised offset lists — one lid per bind, formed server-side at last
  (superseding the client-side flat `producedTuples`);
- the candidate: statement, contributions, open questions.

Ancestry (crumbs) derives from the parent links in `select`. Bounded by
nature: a study session holds tens of scenes, not thousands.

### 3.2 `produced-texts` — the document product (append shape)

The canvas blocks, in offset order: integration blocks always; turn,
answer, and evidence blocks as data with kind marks. The view's toggles
are **parameters applied in `select`** — the snapshot carries all block
kinds, the client filters. Block forming is formation: the
`canvasRenderers` registry moves into this projector (a new block form =
a registered former in the projector + a render case in a view — new
information is a formation change, a new look is a presentation change).

### 3.3 `trace` — the record product (append shape)

One row per tuple: offset, actor (learner / machine / world), summary,
kind/factType label, uid. **Payloads are not in the snapshot** — the log
stays bounded on the wire; the raw tuple is one disclosure away through a
Class L endpoint (`GET /api/sessions/:id/tuples/:offset`, a materialised
reading). The `describeTuple` switch becomes this projector's row-former
registry, and the ADR-008 Decision 3 trajectory lands here: matched,
readable templates per factType grow server-side, JSON stays one click
away.

### 3.4 Principles formed

- **Overlapping claims across projectors are normal.** `scene-detail`,
  `scene-registry`, and `trace` all claim `learning.bind.selected`;
  readings are independent, rebuildable, and share the one log — no
  "single owner per factType" rule exists or should.
- **Folds stay parameter-free.** `focus.bindId`, canvas toggles, actor
  filters — all client-side `select`; nothing parameterises the wire or
  the cache.
- **Two shapes of contract life:** *append-shaped* products (rows/blocks
  keyed by offset — `trace`, `produced-texts`) and *kneaded* products
  (cards mutated by later tuples — `scene-detail`, `scene-registry`).
  The taxonomy matters for transport (§5).

## 4. Answer 3 — a view is a lens: (backend filter × UI form) over one truth

Formally: **view = contract × select × view-form**, where the contract's
projector fixes *which tuples participate and what of them survives*
(the backend filter — `reads` + fold), and the module fixes *how the
survivors read* (the UI form). All three lenses preserve offset order and
provenance joins; they re-form truth, never reorder or invent it — the
formation boundary (HUID 00 §5) guarantees that what differs between
views is presentation, not fact.

The three lenses named:

| Lens | Filter (formation) | Form (presentation) |
| --- | --- | --- |
| **focus — the figure lens** | one scene's affinity in depth: knots, strata, candidate | the vault-of-lids lid opened (Vol. 08 §8): cards under a heading |
| **canvas — the document lens** | produced texts and learner material | document flow — the log brought close to a business artefact |
| **log — the record lens** | everything, actor-classified | rows with raw payload one disclosure away |

This answers the question exactly as posed: yes — in every view we see
nothing but tuples; a view is precisely a declared (filter, form) pair,
and adding a lens adds no truth, no mechanism — one contract (if new
information) and one module (if new form).

## 5. Dynamic updates — transporting new states from the projectors

**Interim (now):** after each command ack and on load, the host refetches
the contracts consumed by *visible* modules; server-side, warm projector
caches have already advanced via the commit hook, so a refetch is a cache
read. On a view switch the host fetches that view's contract on first
need. Client guard: a snapshot with `asOfOffset` ≤ the held one is
dropped (monotonicity).

**Target (SSE):** one events channel per session —
`GET /api/sessions/:id/events` — multiplexing **by contract**:
replay-then-live per the machine refimpl 08 §2.3 protocol, each message
`{contract, model, asOfOffset}`. The host subscribes once and routes
models to consuming modules; command responses thin toward acks
(ADR-009 open question 4).

**Delta option (open):** append-shaped contracts admit a natural
increment — `{contract, appendFrom, items}` — because their products only
grow at the tail; kneaded contracts stay whole-snapshot. Not needed at
current sizes; recorded so the taxonomy of §3.4 earns its keep.

## 6. Proposed migration order for the centre

1. **trace** — the simplest contract, and it carries three due reforms
   at once: the row-former registry (ADR-008 D3 templates), the visual
   re-integration of the log into the paper canvas (the dark drawer is an
   archaeological artefact — its skin travelled from a superseded overlay
   pattern; raw payload keeps the dark code-block idiom), and the first
   token migration of the debt ledger (actor colours lifted into theme
   tokens — themes/nestvm-ink §4.1).
2. **produced-texts** — the canvas formers move server-side; toggles
   become select params.
3. **scene-detail** — last, because focus interlocks with the composer:
   knot actions commit through the port, and retargeting the composer
   (answer/challenge/reframe) becomes a **promoted shared parameter**
   (`composer.target`, HUID 01 §4.3) written by centre modules and read
   by the composer module — never a module-to-module call.

Each step follows the refimpl 03 instruments: independent parity oracle
over the fixtures, live smoke including honest refusals, the diff test.

## 7. The tuple presentation factory — forms and widgets

**The idea** (formed 2026-07-18): make it transparent and configurable
where, with which role, and as which widget a tuple renders — resolving
from the specific to the general and stopping at a raw-JSON widget, with
the user able to switch among available representations.

**The cut.** The factory splits exactly along the formation boundary:

- **Form keys are formed server-side.** A projector's former registry
  classifies each offset-anchored item and stamps a `form` key
  (`integration.candidate`, `turn.plain`, `evidence.excerpts`, …) plus the
  fields that survive formation, plus always the offset. What a tuple *is*
  is decided once, surface-independently.
- **Widgets resolve client-side.** A shared widget library (pure
  components keyed by form) plus **per-lens resolution tables**:
  `resolve(lens, form) → ordered widget candidates`, cascading
  exact form → family (`learning.*` generic fact) → **raw JSON** (total
  fallback). The user's representation choice is an ordinary parameter
  selecting within the candidates; the raw-JSON widget is lazy — it
  fetches the tuple by offset (`one disclosure away`, the snapshot stays
  bounded).

**Total coverage property**: no tuple is ever invisible — an unknown
future factType renders through the fallback chain. The log's
completeness against the surface's selectivity, mechanised.

**Simple**: the registries exist in embryo (`canvasRenderers`,
`describeTuple`); form keys are additive contract fields; the raw widget
exists (payload disclosure); representation icons are calm-compatible
inline controls; a new factType renders for free and grows rich by
registration, not by mechanism (Vol. 11 §1 mirrored).

**The four traps** (named so they stay avoided):

1. *The global-table trap* — one tuple→widget map without lens context is
   a god-object; the key is `(lens, form)`, never `form` alone.
2. *The client-classification trap* — widgets must not parse payloads;
   classification lives in projectors only, or formation forks into the
   browser (HUID 00 §5).
3. *Preference sprawl* — preferences are per-form (a bounded set);
   per-offset switches are ephemeral; icons live in the quiet meta line
   or on disclosure, never as standing chrome (HUID 04 §2).
4. *The domain limit* — the factory covers offset-anchored items
   (append-shaped lenses) natively; kneaded cards (knots, scenes) are
   aggregates that *compose* factory widgets inside their disclosures
   (a tact row rendered through the same registry), not instances of it.

**Fit**: declared form / supplied content at the presentation face; the
form-key vocabulary is a light mirror of the factType namespace and
inherits its additive discipline (Vol. 04 §6); the template↔JSON switcher
is the reflexive bootstrap made interactive (the trace as a live lesson in
reading wave logs); ADR-008 Decision 3 becomes the general law rather than
a trace-only reform. Point-wise customisation is structural: growth = one
former (server) + one widget (client) + one resolution-table line.

**Landing order**: the trace lens first (its row-formers are already the
planned carrier), then produced-texts; form keys enter those two contracts
additively; focus composes factory widgets inside knot/strata disclosures
later.

## 8. The target shape — what we are converging to

**Concept.** One truth (the wave log) → the formation plane (projectors,
one per data product, stamping form keys) → a thin wire (snapshots
`{model, asOfOffset}`; later one SSE channel multiplexed by contract) →
a thin host (transport, parameter space, port, docks — nothing else) →
modules (select + widgets resolved by `(lens, form)`, cascading to raw
JSON) → human gestures returning as declared facts through two verbs.
What the human sees is formed once, surface-independently; the UI is
replaceable without touching the nest (HUID 00 §5).

**Architectural completion picture.** `workbench.tsx` dissolves into
`host/` + registries; every visible surface is a module; every module is
contract-backed; the client holds no tuple replica (the full-log GET
retires from panels — archive and Class L instruments keep it); the
counted invariant stands: one feed, one parameter space, two verbs, five
docks.

**Growth is registration, everywhere** — the table that must stay true:

| Wanted | Registration site (and nothing else) |
| --- | --- |
| a new fact family | machine template (+ projector claims where read) |
| a new data product | contract file + projector + one registry line |
| a new lens / view | module directory + one centre-registry entry |
| a new block / row form | one former (plane) + one widget (client) |
| a new representation | one widget + one resolution-table line |
| a new gesture | product body + machine handler + `commits` entry |
| a new world capability | membrane adapter + configuration record |

**The recurring form.** The architecture self-repeats the figure the UI
shows: choosing a bind in focus with its knots beneath is also how the
platform itself is built. Formally: every device unit re-instantiates the
machine's accumulator figure — **declared collection → accumulation →
publication** — at its own radius. A projector is knot-shaped (claims are
its collection rules, the fold is its winding, the snapshot its
understanding); a contract publication is bind-shaped (a gathered scope
published as one integration under a declared form); a module gathers
`(model, params)` and publishes a rendering. This is not analogy but the
construction rule, and it yields the fractal test of §9: a piece whose
three parts cannot be named is not on the rails. The full cross-level
statement — twelve instances, the degenerate rule, and the guards — is
[meta-bind-01](../meta/meta-bind-01.md).

## 9. Drift criteria

**Result level** (what the person experiences):

1. **Fixture parity** — the independent oracle stays green; formed models
   are byte-identical across refactors.
2. **No invisible tuples** — the record lens shows everything; raw truth
   is never more than one disclosure away.
3. **Honest states surfaced** — refusals verbatim and inline; stalls and
   unanswered intentions visible; a silent failure anywhere is drift.
4. **One truth across surfaces** — the same count, status, or grade shown
   in two places never diverges (divergence is the second-truth symptom).
5. **Replay identity** — a refresh reconstructs the same screens from the
   log and snapshots alone.
6. **The calm budget holds** — no overlays appear, resting-state element
   counts do not creep, icons do not become standing chrome.

**Architecture level** (how the code moves):

1. **The import DAG** — `huid` never imports machine/membrane; a client
   import of `projectors/` fails the build; client imports of
   `nest/readings` shrink monotonically and reach zero at completion
   (only the machine and the plane form).
2. **The diff test** — every addition touches its registration site only;
   a host or plane edit for a feature is drift (a recorded layer widening
   is not).
3. **Manifests truthful** — `reads` executable and single-source;
   `consumes` equals actual fetches; commits/navigates match controls.
4. **Classification only in projectors** — client code never parses
   payloads (displaying a fetched raw tuple is not parsing).
5. **Contract discipline** — additive evolution; breaking change = new
   id; append/kneaded shape declared.
6. **Drop-and-rebuild** — any server-held panel state is reproducible by
   `fold(replay)` byte-identically; state that survives a rebuild
   differently is a second truth.
7. **Parameters never cross** — not onto the wire, never into the log.
8. **Two verbs only** — a module calling `fetch` is drift.
9. **The counted invariant** changes only by recorded widening.

### The persona network — self-check questions

The third level of drift detection, in the tradition of the seven
matrices (Vol. 14 §4, the Service dimension crossed with the layer's
personas; applied as §4.8 prescribes: every cell has a demonstrable
answer or a recorded gap — pretending is the only non-conforming
option). Drift is a question that used to have an answer and lost it.

**The panel author asks (human or model alike):**

1. Where exactly do I write this? — one module directory; the routing
   table (`src/README.md`) names it without my guessing.
2. Where does my data come from? — a contract; and if none fits: one
   contract file, one projector, one registry line.
3. Who forms my data, under which frames? — a projector: claims from its
   own manifest, a pure fold, a snapshot with `asOfOffset`, rebuildable
   from the log, server-only.
4. What may my view do? — render model fields and speak two verbs;
   never fetch, never classify.
5. How do I know I broke nothing? — `tsc`, the parity oracle, the diff
   test: my change touches only my registration sites.
6. Is my manifest truthful to a reader who never opens my code? —
   `consumes` equals my fetches; `commits` equals my controls.
7. Rail 10 still answers: which tuples exist, which are created, which
   projection shows them — for my panel specifically?

**The platform architect (configurator) asks:**

1. Can I see, without reading implementations, which contracts exist,
   who forms each (claims), and who consumes each? — manifests as the
   complete review surface.
2. Is widget placement configuration, not code? — the resolution table
   `(lens, form) → widgets` is a declarative artefact; re-routing a form
   to another widget is a table line, never an edit to widget or former.
3. Can I predict the exact blast radius of adding or removing a panel,
   widget, or contract? — the diff test, including removal restoring
   byte-identical models elsewhere.
4. Can I trace any pixel to its formation? — widget → form key →
   projector → claims → tuples, every step named and inspectable.
5. Are the two sides mechanically separated? — the `server-only` guard
   and the import DAG, not convention.
6. Do configurations compose without coordination? — registries are
   additive; overlapping claims are normal; no factType has an owner.

**The learner's experience asks (silently):**

1. Does the same fact look consistent wherever it appears — same form,
   same widget family — and is its truth identical across surfaces?
2. Where representation varies, is it my visible, per-place, reversible
   choice — and does choosing ever change the truth? (It must not.)
3. Is the raw record one disclosure away from every representation?
4. Do I ever need to know which widget, module, or contract serves me?
   — plumbing surfacing to the learner (contract names in errors, one
   panel dead while others live) is drift.
5. Can I predict what a control does from its weight and place before
   reading its label? (HUID 04 §5.)
6. Does anything move, appear, or interrupt unbidden? (HUID 04 §4.)

**The fractal test (any persona, any addition):** name the piece's
declared collection, its accumulation, and its publication (§8, the
recurring form). A piece whose three parts cannot be named is off the
rails — however useful it looks.

**Known gaps against this network** (recorded, not pretended): the
resolution table and the learner's representation choice await the
factory (§7) — the criteria deliberately precede the mechanism; until
then widget placement is code-level constants, and the configurator's
question 2 answers "not yet, by design, tracked here".

## 10. Preparation — the pre-implementation refactor

Bounded pass, not a rewrite. Ordered, each with its acceptance:

- **P0 — the regression net in-repo** *(done 2026-07-18)*:
  `scripts/parity/scene-registry.mjs` + `npm run parity`. Executing P0
  immediately caught a real defect: the store's in-memory cache did not
  revalidate against the JSONL file, so a second workbench process saw a
  stale session (104 of 141 tuples). Fixed at the wave level: the record
  carries `logBytes` and `loadSession` re-reads when the file has grown —
  the cache is a cache, never a second truth (reloading is reading,
  Vol. 03 §6.4; projector caches catch up lazily over the reloaded
  record). Fixture note: exactly one recorded session exercises
  `*.failed` facts — thin but present; enrich when a stall next occurs
  naturally (fixtures are recorded, never handcrafted).
- **P1 — contract-generic host transport**: replace the single
  `depthPanel` state with a contract-keyed map and one refresh routine
  over the visible modules' `consumes`. Acceptance: adding a contract is
  one list entry, zero new state code.
- **P2 — a named parameter space and one port object**: `params` as one
  record with the host keys, `navigate(patch)` funnelling every write;
  modules receive `{model(s), params, port}` and nothing else.
- **P3 — the centre carousel from a registry**: the switch renders from
  `centreViews`; the three current views enter as legacy entries until
  each extracts. Acceptance: the maturity map lands as entry + module.
- **P4 — the raw-tuple endpoint** (`GET /api/sessions/:id/tuples/:offset`,
  a Class L materialised reading): the precondition for a bounded trace
  contract and the lazy raw-JSON widget.
- **P5 — the widgets seam**: `src/huid/widgets/` with the resolution-table
  type and the lazy raw-JSON widget as the first entry — the factory's
  total fallback exists before any template does.

Then implementation per §6: the trace contract first (form keys + row
formers + the paper restyle), produced-texts second, scene-detail last.

**Deliberately not now**: the machine split (mapper → product — waits for
the core swap); left rail and strip migration (after the centre); SSE
(after two contracts prove the refetch pain); a test framework (the
scripts suffice); drawer CSS cleanup (dies with the trace restyle).

## 11. Open questions (living)

1. `scene-detail` granularity: one kneaded product for all scenes
   (current proposal) vs per-scene entries with per-entry `asOfOffset`
   once sessions grow deep.
2. The payload endpoint shape: `tuples/:offset` as proposed, or a range
   form for the log lens's virtualised scrolling.
3. Whether `produced-texts` and `trace` share their offset-ordered
   "row/block" former infrastructure in the plane, or stay independent
   registries (independence is the default; sharing only if a third
   append-shaped contract appears).
4. `composer.target` naming and its promotion into the host key registry.
5. A `session-meta` contract for the strip (counters, result presence) —
   outside the centre, same pattern.
6. Form-key vocabulary governance: where the registry of form keys lives
   (beside the contracts?) and how collisions are reviewed — the light
   mirror of Vol. 04 §6.
7. Representation preferences: per-form parameter naming, whether any
   preference deserves promotion to a shared host key, and whether
   preferences persist beyond the session (they are navigation, never
   truth — persistence would be a convenience cache at most).

## 12. The gate register — Phase 7 completion (2026-07-19)

Appended at the implementation gate, closing the Responsibility phase:
the touched sources as hard guidelines, the collision register, owners on
§11, the adjacency register, and the decisions the go ratifies.

### 12.1 Hard guidelines — touched sources and the constraint each imposes

- **Vol. 02 §4.7** — registers are never programme-addressable: every
  model field derives from committed tuples only, never from machine
  state.
- **Vol. 02 §5.1** — no retroactive delivery: no centre surface implies
  re-delivery of facts committed before a registration.
- **Vol. 03 §3.3–4** — provenance joins only, never adjacency, in every
  fold and former.
- **Vol. 03 §8** (extended by CONVENTIONS §1.4) — bounded at formation:
  payloads never ride the panel wire; full bodies live behind
  one-disclosure endpoints.
- **Vol. 04 §1.2** — tolerant reading: an unknown factType rows through
  the generic former, never fails. **§6** — the form-key vocabulary is a
  light mirror of the factType namespace: additive, collision-reviewed;
  projectors read protocol facts and never forge them.
- **Vol. 08 §7** — honest states are model fields; **§8** — everything
  shown derives from the log; a missing datum widens the protocol first.
- **Vol. 14 §1** — the whole centre stays Class L; **§3** — behaviour
  and documentation land in the same work item; **§4** — the seven
  matrices close the arc.
- **Vol. 15 / Art. 13** — a terminology pass on every new identifier.
- **HUID 00 §5 / Art. 6** — formation server-side, presentation
  client-side; the `server-only` guard is mechanical.
- **HUID 01** — §2 feed rules; §4 the parameter space (shared keys enter
  only by recorded promotion); §6 the carousel renders from a registry;
  §7 the projector plane rules.
- **HUID 02** — the module contract entire: pure single-pass folds,
  declared gestures, station rules, physical enforcement, panels never
  infer.
- **HUID 03 §1–4** — the conformance checklists, the motherboard diff
  test (also the removal/flag acceptance), fixture verification.
- **HUID 04** — the load contract: budget, disclosure over dialogs, no
  unsolicited interruption, weight by kind of act, raw truth one
  disclosure away.
- **ADR-004** — the session API and response envelope stay binding:
  batch acks preserved; the idempotency path (clientTurnId) left
  unobstructed.
- **ADR-005 D2/D3, ADR-008 D1/D3, ADR-009, ADR-010** — instruments and
  strata; the request path and the trace trajectory; the
  projector/contract shape.
- **themes rules 1–6** — raw values only in token definitions; accents
  carry act semantics; widgets declare class scope and consumed tokens;
  ledger items retire with the sections they live in.
- **meta-bind-01** — every addition names collection · accumulation ·
  publication; degeneracy is named, never hidden.

**Verdict:** no widening is needed; every fragment lands as a
registration on existing rails.

### 12.2 Collision and drift register

1. **«plane»** — a reserved machine term (Vol. 15 §5; HUID 00 §7)
   reused across the device layer in qualified compounds («the projector
   plane», «the formation plane») without a recorded amendment.
   Resolution, ratified at this gate: HUID 00 §7 is amended in this work
   item — bare terms stay machine-owned; qualified compounds naming
   device-side concepts are sanctioned.
2. **«canvas»** — Vol. 15 §3 holds «understanding canvas (*aka*
   canvas)»; the document lens shares the bare word. Disambiguation
   rule: in machine-adjacent text prefer «the document lens»; the guild
   id stays `centre-dock` for this exact reason (seed provenance note).
3. **«scene head»** (seed §4.4) — ambiguous beside sown head facts; the
   seed wording becomes «scene heading» at the cycle-close seed update.
4. **Landed-reference drift.** Recorded, not edited (ADRs are frozen):
   ADR-009 consequence 4 cites «HUID 01 §8» — the projector plane landed
   as §7. Corrected in this work item (living volumes): HUID 04 §3.3
   (ADR-008 D4 → D3); HUID 01 §3 source paths (`lib/…` →
   `src/nest/readings/…`).
5. **«lens»** — this proposal's term (contract × select × view-form) is
   distinct from the «semantic lenses» of the adjacent multidimensional
   drafts (cross-source-concept-analysis §2), and the three centre
   lenses are presentation forms — not epistemic levels (L0/L1/L2) and
   not depth.

### 12.3 Owners on the open questions (§11)

1. `scene-detail` granularity — system; default stands (one kneaded
   product); revisited at the scene-detail grounding if fixtures show
   depth pressure.
2. Payload endpoint shape — system; single-offset lands with P4; the
   range form waits for virtualised scrolling in the record lens.
3. Former-infrastructure sharing — **answered at this gate** (§12.5.1).
4. `composer.target` — human; **ratified by the go**: the name enters
   the host key registry at P2 with the absent → plain default
   (§12.5.3).
5. `session-meta` contract — system; after the centre, same pattern.
6. Form-key vocabulary governance — system; the vocabulary lives beside
   the contracts (each contract file declares its keys); additions are
   collision-reviewed in this register.
7. Representation preferences — system for session-scoped parameters
   (never persisted); any future persistence is the human's decision.

### 12.4 Adjacency register — planned facts and tensions this cycle must not obstruct

- **`learning.integration.revised` + supersession seams** (manifest of
  conscious movement §4/§7.1; ADR-004 D1 planned family): the
  produced-texts form keys stay additive-ready; no block shape may
  preclude a revision/superseded kind.
- **The command journal and idempotency keys** (ADR-004 D2.1;
  open-bind-architecture command boundary): P1/P2 preserve the batch-ack
  flow and leave `clientTurnId` insertion trivial.
- **The attention queue** (manifest §7.3; ADR-009 context): scene-detail
  keeps the candidate panel separable (seed §10).
- **Qualification badge language** (open-bind product OQ5) — owner:
  human; arises at the document lens; until then only the existing kind
  marks.
- **`learning.signal.submitted`** (first-turn-log-protocol OQ1) — if it
  ever lands, trace claims grow additively; no action now.

### 12.5 Decisions the go ratifies

1. **The row-former registry is shared in the plane** from the
   scene-detail step — §11.3 answered: the third append-shaped consumer
   arrived (scene-detail's strata and tact rows, 2026-07-19 analysis).
2. **A capability flag over the registries** is an acceptance line of
   P3/P5: seating is filterable configuration; «off» is verified by the
   removal test (HUID 03 §3) — models of remaining surfaces
   byte-identical over fixtures.
3. **`composer.target`** is the promoted shared key (HUID 01 §4.3):
   written by centre modules, read by the composer; absent → the
   composer rests in plain mode — no writer, no coupling.
4. **Widgets never fetch.** The lazy raw-JSON widget receives a
   host-injected `resolveTuple(offset)` reader over the P4 endpoint —
   drift criterion «a module calling fetch is drift» stays literal.
5. **Fold expression stays source code in the plane** — the declarative
   fold-strategy successor remains recorded (guild-seeds §6.2),
   reaffirmed.

### 12.6 The go

2026-07-19 — the human's explicit go received (the working-mode gate).
Mechanical gate at entry: `tsc` clean; parity 18 sessions, 0 failures.
Implementation proceeds P1 → P5, then trace → produced-texts →
scene-detail; each step admits, sows, grounds, seats, and retires its
legacy surface per §6/§10 and seed §9.

## 13. Landing note (2026-07-19)

The implementation landed the same day the gate opened: P1–P5, then
trace → produced-texts → scene-detail, each step closing with the
instruments green (tsc; four independent parity oracles over 18 recorded
sessions; live smoke including honest refusals; the diff discipline —
every addition entered at registration sites only). The learned detail
is back-propagated to the seed (§11 there, version 0.2.0,
manifested-in-source); the deviations and interim liberties are named
there and in the module lids. One seating omission during the work —
`centre.focus` missing from the host's seated-modules list — was caught
by the live smoke and fixed by the single line P1 promised.

Open questions that remain live: §11.1 (granularity), §11.2 (range
endpoint), §11.5 (session-meta/shelf contract — now also carrying the
focus lens's injected props), §11.6–7; §11.3 and §11.4 closed at the
gate (§12.5.1, §12.5.3). Deliberately still not now: SSE, left rail and
strip migration, the machine split.

**This canvas is ready to retire to spec/history/ upon the human's
acceptance of the arc (Art. 9) — until that acceptance it remains the
governing document of the open cycle.**
