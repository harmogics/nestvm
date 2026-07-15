# Volume 11 — Extension Points and the Widening Discipline

Status: CURRENT / DECLARED · Snapshot date: 2026-07-14 ·
Previous: [10-algorithmic-constructs.md](./10-algorithmic-constructs.md) ·
Next: [12-ext-cells-and-charters.md](./12-ext-cells-and-charters.md)

The Nest runtime grows by a fixed discipline: **pluggable modules on existing
rails, never narrowing the flat path**. This volume catalogues every sanctioned
extension point of the current machine, the constructs already declared in the
formats but not yet enforced, the recorded future work, and the open decisions
an extension must not pretend are settled. It is the volume an extension author
reads first; Volumes 12–13 are worked examples of its rules.

## 1. The growth rule

1. New capability plugs in behind existing contracts (strategy registry,
   processor list, controller list, emit-declaration union, protocol
   namespaces). It MUST NOT require the flat machine to change behaviour when
   the capability is absent.
2. Base functionality is never narrowed without explicit agreement and
   motivation; a degenerate configuration (a trivially winding clew, a
   demands-only bind) is a configuration of the same unit, not a new kind.
3. Every extension names, at design time, how it preserves the three
   obligations — attribution, reachability, termination — and which honest
   states it adds.

## 2. Core widenings: the amendment procedure

The invariant core (envelope + three contracts + append semantics) changes only
by **deliberate, recorded widening**: proposed explicitly, motivated, agreed,
landed together with terminology, requirements, formats, and tests (the
same-work-item rule). The precedent log:

| # | Widening | Motivation | Recorded |
| --- | --- | --- | --- |
| 1 | `IKnotExecutor.wind` may return emissions | semantic winding must project intentions through the world, bounded to the knot's own accumulation | 2026-07-02 |
| 2 | `IDescriptorExecutor.execute` receives the activation context; `understanding()` snapshot added | truthful publications need the knot id, key, and integrated understanding | 2026-07-02 |

Candidate widenings currently **open** (not agreed; extensions MUST NOT assume
them): log restore/continuation into a live engine (§6.1); a processor
settlement/quiescence hook (§6.2); a new envelope kind of any sort.

## 3. Extension points: behaviour

### 3.1 Knot strategies (registry)

Add accumulator kinds by registering factories under new strategy names
(Vol. 05 §8). Rules: honour the five-method lifecycle and station limits;
validate configuration at construction (the registration probe surfaces
defects); extend the compiler to accept the name and validate its config —
authoring visibility is never implicit.

### 3.2 Local integrators

The injection seam for deterministic-class semantic integration (Vol. 05 §5.1).
Any pure `(deltas) → {state, grade}` function qualifies. Swapping it changes
the machine class, not the format.

### 3.3 Wave processors (observers and routers)

The processor list is the machine's own extension point (Vol. 02 §1). Passive
observers (mirrors, metrics, digest feeders) MUST emit nothing behavioural.
Active processors — routers that own local topologies — are permitted and are
the sanctioned path to compartmentalisation: the Cell extension replaces the
top-level topology with `CellSpace(root: TopologyGraph)` while root-only
behaviour stays byte-identical (Vol. 12 §4).

### 3.4 Output controllers

New world capabilities are new controllers with configuration records
(Vol. 07 §5): narrow claims, correlation field, answer types, budgets, secrets
outside records. Installation is a deployment/control-plane operation — never a
wave fact (the no-self-granted-power rule, Vol. 12 §9). Deterministic function
hosts, artefact stores, chat egress, delivery receipts are all this shape.

### 3.5 Emit declarations

The declaration union (`writes` | `unfold`) is designed for careful growth; the
proposed third member is `cell` (Vol. 12 §3). Rules for any new member: fixed
at projection, carried whole in the intention, mutually exclusive with the
others, executable by a controller without consulting the bind, validated
before publication, attributable (uid/stamp), and bounded (worst case
statically computable).

### 3.6 Protocol families

New asynchronous capability = new `domain.fact` namespace with closed shapes,
correlation identity, producer class, terminal-answer rule, and collision
review (Vol. 04 §6.3). Never a new envelope kind.

## 4. Extension points: formats (currently open rails)

- **4.1 Reducers** — `append` | `latest`/`overwrite` today; a new reducer is a
  compiler + knot change behind one enum.
- **4.2 Where-clauses** — `equals`/`not_equals` today; richer predicates extend
  one shared matcher (`ruleMatches`); extensions MUST reuse it rather than
  fork a second condition language (the rule the Cell ingress restates,
  Vol. 12 §6, check 9).
- **4.3 Branches and ledgers (DECLARED)** — named lanes (planes of breadth) and
  isolated sub-scopes (levels of depth) with `isolation` marks; parsed,
  validated, rejected beyond `main`. Their enforcement is where the attribution
  obligation gets its full home (Vol. 03 §5); until then, keys + lanes + stamps
  carry it.
- **4.4 Runtime declaration** — `mode: single-thread`, `isolation:
  declared-only`: the reserved surface for concurrency and enforcement stages.
- **4.5 Condition and gate languages** — deterministic conditions are the
  null-guard subset; gates are `min_grade`. Richer expressions (the reference
  artefacts sketch full boolean gates over scope fields) MUST arrive through
  the deliberate expression rail: one parser, closed grammar, explicit
  rejection of the rest.
- **4.6 Schema subset** — grows keyword by keyword (Vol. 09 §7.3); admission
  validation stays the final authority.
