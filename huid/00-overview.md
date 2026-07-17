# HUID 00 — Overview: the Human Interaction Device Layer

Status: SEED · Snapshot date: 2026-07-17 ·
Next: [01-motherboard.md](./01-motherboard.md)

HUID — the **Human Interaction Device** — is the layer that makes shell
construction itself a specified surface. The Nest Runtime Specification Set
(`../specifications/`) specifies the machine and describes its shells for
orientation only ("not normative beyond the one-assembly rule", Vol. 08 §10).
HUID fixes the missing level: an invariant **host** (the motherboard) into
which UI capability is inserted as **modules**, so that product growth adds
plugins and never mechanisms. This layer extends the specification set from
the product side and modifies nothing in it; `specifications/` remains the
untouched machine contract under study.

## 1. Position in the architecture

```text
   machine   ../specifications/   the wave log, knots, binds, membrane
   device    ../huid/             the interaction host, docks, modules
   product   ../spec/             decisions: which modules, petals, contracts
```

HUID adds no machine capability — the discipline of the seed extensions
(Vol. 13 §1: same wave, same compiler, same assembly, same membrane). In
conformance terms the whole layer is a **Class L citizen** — log-conforming
reader tooling (Vol. 14 §1) — plus the ingress discipline of Vol. 07 §6.
What the membrane's controller configuration records are to the world
(Vol. 07 §5), HUID manifests are to the human: a declared, inspectable
adapter surface.

## 2. Design commitments

Inherited from the machine and restated for the device:

1. **One truth.** Every visible durable state derives from committed tuples;
   the device holds no semantic history of its own (Vol. 08 §8, ADR-003).
2. **Gestures are declared facts.** A human act either commits a declared
   turn/decision through the command port or moves a navigation parameter
   that never leaves the device (Vol. 07 §6;
   [first-turn-log-protocol](../spec/first-turn-log-protocol.md)).
3. **Declared form, supplied content — applied to the UI.** The host fixes
   the module form (manifest, fold, select, view); a module fills content
   only (mirror of Vol. 01 §2.5).
4. **Integration by publication — applied to panels.** Modules never call
   modules. Composition happens through the log, the shared derivations, and
   the parameter space (mirror of Vol. 01 §2.4).
5. **Growth by modules on fixed rails.** New capability plugs in behind the
   existing contracts; the host MUST NOT change when a module is absent or
   added (mirror of Vol. 11 §1; the diff test, HUID 03 §3).
6. **Honest incompleteness reaches the surface.** Unanswered intentions,
   stalls, failures, and refusals are first-class module model fields, never
   filtered for calm (Vol. 08 §7).

## 3. The conceptual figure

```text
                 ┌──────────────────────────────────────────────────┐
                 │  HUID HOST — the motherboard                     │
                 │                                                  │
                 │  [strip ────────────────────────────────────]    │
                 │  [left dock]  [centre dock — carousel]  [right]  │
                 │  [composer ─────────────────────────────────]    │
                 │        ▲                                         │
                 │        │ views: select(fold state, shared, params)
                 │  ══════╪═══════════ the feed ════════════════    │
                 │   tuple replica · shared derivations · params    │
                 └────────┬─────────────────────────────▲───────────┘
                          │ command port                │ replay, then
                          ▼ (turns · decisions)         │ live batches
                     session API (ADR-004)  ——  the wave log (one truth)
```

The metaphor is the motherboard: the host is the board, docks are the slots,
the feed is the bus, modules are the cards. The board never changes when a
card is seated; a card that needs a new bus line is asking for a **layer
widening** — a recorded decision (mirror of Vol. 11 §2), never an
improvisation.

The whole invariant surface is countable in one breath: **one feed, one
parameter space, two verbs, four module parts, five docks.**

## 4. The two kinds of act

Every act at the surface is exactly one of:

- **semantic** — a declared fact shaped by a module control and committed
  through the command port; the server mints ids, uids, offsets and stamps
  the actor (ADR-004);
- **navigational** — a parameter write that never leaves the device and is
  never committed.

Authoring gestures (unfold, deepen, reframe) travel as semantic acts with
distinguished weight (product thinking rail 6). There is no third channel.

## 5. Documents of this layer

- **HUID 00** (this document) — position, commitments, figure.
- **[HUID 01](./01-motherboard.md)** — the motherboard: host obligations,
  the feed, shared derivations, the parameter space, the command port, the
  five docks.
- **[HUID 02](./02-module-contract.md)** — the module contract: manifest,
  fold, select, view, gesture rules, station rules, enforcement, the
  semantic boundary.
- **[HUID 03](./03-conformance-and-migration.md)** — conformance checklists,
  the motherboard diff test, fixture-based verification, worked example
  modules, and the migration of the current workbench.
- **[HUID 04](./04-attention-and-calm.md)** — the load contract: inductive
  disclosure, the element budget, no overlapping layers, interruption
  discipline — binding for every module, grounded in the psychology of
  attention.

## 6. Status language

This layer uses the specification set's status vocabulary (CURRENT /
DECLARED / PROPOSED / SEED). The layer as a whole is SEED: its rules bind
the product's shells (`../spec/`, `components/`, `lib/`) and do not bind the
machine. Terminology defers to Vol. 15; reserved machine terms (plane,
ledger, lane, head, demand) are not reused for device concepts.
