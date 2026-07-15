# Nest Runtime Specification Set — Introduction and Reading Map

Volume 00 · Status: CURRENT · Snapshot date: 2026-07-14

This directory is the complete developer specification of the **Nest runtime**
— the wave-log virtual machine. It is written in the manner of a processor
architecture manual and is deliberately **self-contained**: everything needed
to understand the machine, to implement a conforming machine in any
programming language, and to write systems that run on it is inside this
directory. TypeScript is used for demonstration only; every normative rule is
stated in language-neutral form.

The set was snapshotted from a working reference implementation (the
Florispace Core project). That project's source is **not** required reading:
the [refimpl book](./refimpl/00-book-map.md) inside this directory describes
the reference implementation completely enough to build a fresh compatible
one.

## 1. What is specified

The Nest runtime is a virtual machine whose single memory is an append-only
**wave log** of immutable tuples, whose execution units are **activation
knots** (accumulators), **bind descriptors** (gather–judge–publish units), and
**output controllers** (the I/O boundary), and whose execution model is the
**wave**: a committed tuple propagates through the registered topology until
the log stops growing and no external discharge is in flight.

A conforming machine may be:

- **deterministic** — every service and integration is computed by
  deterministic functions; the machine is fully replayable from its inputs;
- **semantic** — integrations and services are discharged to a large language
  model (or another non-deterministic oracle) through the membrane;
- **hybrid** — both kinds coexist; the kind of each function is fixed by the
  bind and knot declarations and by the controllers installed at assembly.

The choice is an assembly property, not a core property: the log format, the
propagation algorithms, and the authoring formats are identical across all
three classes. Compatibility between differing implementations is defined at
exactly three surfaces: **the log, the algorithms, and the YAML core-structure
formats** (see [14-conformance-and-verification.md](./14-conformance-and-verification.md)).

## 2. Contents

### 2.1 Volumes

| Vol. | File | Contents | Status |
| --- | --- | --- | --- |
| 00 | [00-introduction.md](./00-introduction.md) | This map, conventions, naming | CURRENT |
| 01 | [01-overview.md](./01-overview.md) | The machine at a glance: philosophy, figure, machine classes | CURRENT |
| 02 | [02-machine-model.md](./02-machine-model.md) | Execution environment, stations, the architectural register file | CURRENT |
| 03 | [03-wave-log.md](./03-wave-log.md) | The wave log: envelope, offsets, ordering, persistence (JSONL), quiescence | CURRENT |
| 04 | [04-tuple-reference.md](./04-tuple-reference.md) | Tuple catalogue: system tuples, protocol families, reserved namespaces | CURRENT |
| 05 | [05-activation-knots.md](./05-activation-knots.md) | Knots: lifecycle, clews, deterministic and semantic winding, budgets | CURRENT |
| 06 | [06-bind-descriptors.md](./06-bind-descriptors.md) | Binds: emit descriptors, operator binds, rendezvous, gates, emit declarations | CURRENT |
| 07 | [07-membrane-and-controllers.md](./07-membrane-and-controllers.md) | The membrane: claims, discharge, correlation, failure conversion | CURRENT |
| 08 | [08-virtual-machine.md](./08-virtual-machine.md) | The Nest VM: assembly, settle algorithm, machine classes, terminal states | CURRENT |
| 09 | [09-authoring-formats.md](./09-authoring-formats.md) | YAML formats: pipeline grammar, records, packages, schema subset, compilation | CURRENT |
| 10 | [10-algorithmic-constructs.md](./10-algorithmic-constructs.md) | Programming guide: gates, canvases, cascades, unfold, figures | CURRENT |
| 11 | [11-extension-points.md](./11-extension-points.md) | Extension points: rails, declared-but-unenforced constructs, widening discipline | CURRENT / DECLARED |
| 12 | [12-ext-cells-and-charters.md](./12-ext-cells-and-charters.md) | Extension: Semantic Charters, Cells, CellSpace | PROPOSED |
| 13 | [13-ext-experience-protocols.md](./13-ext-experience-protocols.md) | Extension: CoAgnes experience protocols; Nest Education | SEED |
| 14 | [14-conformance-and-verification.md](./14-conformance-and-verification.md) | Conformance classes, the golden fixture, the seven verification matrices | CURRENT |
| 15 | [15-terminology.md](./15-terminology.md) | The canonical vocabulary of the whole set | CURRENT |

### 2.2 The refimpl book

[refimpl/](./refimpl/00-book-map.md) — eight chapters describing the reference
implementation unit by unit (kernel, topology, knots, descriptors, membrane
and controllers, runtime and wiring, loader and schema, shells): its state,
algorithms, edge cases, exact observable choices, and the liberty space a new
implementation has. The volumes are the contract; the book is the worked
existence proof and the source of every "reference field" name.

### 2.3 Reading order

Volumes 01–03 for orientation; 04–07 are the reference an implementer keeps
open; 08 defines what a machine must do; 09–10 are for authors of systems on
the machine; 11–13 fix where and how the machine grows; 14 defines
"conforming"; 15 is the vocabulary. An implementer then works through
refimpl 01–07 beside the volumes; refimpl 08 sketches shells.

