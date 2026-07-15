# Volume 01 — Overview: the Nest Runtime at a Glance

Status: CURRENT · Snapshot date: 2026-07-14 ·
Previous: [00-introduction.md](./00-introduction.md) ·
Next: [02-machine-model.md](./02-machine-model.md)

## 1. The machine in one paragraph

The Nest runtime is a virtual machine for accumulating and integrating
understanding. Its only memory is an ordered, append-only log of immutable
tuples. Its programme is a set of records committed to that same log: activation
knots, which match and wind incoming facts into accumulated understanding and
test readiness; and bind descriptors, which are woken by readiness, gather named
understandings into a bound scope, judge the scope with gates, run a service over
it, and publish the resulting integration back to the log. Everything external —
a language model, an API, a human interface — is reached only through output
controllers standing on the membrane, and everything the world answers re-enters
as committed facts. The machine is settled when the log is quiescent and no
external discharge is in flight.

Where a conventional processor executes instructions over mutable registers and
memory, the Nest runtime propagates facts over immutable history. The programme
does not address memory; it declares what it binds to. Control flow is not a
branch instruction; it is readiness.

## 2. Design philosophy

Six commitments shape every part of the architecture. They are stated here
informally; their normative forms appear in the volumes cited.

1. **One truth, append-only.** The wave log is the single source of truth.
   Entries are never rewritten, only appended. Every state a shell or user
   interface shows is a derivation of committed tuples (Vol. 03, Vol. 08 §8).
2. **A narrow, invariant core.** The core is the tuple envelope, the append-run
   engine, and three small contracts (processor, knot executor, descriptor
   executor). Capability is never welded into it; everything grows around it as
   pluggable modules behind those contracts (Vol. 02 §2, Vol. 11 §2).
3. **One publication, two receptions.** A committed tuple may be received inward
   — wound by knots into further understanding — and outward — claimed by a
   controller and discharged to the world. Both are readings of the one log;
   nothing reaches the world that was not first a committed fact (Vol. 07 §1).
4. **Integration by publication.** No unit returns a value privately to another.
   A bind's integration is a committed tuple; others receive it by binding to it.
   Composition of understanding is therefore visible on the log, always
   (Vol. 06 §1).
5. **Declared form, supplied content.** Wherever a non-deterministic oracle
   participates (a model, a human), the *form* of what it may produce is fixed in
   advance by a declaration — a schema, an emit declaration, a template — and the
   oracle fills content only. The machine validates before committing
   (Vol. 06 §6–7, Vol. 07 §4).
6. **Honest incompleteness.** A wave that settles without finishing is reported
   as such — a stalled knot, an unanswered intention, an open barrier are visible
   states of the log, never masked as success and never silently retried
   (Vol. 08 §7).

## 3. The figure: circle and triangle

The whole machine moves as a circle with a triangle inscribed — the machine's
conceptual figure:

```text
                      topology (directing structures)
                      knots · binds · controller claims
                               ▲
                              / \
              re-authored    /   \    declared
              from below    /     \   outward claims
                           /       \
                          ▼         ▼
        inner return: emissions    outer return: intentions
        committed and wound        discharged through the
        into further               membrane, computed by the
        understanding              world, re-entering as facts
                          \         /
                           \       /
                            \     /
                          the wave log
                        (one append-only truth)
```

- The **top vertex** is the topology: registered knots, binds, and outward
  claims. It directs both descents, yet it is not static — a planner bind may
  raise fresh records out of settled understanding, so the top is continually
  re-authored from below (Vol. 06 §7, Vol. 10 §6).
- The **lower-left corner** is the inner return: emissions committed back to the
  log and wound into further understanding, closing at quiescence scale.
- The **lower-right corner** is the outer return: intention tuples discharged
  through controllers, computed by the world, re-entering as facts — not an exit
  but the longest arc of the circle, closing at world scale.

The two corners differ in radius, not in kind: both are returns to the log.

## 4. Stations of execution

Three stations receive committed tuples; each has one competence and is denied
the other two. This separation is load-bearing and appears throughout the set.

| Station | Receives | May do | Must never do |
| --- | --- | --- | --- |
| Activation knot | matching facts | wind them; project winding intentions bounded to its own accumulation; report readiness | publish integrations for others; judge; touch the world |
| Bind descriptor | readiness of its knots | gather the bound scope; judge with gates; run/project a service; publish integrations or rejections; emit topology records | wind ambient facts; touch the world directly |
| Output controller | committed tuples it claims | discharge them to the world exactly once; return the world's answer as fact emissions | judge; integrate; originate semantic content |

