# ADR-006: Establish the HUID layer — the UI motherboard

**Status:** Accepted, 2026-07-17. Builds on
[ADR-005](./ADR-005-ui-derivation-and-replay.md) and
[ui-panel-rails.md](./ui-panel-rails.md); creates the top-level `huid/`
specification layer. `specifications/` remains untouched.

## Context

ADR-005 settled *what* a panel is (a derived reading plus fact factories)
and ui-panel-rails.md gave the working contract. Neither yet fixes the
*mechanism*: today every surface is inline in `components/workbench.tsx`,
so each wanted addition — a graphical maturity map of all knots, a
trajectory view of binds, a terms index over publications — would grow the
mechanism rather than plug into it. The requirement is a hardware-like
discipline: an invariant motherboard whose docks accept new UI constructs
without any change to the board — the device-side mirror of the machine's
own growth rule ("pluggable modules on existing rails, never narrowing the
flat path", Vol. 11 §1).

## Decision

1. **Establish HUID — the Human Interaction Device — as a top-level
   specification layer** in `huid/`, written in the specification set's
   editorial form (statused volumes, normative language, TypeScript as
   reference encoding):
   [00-overview](../huid/00-overview.md) ·
   [01-motherboard](../huid/01-motherboard.md) ·
   [02-module-contract](../huid/02-module-contract.md) ·
   [03-conformance-and-migration](../huid/03-conformance-and-migration.md).
2. **The invariant surface is deliberately countable**: one feed, one
   parameter space, two verbs (`commit`, `navigate`), four module parts
   (manifest, fold, select, view), five docks (strip, left, centre, right,
   composer).
3. **Enforcement is physical where possible**: the host delivers each
   module's fold only the tuples its manifest declares — the manifest is a
   dispatch table (the reading-face mirror of knot collection rules,
   Vol. 05 §3), so undeclared reads are impossible rather than reviewable.
4. **Modules never call modules**: composition happens through the log,
   the shared derivations, and promoted parameter keys — integration by
   publication (Vol. 01 §2.4) applied to the UI.
5. **Panels never infer**: semantic needs route to the machine as declared
   fact families and analysis figures; modules read the results
   (HUID 02 §7).
6. **Migration is fixture-pinned**: the five-step plan of HUID 03 §6 moves
   the current workbench onto the board with golden models recorded before
   any code moves; acceptance is the motherboard diff test — the first
   foreign module lands with zero host diffs.

## Placement rationale

- **Not `specifications/huid/`** — the set is the frozen machine contract
  under study (the corpus the workbench itself presents and reads); the
  device layer must not blur into the study subject. Extending the set is
  the machine authors' move (Vol. 11 §7), not this product's.
- **Not `spec/huid/`** — `spec/` holds this product's decisions; HUID is a
  construction kit for shells, reusable beyond this product (the TAC
  sibling shares the paradigm), and deserves layer visibility beside
  `specifications/`.
- **Therefore top-level `huid/`** — the three-level shape becomes explicit:
  machine (`specifications/`) · device (`huid/`) · product (`spec/`). A
  relocation later is a cheap `git mv` if the shape changes.

## Consequences

1. ui-panel-rails.md remains the working companion; its §8 migration notes
   become steps 1–2 of HUID 03 §6.
2. The planned rails work (left/right panels, attention queue) waits for
   the board: surfaces land as modules, not as new workbench JSX.
3. The acceptance walkthrough gains a layer-level criterion: a new centre
   view or rail panel is demonstrably a plugin (diff test, HUID 03 §3).
4. Implementation (host skeleton, module wrapping) proceeds only on an
   explicit instruction, per the standing working mode; this ADR and the
   HUID volumes are the contract it will follow.

## Open questions

Carried in HUID 03 §7 (SSE increments, strip indicators, obligation
sockets, parameter URL sync, server-materialised folds, reflexive study of
the layer itself).