## 3. Status labels

Every volume, and where necessary every section, carries one of four labels.
The labels keep the snapshot honest: nothing declared is presented as
enforced, and nothing proposed is presented as agreed.

- **CURRENT** — implemented in the reference implementation and covered by its
  regression suite; the text is a snapshot of working behaviour.
- **DECLARED** — present in the authoring formats and validated by the
  compiler, but not enforced by the runtime (for example branch isolation
  levels). A conforming implementation must parse and preserve these
  constructs and must not silently drop them.
- **PROPOSED** — agreed design direction, specified normatively in Vol. 12;
  not implemented behaviour. Implementation must land together with tests and
  the promotion of the affected sections to CURRENT.
- **SEED** — conceptual direction, specified in Vol. 13; to be checked against
  real product constraints before it hardens.

## 4. Conventions

- Prose is technical British English.
- The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be
  interpreted as in RFC 2119. They mark conformance requirements; text without
  them is descriptive.
- Normative algorithms are given as numbered rules or pseudocode, independent
  of any host language. TypeScript fragments are demonstrations aligned with
  the reference implementation; where a fragment and a numbered rule could be
  read differently, the numbered rule governs.
- `monospace` names refer to tuple kinds, fact types, payload fields, YAML
  keys, or reference-implementation identifiers.
- Cross-references of the form "Vol. NN §M" target volumes in this directory;
  "refimpl NN §M" targets book chapters. References to numbered rule lists
  are written "§N, check M" or "§N.M" (rule M of section N). All file links
  stay inside this directory.
- Mentions of the reference project's file layout (module names, artefact
  directories) are descriptive anchors, catalogued in refimpl 00 §3–4; a port
  chooses its own layout.
- Offsets, indices of log positions, are zero-based. Template item indices
  (`{index}` in unfold templates) are one-based; this asymmetry is inherited
  and fixed (see Vol. 06 §7).

## 5. Vocabulary and one naming note

The canonical vocabulary of the whole set is
[Volume 15](./15-terminology.md): one term, one meaning, older synonyms noted
as *aka*. The two central entities are the **activation knot** (which
accumulates understanding) and the **bind descriptor** (which binds, judges,
and emits); within a bind descriptor, **heads** are part of the **affinity**
structure.

**Naming note.** In the reference project the bare word *Nest* historically
named the workbench shell. This specification set names the whole machine
**the Nest runtime** (equivalently, *the Nest virtual machine*, *Nest VM*),
because the runtime is the nest in which waves live and the workbench is one
shell over it. Where the workbench is meant, this set writes **Nest Studio**.
An overloaded word is resolved by explicit definition, not by silent reuse —
the same discipline Vol. 15 §9 applies to *cell*.

## 6. Specification map

| Machine part | Normative volume | Reference description |
| --- | --- | --- |
| Tuple envelope, emissions | Vol. 03 | refimpl 01 §1 |
| Processor and executor contracts | Vol. 02 §2 | refimpl 01 §2 |
| Propagation engine | Vol. 02 §7, 08 | refimpl 01 §3 |
| Topology (registration, dispatch, clews) | Vol. 02 §5, 05 §2 | refimpl 02 |
| Deterministic knot | Vol. 05 §4 | refimpl 03 §2–3 |
| Semantic knot | Vol. 05 §5 | refimpl 03 §4 |
| Emit descriptor | Vol. 06 §2 | refimpl 04 §1 |
| Operator bind | Vol. 06 §3–5 | refimpl 04 §2 |
| Membrane sweep | Vol. 07 §3 | refimpl 05 §1 |
| Inference/service controller | Vol. 07 §4 | refimpl 05 §2 |
| Delegated emit templates | Vol. 06 §7 | refimpl 05 §3 |
| Settle loop | Vol. 08 §3 | refimpl 06 §1 |
| Assembly | Vol. 08 §1 | refimpl 06 §2 |
| Pipeline compiler | Vol. 09 | refimpl 07 §2 |
| JSON Schema subset | Vol. 09 §7 | refimpl 07 §3 |
| Shells, trace digest | Vol. 08 §8–10 | refimpl 08 |

## 7. Governance of this set

The set carries its governance with it:

1. **Same work item.** A change to machine behaviour and the matching change
   to these volumes land together — the set never trails the machine.
2. **Append-only history of agreements.** Dated behaviour records are never
   rewritten, only clarified or superseded by later entries.
3. **Invariants apart from choices.** Stable semantics, boundaries, and public
   contracts belong to the volumes; demo data and diagnostics only where they
   define required behaviour (the golden fixture does).
4. **Named enforcement.** Every structural rule states its enforcement path —
   a type boundary, a narrow export, or a regression test.
5. **Deliberate widening.** Core contracts change only by the recorded
   procedure of Vol. 11 §2.
6. **Verification.** Before publication, and after any substantial revision,
   the set is re-verified through the seven matrices — truth, deep, connect,
   service, knowledge, evolution, responsibility — defined in Vol. 14 §4.
