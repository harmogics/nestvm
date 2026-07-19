# seed: guild.centre-dock — the central canvas guild

## 1. Identity

- **kind:** guild · **id:** `guild.centre-dock` · **version:** 0.2.0
- **status:** manifested-in-source (cycle closed 2026-07-19: the arc
  accepted, the canvas retired to
  [spec/history/proposal-centre-dock.md](../spec/history/proposal-centre-dock.md),
  source pinned at commit `4b3d74ee367ea157edd90219b83c5289ae7d7794` —
  **this seed is now the governing description**, FORMAT §3.1)
- **provenance:** the NestVM study workbench, this repository's
  collaboration, 2026-07-18; the human-facing name is "the central
  canvas" — the machine name stays `centre-dock` because the centre is a
  dock, not a module, and one of its lenses is already called canvas.
- **licence:** the repository's blanket licences; recorded sessions
  referenced as fixtures stay outside them (fixtures licensing note).

## 2. Purpose (the persona triple)

- **The system** gains its richest surface as three declared lenses over
  one truth, formed server-side, updated by contract snapshots — no
  client formation, no second truth, total tuple visibility.
- **The architect** gains three data products with declared formation,
  a widget factory with a raw-JSON floor, and growth-by-registration
  everywhere: a fourth lens or a new representation is an entry, never a
  mechanism.
- **The operator** gains the figure lens (one scene in depth), the
  document lens (produced texts approaching a business artefact), and
  the record lens (everything, actor-classified, raw one disclosure
  away) — consistent, calm, honest about every stall and refusal.

## 3. The fractal passport

- **collection:** the tuple strata claimed by the guild's three
  contracts (bind lifecycle, publications, turns/answers/evidence, the
  full stream for the record lens) — declared per projector, enforced by
  `matchesReads`.
- **accumulation:** three projector folds — kneaded `scene-detail`,
  append `produced-texts`, append `trace` — plus the client-side
  zero-depth `select` of each lens module.
- **publication:** three lens modules seated in the centre dock's
  carousel, rendering through the form/widget factory with the lazy
  raw-JSON fallback; every model field traceable to formation.

## 4. Member capabilities

### 4.1 `contract:scene-detail` (kneaded)

All scenes in depth, parameter-free; `select` picks the focus.
Per scene: identity and links (`bindId`, `parentBindId`,
`sourceKnotId`), title, purpose, status, close bind and `returnTo`,
barrier tally, presented sources; per knot: question, angle,
grade/threshold, ready/unknown/returned, wound state, evidence excerpts,
read sources, winding tacts (offsets, grades, failures); the strata per
scene (admission / sowing / harvest as summarised offset lists — one lid
per bind, ADR-005 D3); the candidate (statement, contributions, open
questions). Reads: the union of today's `scene-registry` claims plus
`learning.knot.seeded`, `learning.answer.submitted`,
`learning.source.presented`, `learning.evidence.registered`,
`inference.request/response/reasoning`, `sys.knot.ready`,
`learning.knot.marked`, `learning.turn.submitted` (root material),
`service.request`. Joins: `bindId`, `knotId`, `uid`, `emittedBy`,
`parentBindId`.

### 4.2 `contract:produced-texts` (append)

Blocks in offset order carrying form keys: `integration.candidate` /
`integration.returned` / `integration.value` (accepted), `turn.plain`,
`answer`, `evidence.excerpts`. All kinds always formed; lens toggles are
client `select` parameters. The block-former registry is the projector's
inner registry (formers claim tuples; first claim wins in declared
order).

### 4.3 `contract:trace` (append)

One row per tuple: offset, actor (learner/machine/world), summary, kind
or factType, uid, form key. **No payloads on the wire** — bounded rows;
raw truth through the `tuples-by-offset` dependency (§6). The row-former
registry is where matched templates grow (ADR-008 D3); an unmatched
tuple still rows through the generic former — total coverage.

### 4.4 `module:centre.focus`

Consumes `scene-detail`. Params: `focus.bindId`. Commits: `evidence`,
`readSource`, `deepen`, `markUnknown`, `accept`. Navigates:
`focus.bindId`, `centre.view`, `composer.target` (promoted shared key —
§6). View intent: the opened lid — scene heading, strata disclosure, knot
cards composing factory widgets in their disclosures, candidate panel.

### 4.5 `module:centre.canvas`

Consumes `produced-texts`. Params: block-kind toggles. Commits:
`accept`. Navigates: `focus.bindId` + `centre.view` (open its bind),
`composer.target` (reframe). View intent: document flow of factory
widgets; quiet meta lines carry representation icons where a form has
alternatives.

### 4.6 `module:centre.log`

Consumes `trace`. Params: actor filter, offset disclosure. Commits:
none. Navigates: disclosure only. View intent: **paper-integrated** rows
(the dark drawer is retired; actor colour as a hairline rule, mono type;
the raw payload keeps the dark code-block idiom on disclosure).

### 4.7 `form:centre-forms`

