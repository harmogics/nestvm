# ADR-007: Implementation layout — the nest in src/

**Status:** Accepted and executed, 2026-07-17. Builds on
[ADR-005](./ADR-005-ui-derivation-and-replay.md) and
[ADR-006](./ADR-006-huid-layer.md); realises the nest figure in the source
tree. Decisions taken with the user: code root `src/`; first step limited to
pure relocation (no behaviour change).

## Context

The implementation lived in flat `lib/` + `components/` + `app/`: every
level of the machine, its derivations, and the surface interleaved in one
namespace. The goal is the radial figure — the wave at the centre, levels
conducting information outward through transformations to the surface —
realised so that every new system function localises in a named region, a
model developing it knows exactly what to read and what to change, and UI
code is separated from the core.

## Decision 1 — the radial layout

```text
src/
  nest/wave        centre: wire vocabulary (envelope.ts) + store    Vol. 02–04
  nest/readings    pure derivations (projection, canvas, views)     Vol. 08 §8
  nest/membrane    inference port, oracle tasks, resolvers          Vol. 07
  nest/machine     command handlers, scene templates, settlement    Vol. 05–06, 08
  corpus/          the studied specification set as a store
  product/         session-contract bodies (commands.ts)            ADR-004 D1
  huid/            the surface — device code (interim: workbench)   ../huid/
  app/             Next.js shell: session API routes + pages        ADR-004 D1
fixtures/sessions  recorded goldens (the ADR-005 pin)
```

Documentation maps onto code fractally: `specifications/` ↔ `src/nest/`,
`huid/` ↔ `src/huid/`, `spec/` ↔ `src/product/` (+ the whole tree). The
top level of the repository remains the documentation level.

## Decision 2 — the radial import rule

Imports point inward only (Vol. 02 §2.5 applied to the tree):

```text
app → everything · huid → readings, wave, product (never machine/membrane)
product → wave · machine → membrane, readings, wave, corpus†, product†
membrane → wave, corpus · readings → wave · corpus → wave (types) · wave → ∅
```

† Documented v0 liberties, each with a recorded successor: the ingress
mapper is folded into the machine (moves to `product/` at the core swap,
ADR-004 D4); evidence search reaches `corpus` directly (becomes an
EvidenceController on the membrane). The load-bearing consequence: the
surface is a Class L citizen in code — `src/huid` cannot reach the machine
or the membrane at all.

## Decision 3 — lids

Every region carries a lid (README) in one form: role, governing documents,
allowed imports, what belongs, what never belongs. The lid is the region's
bind; its files are the knots. Reading cascade for a model:
`CLAUDE.md` project shape → layer documents → region lid → file headers
(which already cite volumes). The master lid is
[src/README.md](../src/README.md) with the routing table — where every kind
of new fragment lands.

## Decision 4 — the type split by level

`lib/types.ts` split along the radii, with no shape changes:
`src/nest/wave/envelope.ts` (envelope + payload conventions: ResourceRef,
EvidenceExcerpt, operator/vector ids, SessionMeta),
`src/nest/readings/views.ts` (projection view shapes),
`src/product/commands.ts` (TurnBody, DecisionBody, CommandResult). Types
are the "what to read" map: a model touching a level sees that level's
vocabulary file first.

## Execution record

Pure relocation, verified by `tsc --noEmit` and a live smoke run over the
dev server; fixtures pinned first (30 files into `fixtures/sessions/`).
Behavioural code unchanged — the diff is renames, import paths, the type
split, and lids. `tsconfig` alias `@/* → ./src/*`; Next.js picks up
`src/app` natively. Interim seats, both recorded in lids: `workbench.tsx`
sits whole in `src/huid/` until HUID migration step 2; the spec markdown
renderer and the new-session form are co-located with their routes in
`src/app/`.

## Consequences

1. The HUID migration (HUID 03 §6) proceeds on this layout: step 1 lifts
   trace/strata into `nest/readings`, step 2 seats the host in `src/huid`.
2. New work routes by the table in `src/README.md`; a fragment without a
   region is a layer question, not a guess.
3. The running dev server needs a restart after the move (paths changed
   under it).

## Open questions

1. Mechanical enforcement of the import DAG (a lint rule or a small check
   script over `src/`) — lids + review carry it until then.
2. When the machine splits (mapper → `product/`, evidence → membrane
   controller) — tied to the core swap, not to this step.
