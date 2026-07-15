# ADR-002: Model the guide as a structured API with a local fallback

**Status:** Prototype-only; target contract pending

## Context

The initial backend is a mock of a more capable agent backed by Together AI. The UI must remain useful for local development and demos without a credential, while its contract must be suitable for later session and event infrastructure.

## Decision

`POST /api/guide` accepts an input, selected vector, and bounded visible context. It responds with a purpose, public blocks, a next prompt, and a source marker. The route uses Together AI only when `TOGETHER_API_KEY` exists; otherwise it returns a deterministic, schema-compatible simulation.

The system prompt explicitly prohibits requests for hidden chain-of-thought. The model returns learner-facing observations, questions, hypotheses, and connections, each with a short evidence/provenance label.

## Consequences

- UI integration is stable across mock and hosted inference.
- A future `WaveSession` can turn request/response calls into committed events and SSE updates while preserving the payload shape.
- The current fallback is intentionally a development experience, not an evaluator or authoritative reasoning engine.

## Current boundary

The implemented `POST /api/guide` route is a runnable UI mock. It must not be
treated as the future Nest protocol. The target protocol uses a retained
`WaveSession`; commits every user turn, intention, external request, external
answer, knot publication, and integration to one wave log; and derives the UI
from those committed records. See
[first-turn-log-protocol.md](./first-turn-log-protocol.md).
