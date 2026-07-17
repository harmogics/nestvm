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
