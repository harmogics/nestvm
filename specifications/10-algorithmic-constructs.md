# Volume 10 — Programming the Machine: Algorithmic Constructs

Status: CURRENT · Snapshot date: 2026-07-14 ·
Previous: [09-authoring-formats.md](./09-authoring-formats.md) ·
Next: [11-extension-points.md](./11-extension-points.md)

This volume is the systems-programming guide: how algorithmic constructs are
formed from the machine's three stations. Programmes on the Nest VM are not
sequences of steps; they are **figures** — arrangements of knots and binds whose
control flow is readiness and whose data flow is publication. Each construct
below gives the intent, the wiring, and the rules that keep it within the three
load-bearing obligations (attribution, reachability, termination). Examples use
the authoring grammar of Vol. 09.

## 1. The two primitives of composition

Everything composes from two moves:

- **Sequence** — bind B consumes the publication of bind A: A's `emit` fact type
  is collected by a knot whose readiness activates B. Sequencing is always
  *through the log*, hence inspectable and re-bindable.
- **Join** — a bind gathers several knots at once: the activation channel plus
  named demands under the barrier. A join is applicative: demands ripen
  independently, in any order.

```text
sequence:  A ─emit▶ fact ─collect▶ knot ─ready▶ B
join:      k₁ ─ready▶┐
           k₂ ─ready▶┤ barrier(all) ─gates─▶ service ─▶ emit
           k₃ ─ready▶┘
```

Branching is judgement: gates split outcomes into `emit` vs `reject`
publications, each bindable downstream. Iteration is accumulation: a knot with
`reduce: append` and a threshold condition loops "collect until sufficient"
without any loop construct.

## 2. Deterministic gate (rendezvous latch)

Intent: proceed only when named things exist. The machine's `AND`-gate.

```yaml
- id: intake.ready
  strategy: deterministic
  wind:
    collect:
      - { as: topic, match: topic.received, reduce: latest }
      - { as: query, match: query.received, reduce: latest }
  condition: "topic != null && query != null"
```

Rules: keep gates free of semantics (they only detect presence); pick `latest`
for idempotent re-supply; pair with `reset: never` when the gate must hold open
across repeated readiness. A gate plus an emit descriptor is the machine's
acknowledgement pattern (`intake.seen → intake.acknowledged`).

## 3. Semantic accumulation cell

Intent: wind a stream of material into one integrated understanding with an
explicit sufficiency threshold — the machine's semantic register.

```yaml
- id: intent.understanding
  strategy: semantic_evaluator
  wind:
    collect:
      - { as: user_messages, match: chat.message.received, reduce: append, field: message }
    integrate: through_world          # or local for the deterministic class
  condition:
    questions: ["Is the user's end goal clear?", "Are the required parameters gathered?"]
    threshold_grade: 0.8
```

Design rules:

1. The `questions` are the cell's **angle of perception** — write them as the
   test the understanding must pass, not as a task description.
2. Set `threshold_grade` from calibration runs; grades are model-honest, not
   guaranteed monotone. A gate downstream (`min_grade`) re-checks at the bind.
3. Always consider `budget` (termination): an unbounded through-world cell on a
   noisy stream can wind indefinitely.
4. One in-flight intention per clew is machine-enforced; throughput comes from
   parallel cells (per key or per lane), not from pipelining one cell.

## 4. The understanding canvas (cross-pollination)

Intent: several cells wind in parallel and *feed on each other's integrations*,
converging on complementary understandings.

Wiring: each cell marks its winding protocol with a `lane`; controllers echo the
lane into answers; sibling cells collect `inference.response` facts of other
lanes via `where` clauses:

```yaml
- id: cell.truth
  strategy: semantic_evaluator
  wind:
    lane: truth
    budget: 4
    collect:
      - { as: seed,    match: question.seeded,      reduce: append, field: text,
          where: [ { field: cell, equals: truth } ] }
      - { as: sibling, match: inference.response,   reduce: append, field: state,
          where: [ { field: lane, not_equals: truth } ] }   # complementarity
    integrate: through_world
  condition: { questions: ["…truth angle…"], threshold_grade: 0.7 }
```

Rules:

1. Multi-rule cells label deltas by rule name (`[sibling] …`), so the
   integration sees provenance (Vol. 05 §5.4).
2. **Budgets are mandatory on a canvas** — cross-pollination is a positive
   feedback loop; the budget is its resonance damper. A starved cell stalls
   visibly rather than looping.
3. Exclude self-lanes with `not_equals` to avoid self-feeding.
4. Attribution on a canvas is by `lane` + `where`; keep lanes unique per cell.

## 5. Journal knot (never-resetting observer)

Intent: accumulate a side-record — e.g. all model reasoning per key — without
participating in control flow.

```yaml
- id: reasoning.journal
  strategy: semantic_evaluator
  wind:
    collect:
      - { as: reasoning, match: inference.reasoning, reduce: append, field: reasoning }
    reset: never
  condition: { questions: ["What reasoning has accumulated?"], threshold_grade: 0 }
```