The form-key vocabulary of §4.2–4.3 with widget hints and resolution
defaults per lens; the **lazy raw-JSON widget** registered as the floor
of every chain. Representation preferences are per-form parameters.

## 5. Ideology payload

The three lenses are one truth re-formed, never reordered (offset order
and provenance joins preserved); a view = contract × select × view-form;
templates front the record and never replace it — JSON one disclosure
away; calm binds (load budget, disclosure over dialogs, refusals
inline); the four transitions never collapse; honest states are model
fields, not styling.

## 6. Dependencies and grants

**Dependencies** (checked at admission): the `scene-registry` contract
(manifested); the host's snapshot transport generalised per contract
(preparation P1); the named parameter space with `focus.bindId`,
`centre.view` and the promoted `composer.target` (P2); the centre
carousel registry (P3); the `tuples-by-offset` Class L endpoint (P4);
the widget seam with the raw-JSON floor (P5); fold expression: today as
source code in the plane — the declarative fold-strategy successor is
recorded (guild-seeds §6.2); the theme token vocabulary
([themes](../themes/README.md)) — this guild's widgets consume tokens
and act-weight classes only, and its lenses inherit the field; the sole
accent semantics it relies on is the terra rule (acceptance moments).
**Grants:** none — this guild needs **no** `controller-need`: it crosses
no membrane. A presentation guild is grant-free by design.

## 7. Fixtures and trial

`fixtures/sessions/` recorded logs; the independent parity method
(derive expectations from raw JSONL by a deliberately different path
than the projector's joins — the `scripts/parity/` pattern) applied per
contract; golden `select` outputs per lens over the fixtures; live smoke
including honest refusals; the diff test on each seated module.

## 8. Applicability and failure examples

Fits study-session workbenches on the Nest wire format with sessions of
tens of scenes and thousands of tuples (kneaded `scene-detail` is
whole-snapshot: known to mis-fit if sessions grow to many hundreds of
scenes — the per-scene `asOfOffset` open question). The trace contract
mis-fits raw firehoses without actor semantics. Not applicable where the
target lacks the session command API (gestures would have no port).

## 9. Manifestation and degradation

**Order** (from the analysis §6/§10): preparations P1–P5 adapt the
target; then trace → produced-texts → scene-detail; each step admits
(tsc + manifests), sows (contract + projector + module), grounds
(fixtures + parity + smoke), seats (registry entries), and retires its
legacy inline surface. **Degradation, honest:** without the factory —
generic widgets render every form; without `tuples-by-offset` — raw
disclosure states its absence (never silently hides the affordance);
without SSE — refetch per command ack; a missing member contract leaves
its lens unseated and the carousel simply shorter — never a dead tab.

## 10. Open questions

Inherited live from the analysis (§11: scene-detail granularity, payload
endpoint shape, former-infrastructure sharing, `composer.target` naming,
session-meta strip contract) plus guild-specific: whether `centre.focus`
splits its candidate panel as a fourth member module once the attention
queue lands.

## 11. Manifestation record (2026-07-19)

Landed in source per §9's order — P1–P5, then trace → produced-texts →
scene-detail; every step admitted (tsc + manifests), sowed, grounded
(fixtures + an independent parity oracle per contract — four oracles,
18 recorded sessions each, zero divergences), seated (registry entries)
and retired its legacy inline surface. Deviations from this seed as
declared, named:

1. **Tact rows carry `deltaCount`, never delta bodies** — bounded at
   formation (CONVENTIONS §1.4) tightened over §4.1's "winding tacts".
2. **Knot answers ride the contract** (`answers[]`) though the lens does
   not render them yet — the reads of §4.1 kept truthful.
3. **`integration.value` is a presentation form**: formed in `select`
   from the snapshot's kneaded `accepted` map — the block list itself
   stays append-pure (delta-ready, proposal-centre-dock §5).
4. **The row-former registry is shared in the plane**
   (`src/huid/projectors/row-formers.ts`) — §11.3 of the analysis
   answered at the gate (§12.5.1): trace rows and scene strata form
   identically; both lenses route `row.*` to one shared row widget.
5. **Widgets never fetch**: the raw-JSON floor reads through the
   host-injected `resolveTuple` over the P4 endpoint (§12.5.4).
6. **Interim liberties with successors**: the corpus catalogue and the
   declared-sources shelf reach `centre.focus` as host-injected props
   until a shelf/session-meta contract lands (§12.3.5); the pre-scene
   state renders in the host, which still holds the session subject.
7. The dark drawer is retired; actor lanes are theme tokens
   (`--actor-*`, nestvm-ink §4.1 ledger item 1 closed); the raw-record
   dark idiom is `--code-ground`/`--code-ink` on disclosure only.

Fixtures: `fixtures/sessions/` unchanged (recorded, never handcrafted);
oracles: `scripts/parity/{scene-registry,trace,produced-texts,scene-detail}.mjs`
behind `npm run parity`.
