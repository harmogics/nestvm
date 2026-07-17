# Inductive Interface Specifications

This directory records the product and architecture understanding reached for the
inductive learning interface. The documents distinguish settled constraints from
working assumptions and open questions. They are written against the Nest concepts
of an append-only wave log, activation knots, bind descriptors, affinity, heads,
demands, integration, and retained multi-turn sessions.

## Current documents

- [Architectural starting points and the decision method](./architectural-starting-points.md)
  preserves the accumulated architectural understanding (the load-bearing
  starting points any future step builds from) and the method by which the
  architectural decisions were made, with the decision chronicle and the open
  tensions carried forward.

- [Cross-source concept analysis](./cross-source-concept-analysis.md) identifies
  ten critical distinctions between Nest and the supplied semantic-topology,
  activation, and distinction-thread materials.
- [Open binds and architecture](./open-bind-architecture.md) derives candidate
  binds, UI/API/backend boundaries, new scenarios, and the consolidated question
  catalogue from that analysis.
- [ADR-003: Spatial bind-and-knot workspace](./ADR-003-spatial-bind-knot-workspace.md)
  is the current interaction decision.
- [ADR-004: Session runtime context](./ADR-004-session-runtime-context.md) fixes
  the UI↔backend session API, the backend-owned storage planes (command journal,
  workshop drafts, registry) versus the machine-owned pluggable wave store, the
  machine port for the core swap, and this product's assembly profile.
- [ADR-005: UI surfaces as derived readings](./ADR-005-ui-derivation-and-replay.md)
  normalises three questions against the specification set: panels are derived
  readings and fact factories rather than membrane controllers (navigation is a
  parameter, not a fact); testing rests on replay-as-reading fixtures,
  continuation fixtures, and port doubles under a fixed assembly profile; and
  the scene figure has three strata — admission, sowing, harvest — with one
  lid per bind.
- [UI panel rails](./ui-panel-rails.md) is the companion pattern catalogue to
  ADR-005: the panel contract (reading / parameters / gestures / placement),
  the manifest template, derivation and gesture rules, the current surfaces
  mapped, and the extension recipes.
- [ADR-006: Establish the HUID layer](./ADR-006-huid-layer.md) records the
  decision to specify the UI motherboard as the top-level `huid/` layer: an
  invariant host (one feed, one parameter space, two verbs, five docks) into
  which panels plug as four-part modules — so UI growth adds plugins, never
  mechanisms — with a fixture-pinned migration of the current workbench.
- [ADR-007: Implementation layout](./ADR-007-implementation-layout.md)
  realises the nest figure in the source tree: the radial `src/` layout
  (wave → readings/membrane → machine · corpus · product · huid · app), the
  inward-only import rule, region lids, and the type split by level —
  executed as pure relocation pinned by recorded fixtures.
- [ADR-008: The session archive and the UI request path](./ADR-008-session-archive-and-ui-request-path.md)
  fixes the standing intake path for UI requests (classify → manifest →
  dock + calm → implement → verify → record), lands the first module
  (session archive: export as a materialised reading, import as
  continuation; registry operations are app chrome), adopts the calm
  contract of HUID 04 as binding, and fixes the trace's trajectory to
  matched templates with JSON one disclosure away.
- [ADR-009: Panel projectors](./ADR-009-panel-projectors.md) fixes the
  transport direction: panels receive backend-computed snapshots
  (`{model, asOfOffset}`) from observer-class projectors — the module's
  server half, fed by the store's commit hook, filtered by the manifest,
  rebuildable from the log — never the append-log stream itself; output
  controllers stay reserved for the machine addressing the operator
  (obligation sockets). Includes the right-panel adaptation plan.
- [First-turn and append-log protocol](./first-turn-log-protocol.md) describes the
  lifecycle before and through the first visible bind.
- [Manifest of conscious movement](./manifest-of-conscious-movement.md) states how
  the human participates: the two storage planes, the human role and its limits,
  the read→revise→append responsibility step, and the gesture geometry.
- [Attention matrix](./attention-matrix.md) tests the design through Truth, Deep,
  Connect, Service, Knowledge, Evolution, and Responsibility.
- [ADR-001](./ADR-001-guided-canvas.md) is retained as superseded history.
- [ADR-002](./ADR-002-guide-api.md) documents the runnable prototype API only; it
  is not the target Nest session contract.

## Status language

- **Hold**: a constraint already established by the discussion or inherited from
  Nest and not to be weakened implicitly.
- **Working assumption**: a useful interpretation that enables design work but
  still needs explicit confirmation.
- **Open question**: a choice whose answer changes product or runtime behaviour.
