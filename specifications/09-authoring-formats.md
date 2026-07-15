# Volume 09 — Authoring Formats: YAML Grammar, Packages, Compilation

Status: CURRENT · Snapshot date: 2026-07-14 ·
Previous: [08-virtual-machine.md](./08-virtual-machine.md) ·
Next: [10-algorithmic-constructs.md](./10-algorithmic-constructs.md)

Programmes for the Nest VM are authored outside the machine as YAML documents
and compiled by a **loader** into individual records committed to the log. This
volume is the current snapshot of that grammar — the exact closed key sets, the
validation rules, the package layout, the JSON Schema subset, and the
compilation algorithm — plus the format-level compatibility rules that make
pipelines portable between implementations. Constructs the format declares but
the runtime does not yet execute are marked DECLARED and specified in
Vol. 11 §4–5.

## 1. Two artefact classes

1. **Loadable authoring pipelines** — documents this volume's grammar accepts;
   the compiler turns them into seeds. The reference implementation bundles
   its pipelines in one catalogue tree (refimpl 00 §4, refimpl 08 §2.2).
2. **Reference artefacts** — YAML records documenting target shapes: knot,
   bind, and controller records, and one full-shape pipeline declaring the
   reserved future constructs (illustrated in Vol. 11 §5). They fix vocabulary
   and direction; the compiler deliberately rejects their beyond-stage
   constructs with explicit messages. A conforming implementation MUST NOT
   silently accept or drop them.

## 2. Pipeline document: top level

```yaml
pipeline: <id>            # required, non-empty
title: <string>           # optional
runtime:                  # optional; validated, constrains nothing further yet
  mode: single-thread     # only value at this stage
  isolation: declared-only
inputs:    [ … ]          # §3
branches:  [ … ]          # §4 (DECLARED beyond 'main')
knots:     [ … ]          # §5.1
descriptors: [ … ]        # §5.2
```

Closed key set: `pipeline`, `title`, `runtime`, `inputs`, `branches`, `knots`,
`descriptors`. Unknown keys are errors. Throughout the grammar, **every mapping
has a closed key set and every unknown key is reported with its path** — the
uniform diagnostic discipline of §6.

## 3. Inputs

```yaml
inputs:
  - id: message                     # unique
    writes: chat.message.received   # fact type the shell commits
    field: message                  # payload field for the value; default 'value'
```

Inputs declare the machine's ingress surface. Shells generate their run forms
from `compiled.inputs` — the UI draws what the compiler declares, nothing more.
At run start each supplied value becomes one `domain.fact`
`{factType: writes, data: {[field]: value}}` on the run key; repeated values are
permitted (arrays produce one fact each, in order).

## 4. Branches (DECLARED)

```yaml
branches:
  - { id: main, role: root }
```

`main` is implicit and the only executable lane at this stage. Additional branch
declarations are validated (unique non-empty ids); any `listen_on`/`on_branch`
other than `main` is rejected with "only the 'main' branch is executable at this
stage". The construct reserves the plane/level machinery of Vol. 11 §4.3.

## 5. Records

### 5.1 Knots

Common shape and keys (`id`, `strategy`, `listen_on`, `wind`, `condition`):

```yaml
knots:
  - id: intake.ready
    strategy: deterministic            # or semantic_evaluator
    listen_on: main                    # optional; must be 'main'
    wind:
      collect:                         # ≥ 1 rule; keys: as, match|match_type, reduce, field, where
        - { as: topic, match: topic.received, reduce: latest }
        - { as: query, match: query.received, reduce: latest }
      # semantic-only: integrate: local|through_world · lane: <string> · budget: <int ≥ 1>
      reset: on_ready                  # or never
    condition: "topic != null && query != null"      # deterministic: expression string
```

```yaml
  - id: intent.understanding
    strategy: semantic_evaluator
    wind:
      collect:
        - { as: user_messages, match: chat.message.received, reduce: append, field: message }
      integrate: through_world
    condition:                         # semantic: structured mapping
      questions: ["Is the user's end goal clear?", "…"]
      threshold_grade: 0.8
      # evaluate_understanding is implied true by compilation
```

