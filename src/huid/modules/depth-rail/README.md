# depth-rail — the second seated module, first projector-backed

**Role.** The right dock: chosen depth (ADR-003) — child scenes of the
focused scene, plus the whole scene registry once more than one scene
exists. The first module *extracted from the workbench monolith* (the
opening move of HUID migration step 2) and, since ADR-009, the **first
projector-backed panel**: its model is formed server-side by
`src/huid/projectors/depth.ts` from the manifest's claims, served as
`{model, asOfOffset}` by `/api/sessions/:id/panels/right.depth`, and
transported to the module by the host. The wire contract is
[model.ts](./model.ts); `select` applies only `focus.bindId`. Parity with
the former client formation is pinned by an independent JSONL oracle over
every stored session (ADR-009 Decision 3 step 6).

**Audit against the rails** (performed at extraction, 2026-07-17):

1. **Derivation purity ✓** — the rail read only `projection.scenes` and the
   focus parameter; no private state, no fetch. Extraction required no
   behavioural change: `select` + view, fold-less (`derives:
   ["projection"]`).
2. **Gestures ✓** — every control navigates `focus.bindId`; zero commits.
   In the monolith the parameter space is the workbench's state; the port's
   `navigate` verb is already shaped for the host.
3. **Calm (HUID 04)** — resting state small; "All scenes" appears only when
   more than one scene exists. Noted: the two lists carry button visual
   weight while being pure navigation (§5 weight rule) — kept as-is
   pending the log restyle pass.
4. **Recorded successor** — the rail grows toward the attention queue
   (manifest-of-conscious-movement §7.3): published candidates, awaiting
   obligations, honest stalls across all scenes.
5. **Open point** — the right rail is hidden at ≤1080px (`.rail.right
   { display: none }`), which removes depth navigation entirely on narrow
   screens; reachability vs calm to be resolved with the host's dock
   policies.

**Shape (HUID 02 §8).** One directory, two halves:
[manifest.ts](./manifest.ts) — the contract, single source of the claims;
[model.ts](./model.ts) — the wire model between the halves;
[projector.ts](./projector.ts) — server half, pure fold (registered by one
line in `src/huid/projectors/registry.ts`); [view.tsx](./view.tsx) —
client half, `select` + view.

**May import.** `nest/wave` (types), `../../manifest`, `../../text`,
`../../projectors/runtime` (type only) — never machine/membrane, never
another module's internals. The client half never imports the projector.
