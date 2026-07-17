# NestVM — the wave-log machine

**Nest studying Nest.** This repository ships two things that are deliberately
one thing:

1. **The Nest Runtime Specification Set** (`specifications/`) — a complete,
   self-contained developer specification of the Nest runtime: a virtual
   machine whose only memory is an append-only wave log of immutable tuples,
   whose units are activation knots (accumulators), bind descriptors
   (gather–judge–publish) and output controllers (the membrane), and whose
   execution model is the wave.
2. **A study workbench built on the machine it describes** — a site that
   renders the specification set and lets you study it in sessions whose every
   gesture is committed to a wave-log-shaped event history. The trace of your
   own study is itself a wave log you can read with the concepts you are
   studying (the reflexive bootstrap of Vol. 13 §7, Tact 1).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The workbench runs without credentials on a deterministic guide simulation.
To enable Together AI inference, copy `.env.example` to `.env.local`, set
`TOGETHER_API_KEY`, and restart the dev server. Either way the runtime is
**simulated**: it emits machine-shaped tuples so the UI can later consume real
Nest logs unchanged, and every run is marked `simulated`.

## What a study session is

- Your first words are **root material** — committed as plain signals; nothing
  activates until you choose an operator.
- **unfold** forms a scene: a bind heading with 3–4 question knots, each an
  angle of perception.
- Knots ripen through the winding protocol: your **answers** and
  **challenges**, **evidence** (real excerpts of the specification with
  volume/section references), and integrations **returned** from deepened
  child scenes — each an `inference.request`/`inference.response` pair with an
  honest grade; readiness is reified as `sys.knot.ready`.
- **integrate** folds a scene into a seam-preserving candidate with a
  contribution map; **accepting** it releases the value to the left rail.
- **Completion is a contract, not quiescence**: a defended articulation with
  preserved open questions, attested by you. Knots may be closed as
  **explicitly unknown** — honest incompleteness is a valid result.
- The **trace** shows the session's tuple log with correlations; a page
  refresh replays the same scene from the log. No browser-private truth.

## Project structure

- `specifications/` — the Nest Runtime Specification Set (Vol. 00–15 and the
  refimpl book); rendered at `/spec`.
- `app/`, `components/` — the Next.js site and workbench (`/studio`).
- `lib/` — tuple log store, pure projection, simulated machine orchestration,
  guide (Together AI + deterministic fallback), spec corpus and evidence
  retrieval, markdown renderer.
- `spec/` — product and architecture decisions for the inductive learning
  interface (ADR-003 is the current interaction decision).
- `related/` — adjacent conceptual corpus (Semantic Vessel drafts, the AI
  maturity cube).
- `var/` — persisted session logs (JSONL, git-ignored).

## API (target session contract, simulated)

```text
POST /api/sessions                      open a session (petal + subject)
GET  /api/sessions                      list sessions
GET  /api/sessions/:id                  meta + full tuple log (replay)
POST /api/sessions/:id/turns            one composer turn: plain signal /
                                        knot answer / operator request
POST /api/sessions/:id/decisions        evidence · deepen · integrate ·
                                        accept · markUnknown · finish · attest
```

Commands return the committed tuple batch; refusals return honest reasons and
commit nothing further. The envelope is the wave tuple of Vol. 03 §1:
`{offset, kind, key, payload}`.

NestVM is a sibling of **The Algorithmic Company** — seeds of one field:
comparable look and feel, its own accent.

## Licence

This is a multi-licensed repository: the specification and architecture
documents are available under `CC-BY-4.0`; the current workbench software is
available under `AGPL-3.0-only`. Recorded sessions and adjacent research or
visual materials are excluded unless individually licensed. See
[LICENSE.md](./LICENSE.md) for the exact path-based scope.