Validation highlights (each with a path-anchored error):

- `wind.collect` non-empty; rule keys closed (`as`, `match`/`match_type`,
  `reduce` ∈ append|latest|overwrite, `field`, `where` with
  field+equals/not_equals);
- deterministic: condition must parse in the null-guard subset over declared
  slot names; `integrate` forbidden; duplicate `as` names forbidden;
- semantic: condition requires ≥ 1 question string and a numeric
  `threshold_grade`; `lane` non-empty string; `budget` positive integer;
- condition keys `evaluate` and `polarity` are recognised as **future** and
  rejected as "declared but not yet supported at this stage" (guard polarity,
  Vol. 11 §5).

### 5.2 Descriptors

Keys: `id`, `on`, `on_as`, `action`, `writes`, `on_branch`, `demands`, `gates`,
`service`. Two actions compile today:

```yaml
descriptors:
  - id: notify.analyst          # emit descriptor
    on: intent.understanding    # must name a declared knot
    action: emit
    writes: intent.understanding.ready

  - id: frame.service           # operator bind
    on: frame.truth             # optional; must name a declared knot
    on_as: frame                # scope name of the activation entry
    action: operator
    demands:                    # named bindings; 'as' unique across scope
      - { as: journal, knot: reasoning.journal }
    gates:
      - { scope: frame, min_grade: 0.75 }     # scope name must be bound
    service:
      instruction: >
        Form the answer required by the frame.
      schema: schemas/frame.schema.json       # file ref, resolved and embedded
      emit: { writes: problem.frame.ready }   # or unfold: (§5.3)
```

Validation highlights: emit descriptors require `on` + `writes` and forbid
operator-only keys; operator binds forbid top-level `writes` (the emit lives in
`service`), check every demand knot exists, forbid duplicate scope names, check
gate scopes against the statically known scope names; future actions
(`unfold` as an action, and the keys `affinity`, `synthesize`, `fanout`,
`generate`, `terminal`) are rejected as future constructs (Vol. 11 §5).

### 5.3 The unfold emit template

```yaml
    service:
      instruction: "Unfold the problem into 3–5 orthogonal questions."
      schema: schemas/questions.schema.json    # REQUIRED for unfold
      emit:
        unfold:
          for_each: questions                  # schema property: array with items
          knot:                                # sown per item; id must contain {index}
            id: "cell.q{index}"
            strategy: semantic_evaluator       # only strategy at this stage
            wind:
              collect:
                - { as: seed, match: question.seeded, reduce: append, field: text,
                    where: [ { field: cell, equals: "q{index}" } ] }
              integrate: through_world
              lane: "q{index}"
              budget: 4
            condition: { questions: ["{item.question}"], threshold_grade: 0.7 }
          head:                                # fact seeding each cell
            writes: question.seeded
            data: { cell: "q{index}", text: "{item.question}", emphasis: "{scope.frame}" }
          close:                               # the closing bind, once
            id: harvest.frame
            demands_from_items: { as: "q{index}", knot: "cell.q{index}" }   # {index} required
            service:
              instruction: "Integrate the ripened answers."
              schema: schemas/harvest.schema.json
              emit: { writes: problem.frame.ready }    # simple writes only
```

Static coherence enforced at compile time (Vol. 06 §7.3): `for_each` names an
array property with `items` in the declared schema; every `{item.*}` path exists
in the items schema; every `{scope.*}` names a bound scope entry; knot id and
`demands_from_items` carry `{index}`; the closing service may not unfold.

## 6. Compilation algorithm and diagnostics

```text
compile(document, resolveSchemaRef?) → { pipelineId, title, errors[], seeds[], inputs[] }
 1  validate the top level (closed keys; runtime values)
 2  collect branch ids ('main' implicit); validate inputs (unique ids)
 3  for each knot: validate; build the strategy config; parse deterministic
    conditions; seeds += sys.knot.defined
 4  for each descriptor: validate against declared knot ids; resolve and embed
    schemas (assertSupportedSchema); compile emit declarations and templates;
    seeds += sys.descriptor.defined
 5  if errors ≠ ∅: seeds ← []                        // all-or-nothing
```

