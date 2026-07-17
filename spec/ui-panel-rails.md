# UI panel rails: reading surfaces and fact factories

**Status:** Working rails document, 2026-07-17 — companion to
[ADR-005](./ADR-005-ui-derivation-and-replay.md). The mechanism-level
formalisation of this contract — the host, the feed, the docks, and the
four-part module shape — is the HUID layer
([../huid/00-overview.md](../huid/00-overview.md), ADR-006). This is the
checklist and template set for building every next panel, so that surfaces
stay isolated from one another yet connected to the data through one
documented scheme.
It applies the spatial grammar of
[ADR-003](./ADR-003-spatial-bind-knot-workspace.md), the session contract of
[ADR-004](./ADR-004-session-runtime-context.md), and the human-role
agreements of
[manifest-of-conscious-movement.md](./manifest-of-conscious-movement.md).

## 1. The boundary citizens

Three kinds of citizen exist at the UI boundary, mirroring the station
discipline of Vol. 01 §4:

| Citizen | Receives | May do | Must never do |
| --- | --- | --- | --- |
| **Reading surface** | the tuple replica (or a materialised panel model) + navigation parameters | derive its view model as a pure function; register renderers; expose navigation | hold semantic state of its own; write to the log; infer consent from display |
| **Fact factory** (gesture control) | the user's own act | shape one declared turn or decision and submit it through the session API | commit anything the human did not enact; bypass the ingress mapper; carry undeclared payloads |
| **Obligation socket** (reserved) | one discharged intention (uid) | present the obligation; return the human's answer as the correlated fact | answer on the human's behalf; outlive its uid; double-answer |

A panel is a reading surface plus the fact factories placed on it. The
obligation socket arrives with the core phase (ADR-005 §1.4) and is listed so
new panels leave room for it.

## 2. The panel contract — four declarations

Every panel is fully specified by four declarations. If one of them cannot be
written down, the panel is not ready to build.

1. **Reading.** Which strata of the log the panel derives from: envelope
   kinds, fact types, and the correlation joins it uses (`uid`, `emittedBy`,
   `bindId`, `knotId`, `key`, `valueId`). The derivation is a pure function
   of `(tuples, params)`.
2. **Parameters.** The navigation coordinates the panel accepts — focused
   bind, view options, filters. Parameters are read-model references
   (thinking rail 1): client-held, passable to a query API, never committed.
3. **Gestures.** The fact factories the panel exposes: each control names
   the declared `TurnBody` or `DecisionBody` it produces and the facts that
   result. Controls that only move parameters are navigation, listed
   separately.
4. **Placement.** Where the panel sits in the spatial grammar of ADR-003:
   left (released history), centre (the focused figure), right (chosen
   depth), bottom (the one composer), strip (session state). Placement
   carries meaning; a panel must not relocate without revisiting it.

## 3. The panel manifest

Manifests are configuration-as-code first (the `lib/canvas.ts` discipline):
a constant beside the derivation, reviewable in one place. Shape:

```ts
type PanelManifest = {
  id: string;                 // 'rail.left.values'
  reads: {
    kinds?: string[];         // envelope kinds beyond domain.fact
    factTypes: string[];      // fact families the fold consumes
    joins: string[];          // correlation fields used
  };
  params: string[];           // navigation coordinates accepted
  commits: string[];          // decision kinds / operators its controls shape
  navigates: string[];        // parameter moves its controls perform
  placement: "left" | "centre" | "right" | "composer" | "strip";
};
```

Worked example — the released-values panel:

```ts
const valuesPanel: PanelManifest = {
  id: "rail.left.values",
  reads: {
    factTypes: [
      "learning.integration.candidate",
      "learning.integration.returned",
      "learning.integration.accepted"
    ],
    joins: ["bindId", "valueId", "candidateOffset"]
  },
  params: [],
  commits: [],            // display-only today; "revise" arrives with the workshop
  navigates: [],
  placement: "left"
};
```

The manifest is the review artefact: it makes "no custom peeking" checkable
(a panel reading beyond its manifest is a defect), and it is the place where
a missing datum becomes a protocol-widening request (Vol. 08 §8) instead of
a bespoke query.

## 4. Derivation rules

1. **Pure fold, offset order.** A panel model is a single-pass fold over
   tuples in offset order, so the same function serves full replay and, later,
   SSE increments. `project()` and `buildCanvas()` already have this form.
2. **Provenance joins only.** Ownership and causality come from `uid`,
   `emittedBy`, `bindId`, `knotId`, `key` — never from adjacency
   (Vol. 03 §3.3–4). If a join field is missing, that is a protocol gap to
   raise, not a heuristic to invent.
3. **Strata awareness.** The scene figure has three strata — admission,
   sowing, harvest (ADR-005 Decision 3) — and winding tacts belong to knots.
   A derivation that groups tuples must group by these seams, one lid per
   bind (Vol. 08 §8).
