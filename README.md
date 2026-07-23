# Nest VM — a specification-defined wave-log machine

Nest VM is a virtual machine whose memory is an append-only wave log of
immutable tuples. Activation knots accumulate understanding, bind descriptors
gather–judge–publish, output controllers cross the membrane, and a wave moves
through the declared topology until the machine reaches an honest terminal
state.

Nest VM is defined by its specification and conformance surfaces, not by a
canonical core implementation. Implementations may differ throughout their
code and assembly while remaining compatible at three shared surfaces: the
persisted log, the execution algorithms, and the YAML core-structure formats.

This public project is part of **Harmogics** and is intended to live at
`nestvm.harmogics.com`. Read the
[philosophy](./PHILOSOPHY.md) for the project's commitments and the
[ecosystem map](./ECOSYSTEM.md) for the relationship between Nest VM,
Harmogics, HUID, CoAgnes, Florispace, and The Algorithmic Company. The
[semantic bridge](./BRIDGE.md) states how independently governed ecosystem
projects may inform Nest VM without entering its code or authority.

## What this repository contains

1. **The Nest Runtime Specification Set** — a self-contained, language-neutral
   processor-style manual in [`specifications/`](./specifications/00-introduction.md).
   It defines the machine, the authoring grammar, extension discipline, and
   conformance classes.
2. **The HUID specification** — the Human Interaction Device layer in
   [`huid/`](./huid/00-overview.md): a stable motherboard for log-derived UI
   modules and declared human gestures.
3. **Nest Studio** — an experimental study workbench in [`src/`](./src/README.md)
   that renders the specification and lets a person study it through
   wave-log-shaped session histories.
4. **Product and architecture records** — ADRs, interaction rails, and the
   human-role manifest in [`spec/`](./spec/README.md).
5. **Ecosystem guilde manifests** — non-normative orientations in
   [`manifests/`](./manifests/README.md) for projects that grow their own human
   and institutional environments around an independent Nest VM centre.

## Current status: Nest studying Nest

The specification is the subject of the first workbench experiment. A person
reads the machine and works through questions about it while the workbench
records machine-shaped tuples. The trace can then be read using the concepts it
records: the reflexive bootstrap described in Vol. 13 §7.

The current workbench is a product simulation, not yet a claim of full Nest VM
machine or authoring conformance. Its external shapes are deliberately aligned:
the tuple envelope, protocol vocabulary, session API, and derived readings are
the intended swap surfaces for a future conforming implementation.

## What makes an implementation Nest VM

Conformance is behavioural rather than genealogical:

- **Class L** reads and writes the log format and derives views from the log;
- **Class M** adds the specified machine algorithms and honest terminal states;
- **Class A** adds the YAML compiler and package discipline;
- **Class E(x)** adds a named extension with its compatibility proof.

The exact requirements and normative anchors are in
[Volume 14](./specifications/14-conformance-and-verification.md). The
[`refimpl/`](./specifications/refimpl/00-book-map.md) book is a worked
existence proof and implementation guide, not a mandatory code lineage.

## Run the workbench locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without credentials the workbench uses deterministic guide fallbacks. To
enable Together AI inference, copy `.env.example` to `.env.local`, set
`TOGETHER_API_KEY`, and restart the server. In both profiles the current run is
marked `simulated`; provider choice does not change the persisted tuple shape.

## A study session

1. The learner opens a session over a specification volume or their own
   question. Their first words become root material; nothing activates merely
   because text was entered.
2. **unfold** authors a bounded scene: one bind with three or four question
   knots and a separately declared closing bind.
3. Knots wind through learner answers, challenges, specification evidence, and
   integrations returned from deeper child scenes. Intentions and responses are
   correlated in the log; readiness is reified as a committed tuple.
4. When every demand is ready, returned, or explicitly unknown, the closing
   bind publishes an integration candidate automatically. There is no human
   `integrate` command; the human decision is whether to revise or accept the
   publication.
5. Completion requires the declared result contract and human attestation.
   Quiescence, fluency, and silence are never presented as completion.
6. A refresh replays the same scene from the log. Focus and navigation may stay
   local, but durable semantic state has no browser-private truth.

## Repository map

| Path | Role |
| --- | --- |
| `specifications/` | Normative Nest Runtime Specification Set, Vol. 00–15, plus the refimpl book |
| `huid/` | SEED Human Interaction Device specification |
| `spec/` | Product decisions, interaction architecture, and human-role records |
| `manifests/` | High-level ecosystem orientations; not machine specifications or capability packages |
| `src/nest/wave/` | Tuple vocabulary and append-only session store |
| `src/nest/readings/` | Pure projections and canvas readings |
| `src/nest/membrane/` | Inference port, semantic tasks, and resource resolvers |
| `src/nest/machine/` | Current simulated scene authoring, winding, and settlement |
| `src/corpus/` | Specification corpus and evidence lookup |
| `src/product/` | Session command contract |
| `src/huid/` | Current workbench surface and future HUID host/modules |
| `src/app/` | Next.js routes, pages, and session API |
| `fixtures/sessions/` | Recorded replay fixtures; not a public experience dataset |
| `related/`, `concepts_ui/` | Adjacent research and visual references with separate provenance status |
| `var/` | Local persisted sessions, ignored by Git |

## Session API — current simulated contract

```text
POST /api/sessions                      open a session
GET  /api/sessions                      list sessions
GET  /api/sessions/:id                  metadata + full tuple log
POST /api/sessions/:id/turns            plain signal / knot answer /
                                        configured operator request
POST /api/sessions/:id/decisions        evidence · readSource · deepen ·
                                        accept · markUnknown · finish · attest
```

Commands return the committed tuple batch in offset order. Refusals return
honest reasons and commit nothing further. The envelope is the wave tuple of
Vol. 03 §1: `{offset, kind, key, payload}`.

## Licence

This is a multi-licensed repository. The specification, HUID, philosophy, and
architecture documents are available under `CC-BY-4.0`; the current workbench
software is available under `AGPL-3.0-only`. Recorded sessions and adjacent
research or visual materials are excluded unless individually licensed. See
[LICENSE.md](./LICENSE.md) for the exact path-based scope.