With threshold 0 the journal reports readiness on every wind; downstream binds
that demand it latch its *current* understanding at their rendezvous (Vol. 06
§4.1). Read-time folding absorbs the repeated readiness (Vol. 03 §8). Use
`threshold_grade: 0` + `reset: never` deliberately and sparingly.

## 6. Unfold: generative fan-out with a declared closing form

Intent: let a semantic service *decide the breadth* of the next stage (N
question cells) while the pipeline fixes every form in advance. This is the
machine's bounded in-wave authoring construct (Vol. 06 §7).

The figure (the proven `problem.frame` shape):

```text
                       planner bind (operator)
                       service: "unfold the problem into questions"
                             │  answer: {questions: [q₁ … qₙ]}
             ┌───────────────┼───────────────────┐
   sys.knot.defined ×N   sys.descriptor.defined   head facts ×N
   cell.q1 … cell.qN     harvest bind, demands     question.seeded {cell: qᵢ}
   (canvas cells,        q1…qN (one per item)      (seed each cell; angle
    lanes q1…qN)                                    injected via {item.*})
             │                   ▲                        │
             └── wind, ripen ────┴──── readiness ×N ──────┘
                                 │ barrier(all) + gates
                                 ▼
                        harvest service → problem.frame.ready
```

Design rules:

1. The template fixes: cell ids (`cell.q{index}`), lanes, budgets, conditions
   (`{item.question}` as the sown angle), the head fact type, and the closing
   bind with one demand per item. The answer fixes only content and N.
2. Bound N in the schema (`maxItems`) — the termination obligation.
3. The `emittedBy` stamp on every sown emission keeps the sowing thread
   explicit — the attribution obligation.
4. Reachability: each head fact must satisfy its cell's `where` (`cell: q{index}`
   ↔ collect clause), and each cell's readiness must be demanded by the close —
   the compiler checks the placeholder/schema side; review the rest.
5. The closing bind gates each demand (`min_grade`) so a weak cell rejects the
   harvest visibly instead of diluting it.

## 7. Guard patterns

Intent: detect a boundary breach in parallel with the main figure and divert.

Current rails: a semantic cell whose questions are control questions
("Does the problem fall within a supported class?") with a threshold chosen so
readiness means *breach likely*, feeding an emit descriptor that publishes an
out-of-bounds fact for the shell to act on. The declared future form —
`polarity: out_of_bounds` conditions and `terminal: true` descriptors — is
reserved in the grammar and rejected until implemented (Vol. 11 §5). Design
rule: guards observe the same facts as the guarded figure (same collect
surface), never its internals.

## 8. The full hybrid figure: `problem.frame`

The proven composition of the constructs above, in causal order:

1. **intake gate** (deterministic, §2) admits the request;
2. **truth cell** (§3, through-world) winds the request into a framed
   understanding;
3. **journal** (§5) accumulates reasoning per key alongside;
4. **planner bind** projects an unfold service; the controller sows N question
   cells + heads + harvest bind (§6);
5. **question cells** ripen as a canvas (§4), cross-pollinating within budget;
6. **harvest bind** gathers all cells under gates and publishes
   `problem.frame.ready`.

The reference implementation's recorded acceptance run: 87 tuples, zero
failures, zero unanswered intentions —
the shape of a healthy hybrid run (settled, finished). Study its vault: lids
read backwards — harvest fact ← planner unfold ← intake emit.

## 9. Choosing the machine class per figure

| Need | Construct | Class |
| --- | --- | --- |
| standard process steps, routing, joins | gates + emit descriptors + deterministic services | deterministic |
| judgement over accumulated material | semantic cells + operator binds | semantic |
| process skeleton with semantic islands | gates and rendezvous around cells; deterministic gates re-checking semantic grades | hybrid |

Recipes:

- **Deterministic pipeline**: knots `deterministic` everywhere; operator binds
  allowed, discharged by a deterministic function-host controller (the service
  `instruction` names the function; the schema fixes its result) — the
  reference formats' `service.kind: function` records show the target shape.
- **Semantic pipeline**: cells `through_world`; every operator instruction is a
  bounded task over the gathered scope; schemas close every published result.
- **Hybrid**: default to deterministic for control, semantic for content;
  gates before every semantic service (cheap rejection); budgets everywhere a
  model can loop.

## 10. Obligations checklist for any new figure

Before running a figure, check:

- **Attribution** — does every fact a knot collects identify its lane
  (key/lane/`where`)? Do sown records carry `emittedBy`? Can two concurrent
  keys interleave without cross-winding?
- **Reachability** — for every demand, which publication chain feeds it? Trace
  input → collect → readiness → bind → emit → collect… to the final
  publication; a missing edge is a stall by design.
- **Termination** — is every through-world cell budgeted? Is every unfold
  schema-bounded? What does the figure look like when a service fails — which
  facts record it, and does the wave still settle?

A figure that passes on paper and stalls in practice is still a healthy
outcome: the log shows exactly which lid stayed open and which socket stayed
empty (Vol. 08 §8) — fix the figure, not the record.