4. **Honest states are outputs.** Unanswered intentions, stalled clews,
   failures, and settled-unfinished are first-class fields of a panel model
   (Vol. 08 §7), never filtered out to make a surface look calmer.
5. **The four transitions never collapse.** Knot ready ≠ bind completed ≠
   human accepted ≠ session completed (ADR-003); a panel model keeps them as
   distinct fields even where the visual design shows one badge.
6. **Repetition folds at read time.** Repeated readiness and similar growth
   patterns are folded by the derivation («×N», Vol. 03 §8), not suppressed
   at commit time.
7. **Registries over branches.** Adding a block form, a row summary, or an
   actor classification is registering a renderer in a registry
   (`enabled` + `build`, first claim wins in declared order), not extending
   a switch statement inside a component.

## 5. Gesture rules

1. **Every control names its fact.** A committing control declares the
   `TurnBody`/`DecisionBody` it shapes; the server mints ids, uids, offsets,
   and stamps the actor (ADR-004 Decision 1). A control that cannot name its
   fact is navigation or does not belong.
2. **The exact snapshot seals at commitment.** Whatever context the gesture
   depends on — focus, source inclusion, target offset — travels inside the
   committed payload (`focusRef`, `sourceSnapshot`, `parameters`), never
   reconstructed later from UI state (ADR-003).
3. **Silence is never consent.** Display creates no obligation; only the
   human's own act commits (manifest §2). A panel must not auto-fire
   decisions on render, scroll, or timer.
4. **New capability = catalogue growth.** A new gesture is a new decision
   kind or operator in the declared catalogue, versioned, handled by the
   ingress mapper — never a bespoke endpoint beside the session API.
5. **Authoring weight is visible.** Gestures that sow topology (unfold,
   deepen, reframe) are categorically heavier than fact ingress and carry
   distinguished presentation (thinking rail 6).

## 6. The current surfaces, mapped

| Surface | Reads | Params | Commits | Navigates |
| --- | --- | --- | --- | --- |
| Session strip | counters (tuples, unanswered, failures), result presence | — | `finish`, `attest` | view switch |
| Shelf (left) | `learning.source.declared` | — | — | open `/spec/<ref>` |
| Root material (left) | plain `learning.turn.submitted` | — | — | — |
| Released values (left) | accepted integrations → values | — | — (future: revise) | — (future: provenance) |
| Focus scene (centre) | scene strata, knots, tacts, candidate | `focusBindId` | `evidence`, `readSource`, `deepen`, `markUnknown`, `accept` | crumbs, child links |
| Canvas (centre) | integrations; optional turns / answers / evidence | renderer options | `accept`; retargets composer to `reframe` | open its bind |
| Trace log (centre) | all tuples | actor filter, expansion | — | expand payload |
| Depth rail (right) | scenes by `parentBindId` | `focusBindId` | — | focus child scene |
| Composer (bottom) | — | composer mode | turn: plain / answer / challenge / `unfold` / `reframe` | mode switching |

Two observations this table makes visible: the left rail is display-only
today (its gestures arrive with the workshop and source-selection steps),
and the right rail is the next surface to grow — toward the attention queue
of manifest §7.3 — which is exactly why it must be built on this contract
rather than ad hoc.

## 7. Recipes

**Adding a display form to the canvas.** Register one renderer
(`{id, enabled, build}`) in `canvasRenderers`; add its toggle to the panel's
params if user-facing. No other file changes.

**Adding a panel.** Write the manifest; write the fold
`(tuples, params) → model`; express the visual as renderers over the model;
wire gestures to existing decision kinds. If the fold needs data the log
does not carry, widen the protocol first — a declared fact family per
Vol. 04 §6 — and only then build.

**Adding an operator.** Catalogue entry (id, version, parameters) + machine
handler + any new fact family it publishes. The UI cost is one fact-factory
chip on the composer; no new panel is implied.

**Recording a test state.** Run a session to the state, copy its
`var/sessions/<id>.jsonl` + meta into the fixtures directory, name it for
the state it captures. Use it as a reading fixture (assert derivations) or a
continuation fixture (load and keep working, ADR-005 §2.2).

## 8. Migration notes (environment adjustments, non-binding)

Recorded here so the deltas are named before any implementation instruction:

1. **Trace summaries → `lib/`.** `describeTuple` in
   `components/workbench.tsx` is a third derivation (tuple → actor +
   summary) living in a component; it becomes a registry module beside
   `lib/canvas.ts`, sharing fact-type knowledge with `project()`.
2. **`producedTuples` → scene strata.** The flat provenance filter in the
   workbench is replaced by a `lib/` derivation returning
   `{admission, sowing, harvest}` per ADR-005 Decision 3, and the focus view
   renders one lid per bind.
3. **One composer context source.** The context chip and the input
   placeholder both switch on the composer mode independently; they draw
   from one declared mapping (the answer/challenge placeholder branch is
   currently missing).
4. **Manifests beside derivations.** The mapping table of §6 moves into
   code as `PanelManifest` constants as panels are touched, starting with
   the rails.
