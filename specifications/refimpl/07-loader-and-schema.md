# refimpl 07 — Loader and Schema Subset

Status: CURRENT · Specifies against Vol. 09 ·
Previous: [06-runtime-and-wiring.md](./06-runtime-and-wiring.md) ·
Next: [08-shells.md](./08-shells.md)

The grammar, closed key sets, and validation rules are normative in Vol. 09;
this chapter records how the reference organises the work and the behaviours
a port must match beyond the grammar itself.

## 1. Document loading (`loadPipelineDocument`)

Accepts a path to a YAML file **or** a package directory (then reads its
`pipeline.yaml`). Returns `{document, resolveSchemaRef}` where the resolver
reads `JSON.parse` of a file relative to the package directory and **rejects
absolute paths and any reference normalising to an ancestor** (`..`): schema
references must stay inside the pipeline package —
`schema reference '<ref>' must stay inside the pipeline package`.

## 2. Compiler organisation (`compilePipeline`)

One pure function `(document, resolveSchemaRef?) → {pipelineId, title,
errors[], seeds[], inputs[]}` built from small helpers, each returning `null`
on failure after pushing path-anchored messages into a shared `errors`
accumulator:

- `reportKeys(path, record, allowed, future)` — the uniform closed-key check;
  future keys get the distinct "declared but not yet supported at this
  stage" message (the reserved words of Vol. 11 §5), everything else
  `"<path>.<key>: unknown key"`.
- `compileCollectRules` → normalised rules (`match` → `match_type`; default
  reducer `latest`); `compileWhereClauses`; both validate non-empty strings
  and closed keys per Vol. 09 §5.1.
- `compileSemanticConfig` — questions (≥ 1 string), numeric threshold,
  optional integrate/lane/budget; stamps `evaluate_understanding: true`.
- deterministic path — parses the condition against the declared slot names
  (chapter 03 §2) so authoring errors carry the parser's message.
- `compileOperatorDescriptor` — on/on_as, demands (unique scope names, known
  knots), `compileGates` (scope names checked against the statically known
  set), `compileServiceConfig`.
- `compileServiceConfig` — instruction; optional schema resolved through the
  callback and checked by `assertSupportedSchema` (§3), then **embedded**;
  `compileEmitDeclaration` (`writes` xor `unfold`).
- `compileUnfoldTemplate` — requires the service schema; `for_each` must name
  an array property with `items`; knot template via `compileKnotTemplate`
  (semantic only, id contains `{index}`); head (`writes` + `data` mapping);
  close (id, `demands_from_items` with `{index}` in both fields, optional
  gates, service whose emit must be simple `writes`); then
  `checkPlaceholders` walks every template string — `{item.*}` paths must
  exist in the items schema (`itemPathExists` follows nested `properties`),
  `{scope.*}` roots must be bound scope names.
- Seeds are emitted in document order — knots first, then descriptors — and
  **discarded entirely when any error exists** (all-or-nothing).

Inputs are collected independently of errors (shells can render forms for
invalid drafts). Branch ids are gathered with `main` implicit; anything
hanging off a non-`main` lane is rejected as future-stage.

**Liberty:** helper decomposition, error message phrasing beyond the
path-anchored pattern and the two distinct classes (unknown vs future);
diagnostic order. Not liberty: the closed key sets, the all-or-nothing rule,
alias normalisation, embedding of resolved schemas.

## 3. Schema subset (`schema/jsonSchemaSubset`)

Two exported functions, both pure:

- `assertSupportedSchema(schema, path)` — recursive keyword whitelist
  (Vol. 09 §7); unsupported keywords reported as
  `"<path>.<keyword>: unsupported JSON Schema keyword at this stage"`;
  recurses into `properties` and `items`; checks `type` against the closed
  type list and `required` as a string list.
- `validateAgainstSchema(value, schema, path = 'result')` — evaluation order:
  `enum` first (strict equality; failure short-circuits); then by `type`:
  object (required-presence, recurse into declared properties only — extra
  properties permitted), array (minItems/maxItems, recurse into items),
  string/boolean (typeof), number/integer (finite; integrality;
  minimum/maximum). Returns human-readable, path-anchored messages.

Used at compile time (assert, on authored schemas) and at discharge time
(validate, on the world's answers) — one subset, two moments.
