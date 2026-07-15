# Reference Implementation Book (refimpl) — Map and Reading Rules

Status: CURRENT · Snapshot date: 2026-07-14 · Part of the
[Nest Runtime Specification Set](../00-introduction.md)

This book describes **one complete conforming implementation** of the Nest
runtime — the implementation from which the specification volumes were
snapshotted — in enough operational detail that an engineer can build a fresh
compatible implementation in any language without consulting that project's
source code. The volumes (01–15) are the normative contract; this book is the
worked existence proof, the source of the "reference field" names used in
Vol. 02 §4, and the catalogue of behaviours a port must reproduce or may vary.

## 1. How to read this book

Each chapter describes units at the same three levels:

- **Responsibility** — the unit's single job and its place on the rails;
- **State and behaviour** — fields, algorithms, edge cases, exact observable
  choices (error texts' intent, ordering, defaults);
- **Liberty** — what a new implementation may legitimately do differently.
  Anything not marked as liberty and observable on the log, the diagnostics,
  or the wire formats is part of compatibility (Vol. 14 §2).

Blanket liberties, true everywhere and not repeated per unit: host language
and paradigm; class vs function organisation; container and map types;
performance-motivated indexing (provided observable order is preserved);
naming of private members; test framework. Blanket constraints: synchronous
stations, the single asynchronous seam at discharge, and every MUST of the
volumes.

## 2. Implementation profile

- Language: TypeScript 5.x, strict; compiled to ES modules run by Node.
- Runtime dependencies: exactly one — a YAML parser (`yaml`). Everything else
  is the platform (`node:http`, `node:fs`, `fetch`, `AbortController`).
- No bundlers; shells serve vanilla static assets.
- Secrets: one environment variable (or a git-ignored local `.env` file);
  never in records, code, or the log.
- Tests: platform test runner over deterministic controller doubles; golden
  fixtures for the demo log and compiled records.

## 3. Module map and dependency rule

```text
core        tuple envelope, contracts, engine          (depends on nothing)
domain      tuple/protocol type declarations           (→ core)
topology    registration, dispatch, strategy registry  (→ core, domain, knots, descriptors)
knots       DeterministicKnot, SemanticKnot, matching  (→ core, domain)
descriptors ActionDescriptor, OperatorBind             (→ core, domain)
schema      JSON Schema subset                         (standalone)
membrane    controller contract, sweep                 (→ core)
controllers inference/service controller, stub, emit templates (→ domain, membrane, schema)
runtime     settle loop                                (→ core, membrane)
loader      document loading, compiler, input facts    (→ domain, schema, knots)
wiring      the one product assembly                   (→ all runtime parts)
cli / nest  shells                                     (→ wiring, loader; nest also → its own store/digest modules)
```

The arrow direction is enforced: core depends on nothing; nothing in core,
domain, topology, knots, descriptors, membrane, or runtime imports a shell,
the loader, or test code. Domain types are declaration-only modules.

## 4. Repository layout of the reference project

For orientation when the book mentions artefact locations (a port chooses its
own layout; the *formats* themselves are normative, Vol. 09):

```text
src/<module>/…            the modules of §3
formats/pipelines/        bundled pipelines; drafts/ and templates/ subtrees
formats/knots|binds/      reference artefacts (target shapes)
formats/controllers/      controller records; one live wiring record
nest/                     static assets of the workbench shell
var/runs/                 persisted runs (JSONL + meta sidecars), git-ignored
test/                     regression suite (51 tests at snapshot)
```

## 5. Chapters

| Chapter | Units | Specifies against |
| --- | --- | --- |
| [01-kernel.md](./01-kernel.md) | tuple envelope, contracts, WaveEngine | Vol. 02, 03 |
| [02-topology.md](./02-topology.md) | TopologyGraph, strategy registry | Vol. 02 §5, 05 §8 |
| [03-knots.md](./03-knots.md) | DeterministicKnot, SemanticKnot, rule matching, condition parser | Vol. 05 |
| [04-descriptors.md](./04-descriptors.md) | ActionDescriptor, OperatorBind | Vol. 06 |
| [05-membrane-and-controllers.md](./05-membrane-and-controllers.md) | Membrane, inference/service controller, stub double, emit-template instantiation, heuristic | Vol. 04, 06 §7, 07 |
| [06-runtime-and-wiring.md](./06-runtime-and-wiring.md) | WaveRuntime, assembleWave, buildInputFacts | Vol. 08 |
| [07-loader-and-schema.md](./07-loader-and-schema.md) | document loading, compilePipeline decomposition, schema subset | Vol. 09 |
| [08-shells.md](./08-shells.md) | CLI, Nest Studio server (catalogue, runs, SSE, authoring, promotion, trace digest) | Vol. 08 §8–10 |

A port typically reimplements chapters 01–07 and treats chapter 08 as a
design sketch for its own shells: shells are not required for Class M
conformance, but their persistence and derivation rules (JSONL, purity) are
normative wherever a shell exists.
