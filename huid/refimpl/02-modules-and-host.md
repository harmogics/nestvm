# huid refimpl 02 — Modules and the Host: the Presentation Side

Status: CURRENT · Snapshot date: 2026-07-18 · Specifies against HUID 01
§1/§4–6, 02 §1/§3–5, 04; ADR-008, ADR-010 ·
Previous: [01-contracts-and-projectors.md](./01-contracts-and-projectors.md) ·
Next: [03-verification-and-growth.md](./03-verification-and-growth.md)

## 1. The module manifest — presentation declares consumption

`src/huid/modules/depth-rail/manifest.ts`:

```ts
export const depthRailManifest: ModuleManifest = {
  id: "right.depth",
  title: "Depth — child scenes",
  dock: "right",
  consumes: [SCENE_REGISTRY],     // which formed products feed this panel
  params: ["focus.bindId"],       // navigation it reads
  commits: [],                    // it never commits
  navigates: ["focus.bindId"]     // navigation it writes
};
```

The split of ADR-010 D3 in one glance: `reads` (what the log contains)
lives with the projector; `consumes` (what the panel is fed) lives here.
A panel whose controls cannot name their declared bodies under `commits`
is display plus navigation — and says so.

## 2. select and View

`src/huid/modules/depth-rail/view.tsx`. `select` is the pure parameter
application over the delivered snapshot:

```ts
selectDepthRail(model: SceneRegistrySnapshot, params: { focusBindId })
  → { focusedBindId,
      childScenes:  scenes where parentBindId === focusBindId,
      allScenes:    scenes when more than one exists }
```

`View` receives `{model, port}` and renders fields — nothing is computed
in render (HUID 02 §3.4). Every control calls
`port.navigate({ "focus.bindId": … })`; the module never fetches, never
imports the plane, and takes contract types from `contracts/` only.
Rendering technology inside a view is the module's liberty (HUID 02 §3.2)
— a graphical consumer of the same contract renders SVG over identical
cards.

## 3. The interim host

`src/huid/workbench.tsx` plays the host until migration step 2 completes
(HUID 03 §6) — a documented interim, not a design. Its host duties today:

1. **Snapshot transport per contract**: one fetch of
   `/snapshots/scene-registry` feeds every consuming panel; refreshed on
   session load and after each command result (`refreshPanels` inside
   `applyResult`). A transport hiccup keeps the last snapshot standing —
   quiet degradation, no popups (HUID 04 §4).
2. **Parameter space**: `focusSceneId`, `centreView`, composer mode —
   client-held navigation, never committed; consequence-bearing gestures
   seal their coordinates inside committed payloads (ADR-003).
3. **Command port**: the single session-API client; refusals surfaced
   verbatim in chrome ("The machine refused honestly: …").
4. **Docks and chrome**: the strip, rails, centre carousel, composer.
5. **Interim formation** for panels not yet contract-backed (centre and
   left surfaces still derive from the tuple replica via
   `nest/readings` client-side) — the recorded liberty that dissolves as
   each surface gains its contract.

## 4. The two seated modules

- **depth-rail** (`right`, contract-backed) — the reference shape:
  manifest + select + View, zero commits, navigation only; its formation
  is chapter 01's worked example. Lid:
  `src/huid/modules/depth-rail/README.md`.
- **session-archive** (`strip`, fold-less) — the boundary lessons: export
  is a **materialised reading** (a download link to the wire-format log —
  a read-model reference, no commits), and the import face is **registry
  chrome** in `src/app/studio/`, not a module, because it acts before a
  session's feed exists (HUID 03 §5.4). Both faces are dialog-free
  (HUID 04): native controls, inline honest refusals.

## 5. Calm in the implementation

The concrete forms the load contract takes here (HUID 04): disclosure in
place (`details` for produced tuples, inline payload expansion, the
evidence menu under its knot); reads lighter than commits (the Archive
link beside the Exit link, against the commit-weight buttons); refusals
inline at the gesture; no overlays — one z-plane; the machine's
self-movement surfaces as quiet state change where the person already
looks (the barrier note, the rail's status lines).