Normative rules:

1. **Explicit rejection.** Unsupported syntax is rejected with a path-anchored
   message (`knots[1].condition: …`); nothing is silently dropped. Future-stage
   keys get the distinct message "declared but not yet supported at this stage".
2. **All-or-nothing.** A document with any error compiles to zero seeds. There
   is no partial registration from authoring (the same atomicity the Cell
   admission extends to runtime-authored packages, Vol. 12 §6, check 6).
3. **Self-contained records.** Schema file references are resolved at compile
   time and embedded into the records, so a run never depends on mutable files.
   The resolver is a callback: file-based for packages, in-memory for drafts
   and (in the extension) for blueprint-embedded schema maps — one compiler,
   many sources.
4. **One compiler.** Every shell and every extension MUST reuse the same
   compilation functions; two grammars for one machine are non-conforming
   (restated for blueprints in Vol. 12 §6, check 6).
5. Diagnostics are data (stable paths, one message per violation), suitable for
   attachment to authoring UI elements.

## 7. The JSON Schema subset

Result contracts embed a deliberately closed JSON Schema subset:

- keywords: `type`, `properties`, `required`, `items`, `enum`, `description`,
  `minItems`, `maxItems`, `minimum`, `maximum`;
- types: `object`, `array`, `string`, `number`, `integer`, `boolean`.

Rules:

1. `assertSupportedSchema` rejects any other keyword explicitly at compile time.
2. Validation semantics (controller-side, Vol. 07 §4.2): `enum` by strict
   equality; objects check `required` presence and recurse into declared
   `properties` (extra properties are currently permitted); arrays check
   `minItems`/`maxItems` and recurse into `items`; numbers check
   `minimum`/`maximum` and integrality for `integer`.
3. Expansion of the subset (unions, `$ref`, patterns, `additionalProperties`)
   is a deliberate extension decision (Vol. 11 §4.6): admission-time validation
   remains the final authority even where an outer schema is permissive.

## 8. Packages

A pipeline that declares schemas is a **package**: a directory with
`pipeline.yaml` beside `schemas/*.schema.json`. Loading resolves `service.schema`
references relative to the package (never outside it, refimpl 07 §1). Drafts
and templates are ordinary packages in dedicated catalogue subtrees — a
template additionally carries a `template.json` provenance sidecar: source
draft, proving run, promotion time (refimpl 08 §2.2, §2.4). Promotion of a
draft requires a settled proving run of that same pipeline; it refuses
non-drafts, unknown or unsettled runs, and runs of a different pipeline.

The seed direction for richer packages (case/evidence/rubric/manifest layers) is
an extension concern (Vol. 13 §4–5; the proposal's library layout in Vol. 12 §10)
— the executable centre remains this volume's pipeline package.

**Reachability note.** The current compiler checks reference integrity (knots
named by descriptors exist; placeholders resolve) but not end-to-end fact-type
reachability; the static input→knot→readiness→bind→emit path check is recorded
as a `validate`-stage candidate (Vol. 01 §7) and becomes mandatory at admission
in the Cell extension (Vol. 12 §6, check 11).

## 9. Format compatibility rules

1. Pipelines are the primary portable artefact between Nest implementations and
   products. A conforming implementation MUST accept this volume's grammar or
   reject with diagnostics — never reinterpret.
2. Compiled record shapes (Vol. 04 §2) are the compatibility surface between
   the loader and the machine; implementations exchanging pipelines MUST
   produce equivalent records for equivalent documents (the reference proves
   this with record-for-record fixture tests against the golden demo).
3. Grammar growth is additive behind explicit stage gates: a construct moves
   from rejected-future to compiled only together with its runtime, tests, and
   an update to this volume (the same-work-item rule of Vol. 00 §7).
4. `match` (authoring alias) normalises to `match_type` (canonical record
   field); `latest` normalises to the `overwrite` semantics. Aliases exist only
   at the authoring surface.
