# Inductive Interface Specifications

This directory records the product and architecture understanding reached for the
inductive learning interface. The documents distinguish settled constraints from
working assumptions and open questions. They are written against the Nest concepts
of an append-only wave log, activation knots, bind descriptors, affinity, heads,
demands, integration, and retained multi-turn sessions.

## Current documents

- [Cross-source concept analysis](./cross-source-concept-analysis.md) identifies
  ten critical distinctions between Nest and the supplied semantic-topology,
  activation, and distinction-thread materials.
- [Open binds and architecture](./open-bind-architecture.md) derives candidate
  binds, UI/API/backend boundaries, new scenarios, and the consolidated question
  catalogue from that analysis.
- [ADR-003: Spatial bind-and-knot workspace](./ADR-003-spatial-bind-knot-workspace.md)
  is the current interaction decision.
- [First-turn and append-log protocol](./first-turn-log-protocol.md) describes the
  lifecycle before and through the first visible bind.
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
