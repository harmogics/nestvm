# ADR-001: Use a guided reasoning canvas instead of chat as the primary surface

**Status:** Superseded by ADR-003

## Context

The Nest Education seed defines Learn as a bottom-to-top canvas: case ground, evidence, answers and hypotheses, inquiry frontier, integrated knots, and result horizon. CoAgnes similarly requires inspectable evidence, claims, alternatives, and human decisions. A chat-only interface hides this structure and makes the learning path difficult to review.

## Historical decision

The primary interaction was defined as a guided canvas with a bottom composer and
a fixed vector rail. This remains useful background, but the current design is
more precise: one focused bind scene, master-detail bind and knot composition,
four spatial directions, and one composer whose optional operator changes the
meaning of a turn. A turn without an operator does not automatically produce
reasoning artefacts.

## Consequences

- The interface can make inquiry progression, provenance, and unfinished obligations visible.
- The AI API is asked for structured public artefacts rather than hidden reasoning.
- A production implementation can persist each vector, block, source link, and acceptance as an append-only event without changing the UI grammar.

See [ADR-003](./ADR-003-spatial-bind-knot-workspace.md) for the replacing decision.