- **4.7 Fact-shape conventions** — `data.grade` (gate comparand),
  `data.lane` (canvas mark), `data.uid`/`bindId`/`knotId` (correlation),
  `emittedBy` (provenance): extensions SHOULD reuse these names rather than
  mint synonyms.

## 5. Declared-future authoring constructs (reserved words)

The grammar reserves and rejects, with the distinct "declared but not yet
supported" diagnostic, a family of full-shape constructs fixed by the
reference project's target-shape pipeline artefact:

| Construct | Reserved keys | Intent |
| --- | --- | --- |
| affinity heads on descriptors | `affinity.heads[]` (branch, writes, op), `affinity.knots[]` | rays projected at activation: declared branches + the computations they seed (Vol. 01 §3) |
| synthesis fan-in | `synthesize` (when, strategy, writes, on_branch) | the integrative close over declared tendrils |
| generative fan-out as action | `action: unfold`, `fanout: generative`, `generate`, `head_template`, `knot_template` | first-class unfold beyond the emit-template form |
| terminal guards | `terminal: true`, condition `polarity: out_of_bounds`, `evaluate` | boundary-breach diversion (Vol. 10 §7) |
| non-main lanes | `branches[]`, `listen_on`, `on_branch` | planes and levels (§4.3) |

Illustration of the reserved shapes (target syntax; the current compiler
rejects every construct below by name):

```yaml
descriptors:
  - id: unfold.problem                # static fan-out over declared planes
    on: intake.ready
    action: unfold
    affinity:
      heads:                          # ray = branch + allowed writes + seeded op
        - { branch: truth, writes: [dimension.unfolded],
            op: { strategy: semantic_evaluator, dimension: truth } }
      knots:                          # tendrils hung on the declared branches
        - { id: collect.truth, listen_on: truth, match: dimension.unfolded }
    synthesize:                       # fan-in once the tendrils have gathered
      when: [collect.truth]
      strategy: semantic_evaluator
      writes: problem.described
      on_branch: main

  - id: unfold.questions              # generative fan-out with per-item ledgers
    on: problem.ready
    action: unfold
    fanout: generative
    affinity:
      generate: { from: problem.described, strategy: semantic_evaluator, as: questions }
      head_template:
        branch: "question/{index}"
        isolation: ledger             # declared isolation level
        writes: [question.answered]
        op: { strategy: semantic_evaluator, dimension: deep }
      knot_template:
        id: "collect.question/{index}"
        listen_on: "question/{index}"
        match: question.answered
    synthesize: { when: all-generated, strategy: semantic_evaluator,
                  writes: solution.raw, on_branch: main }

  - id: guard.out_of_bounds           # terminal guard diverting the wave
    on: guard.problem_class           # a knot whose condition declares
    action: emit                      #   evaluate: control_questions
    writes: pipeline.out_of_bounds    #   polarity: out_of_bounds
    terminal: true
```

Rules: implementations MUST keep rejecting these explicitly until implemented;
implementing one moves it from this table into Volumes 05–09 in the same work
item; the emit-template `unfold` (Vol. 06 §7) is the already-executable subset
of this family and MUST remain compatible with the first-class form when it
lands.

## 6. Recorded future work and open decisions

Extensions MUST treat the following as open, not as silently assumable:

1. **Restore/continuation** (open core widening): processors keep materialised
   state in memory; the engine has no API to load committed tuples and
   continue. Any proposal must choose rehydration vs snapshots vs an explicit
   core restore, and must not re-discharge old intentions (Vol. 08 §9).
2. **Quiescence/settlement hook**: processors have no settlement callback;
   `at_quiescence` barriers, stall facts, and Cell completion events wait on an
   additive runtime/session hook. Until then, unfinished status is a digest.
3. **Wave maturity block** (recorded): edge-triggered readiness and
   understanding-by-reference (log-growth control, Vol. 03 §8), canvas
   diversity/dedup guards, barrier failure guard, run cost metrics.
4. **Controller claim exclusivity**: behavioural `claims()` cannot prove
   exclusive service discharge; inspectable claim manifests with overlap
   validation at assembly are the intended mechanism (Vol. 07 §3.3).
5. **Operator rendezvous reset**: the one-shot latch never reopens; long-lived
   figures needing re-projection await an explicit rendezvous reset policy —
   revision-style fresh binds are the sanctioned workaround (Vol. 06 §4.2).
6. **Session layer** (`WaveSession`): additive, specified with the Cell
   extension (Vol. 12 §8); multi-turn products depend on it.

## 7. Extension definition checklist

A conforming extension specification states:

1. which rails of §3–4 it uses, and proof the flat machine is unchanged when
   the extension is absent (root-compatibility test);
2. its protocol family per Vol. 04 §6.3 (shapes, correlation, producers,
   terminal answers) and its reserved-namespace claims;
3. its authoring surface per Vol. 09 (closed keys, diagnostics, compiler reuse);
4. how attribution, reachability, and termination hold, with budgets and their
   accounting semantics;
5. its honest states and their derivations (what "unfinished" and "failed" look
   like on the log);
6. its trust boundaries: what is untrusted data, what validates it, what is
   all-or-nothing, where secrets live, what only the control plane may do;
7. its verification matrix entries (Vol. 14 §4) and regression obligations
   (golden logs preserved; new fixtures).

Volumes 12 and 13 are written to this checklist and serve as its templates.