A fourth kind of participant, the **observer** (any additional wave processor),
may read everything and emit nothing that changes behaviour; the Nest Studio live
feed is exactly such a mirror (Vol. 08 §8).

## 5. Machine classes: deterministic, semantic, hybrid

The class of a machine is decided by the functions bound at two places — knot
integration and bind services — and both are deliberately left to the
implementation and assembly:

- A **deterministic machine** installs deterministic executors everywhere:
  deterministic knots, local integrators that are pure functions, and controllers
  that compute answers deterministically (or no controllers at all). Such a
  machine is a classical dataflow/rendezvous engine: same seeds, same log, byte
  for byte. Standard business processes run here.
- A **semantic machine** installs an inference controller on the membrane and
  authors knots with `integrate: through_world` and binds whose services are
  operator instructions. Understanding is then integrated by a model; the log
  records every intention, answer, reasoning, and failure. Replay of the log is
  still deterministic reading; re-execution is not.
- A **hybrid machine** mixes both in one topology: deterministic gates and
  rendezvous around semantic integration cells. The bundled `problem.frame`
  pipeline is such a figure (Vol. 10 §8).

The three classes share one log format, one propagation algorithm, one settle
algorithm, and one authoring grammar. The kind of a bind's service function —
LLM-discharged instruction, deterministic function, rule engine, human task —
is a property of the installed controllers and declared strategies, constrained
only by the protocol contracts of Vol. 04 and the station rules of §4. This is
the primary portability claim of the architecture: **runtime general, semantics
pluggable**.

## 6. What programmes look like

A programme is an **authoring pipeline**: a YAML document (or package with
schemas) declaring inputs, knots, and descriptors. A loader compiles it into
**individual records** — `sys.knot.defined` and `sys.descriptor.defined`
emissions — which are committed to the log like any other tuple and materialised
by the topology as they are read (Vol. 09). At runtime a bind may itself emit
topology records under a declared template (`unfold`), so the machine can sow
bounded new topology mid-flight; the sown records carry a provenance stamp
(Vol. 06 §7).

```yaml
# The bundled demo pipeline, complete (the golden fixture's programme, Vol. 14 §2)
pipeline: demo.intent
inputs:
  - { id: message, writes: chat.message.received, field: message }
knots:
  - id: intent.understanding
    strategy: semantic_evaluator
    wind:
      collect:
        - { as: user_messages, match: chat.message.received, reduce: append, field: message }
    condition:
      questions: ["Is the user's end goal clear?", "Are the required parameters gathered?"]
      threshold_grade: 0.8
descriptors:
  - id: action.notify.business.analyst
    on: intent.understanding
    action: emit
    writes: intent.understanding.ready
```

Fed two seed messages, this programme produces the golden six-tuple log with
readiness reified at offset 4 and the final fact at offset 5 — the conformance
anchor of Vol. 14 §2.

## 7. The three load-bearing obligations

The decoupled model — heads seeding cascades, demands gathering their ends — is
consistent only while three obligations hold. They recur across this set as
gates on every extension:

- **Attribution** — every integration is attributable to the head or activation
  it serves. Carried today by keys and the `emittedBy` provenance stamp; homed in
  branches and ledgers as they become enforced; extended by Cell ownership in the
  proposed extension (Vol. 03 §5, Vol. 11 §4, Vol. 12).
- **Reachability** — a cascade seeded by a head must be able to reach the demand
  that gathers it. An authoring obligation, statically checkable over declared
  records (Vol. 09 §8, Vol. 12 §6).
- **Termination** — a cascade may fail to complete; in an append-only machine
  this is an unfinished quiescence, not an explosion. Handled by budgets, the
  quiescence rule, and honest unfinished-state reporting (Vol. 05 §6, Vol. 08 §7).

## 8. What the machine deliberately is not

- It is not a message broker: tuples are never consumed, routed away, or
  acknowledged out of the log; reception is reading.
- It is not a workflow engine with mutable task state: there is no state to
  mutate, only history to append and derive from.
- It is not an agent framework with private tool-call returns: every external
  effect and answer crosses the log.
- Its isolation constructs (branches, ledgers, Cells) are semantic scoping, not
  an operating-system sandbox; native generated code is out of scope for the
  runtime proper (Vol. 12 §1, §10).
