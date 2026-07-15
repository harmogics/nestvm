# refimpl 05 — Membrane, Controllers, Emit-Template Instantiation

Status: CURRENT · Specifies against Vol. 04, 06 §7, 07 ·
Previous: [04-descriptors.md](./04-descriptors.md) ·
Next: [06-runtime-and-wiring.md](./06-runtime-and-wiring.md)

## 1. `Membrane`

State: `cursor: number` and the readonly controller list. One method:

```ts
sweep(log): Promise<emissions>[]
  while cursor < log.length:
      t ← log[cursor++]
      for each controller: if controller.claims(t): collect controller.discharge(t)
  return collected           // promises started, not awaited
```

Exactly-once per offset per runtime; several controllers may claim one tuple;
sweeping happens between engine runs only (the runtime drives it, chapter 06).

## 2. The service/inference controller

One controller discharges both intention protocols against an OpenAI-style
chat-completions HTTP API. Construction: `(config, { apiKey?, fetchImpl? })` —
`fetchImpl` is a narrow structural fetch contract so tests inject a
deterministic double; `apiKey` resolves at wiring (§4).

`claims`: `domain.fact` with factType `inference.request` or
`service.request`.

`discharge` first checks the key: a missing API key **throws** (configuration
defect → the settle fails; Vol. 07 §2.5), with a message naming the variable
and the fix. Then branches by factType.

### 2.1 Completion call (shared)

`complete(messages)` performs one POST to `<baseUrl>/chat/completions` with
body `{model, messages, stream: false, max_tokens, reasoning_effort}` and an
abort timer of `timeoutMs`. Non-OK status throws `HTTP <status>: <excerpt>`;
a malformed body throws with an excerpt. Returns
`{content: choices[0].message.content, reasoning: message.reasoning ?? ''}`
(reasoning only when the API returned a string field of that name).

`excerpt(text)`: whitespace-flattened, truncated to 200 characters with an
ellipsis — the bound on error/reason payloads. `reasonOf(error)`: an abort
reads `timeout after <timeoutMs>ms`; otherwise the error message.

### 2.2 Winding discharge

Prompt = fixed system prompt (the integration task: rewrite STATE into one
updated, self-contained understanding absorbing the DELTAS and addressing the
QUESTIONS; grade in [0,1]; reply as a single JSON object
`{"state","grade"}`) + user content assembled as three labelled sections —
`QUESTIONS:` (bulleted), `STATE:` (the literal text or `(empty)`), `DELTAS:`
(bulleted).

Answer handling: `extractIntegration` = `extractJsonObject` (§2.4) then shape
check (`state` string, `grade` finite number, clamped to [0,1]); a failure to
extract yields `inference.failed` with reason
`unparsable integration: <excerpt>`. Success emits `inference.response`
`{knotId, uid, state, grade, lane?}` (lane echoed only when the request had
one) plus `inference.reasoning {knotId, uid, reasoning}` when the trimmed
reasoning is non-empty. Every thrown error inside the branch is caught and
converted to `inference.failed` with `reasonOf`.

### 2.3 Service discharge

Prompt = fixed operator system prompt (execute the INSTRUCTION over the
SCOPE; reply with a single JSON object conforming to the JSON SCHEMA) + user
content sections `INSTRUCTION:`, `SCOPE:` (pretty JSON, two-space indent),
and `JSON SCHEMA:` when declared.

Answer handling: `extractJsonObject`; failure →
`service.failed: unparsable operator answer: <excerpt>`. When a schema is
declared, validate (chapter 07 §3); violations join with `; ` into
`answer violates the declared schema: …` → `service.failed`. Then publish
under the declaration: `writes` → one fact `{bindId, uid, result}` of the
declared type; `unfold` → the instantiated batch (§3). Add
`service.reasoning` when non-empty. Same catch-all conversion to
`service.failed`.

The two fixed system prompts are the reference's encoding of the portable
task semantics (Vol. 07 §4.1–4.2). **Liberty:** wording, language, provider,
transport — provided the observable contract (sections available to the
oracle, single-JSON-object reply discipline, clamping, failure conversion,
correlation echo) is preserved.

### 2.4 JSON extraction

`extractJsonObject(content)`: take the substring from the first `{` to the
last `}`; `JSON.parse`; require a non-array object; otherwise null. Tolerant
of prose around the object by design; not a streaming parser.

## 3. Emit-template instantiation (`instantiateEmitTemplate`)

Pure function `(template, answer, scope, key, emittedBy) → emissions`,
implementing Vol. 06 §7:

- `items ← answer[template.for_each]`; not a non-empty array → throw (the
  caller converts to `service.failed`).
- Contexts: `{index: position + 1, item, scope}`.
- Placeholder grammar: `{index}`, `{item(.segment)*}`, `{scope(.segment)+}`
  (`\w`+`-` segments). `resolvePath` walks the context; resolving to
  `undefined` throws `emit template: placeholder '{path}' resolved to
  nothing`.
- `substitute`: strings that are exactly one placeholder keep the resolved
  raw type; embedded placeholders stringify (non-strings via JSON); arrays
  and records recurse; other values pass through.
- Emission order: per-item `sys.knot.defined` (payload = substituted knot
  template + `emittedBy`, key `null`) → one closing `sys.descriptor.defined`
  (operator with per-item substituted demands, optional gates, the service
  verbatim, `emittedBy`, key `null`) → per-item head facts (declared type,
  the **intention's** key, substituted data + `emittedBy`).

## 4. Controller configuration and key resolution

The wiring reads one YAML controller record (shape and semantics: Vol. 07 §5)
and validates: non-empty `id`, `model.name`, `model.base_url` (trailing slash
stripped), `model.reasoning_effort` ∈ {high, max}, positive
`budget.max_tokens` and `budget.timeout_ms`. Any violation throws at
assembly.

Key resolution: the environment variable `TOGETHER_API_KEY` wins; otherwise a
project-root `.env` file is scanned for the line
`TOGETHER_API_KEY=<value>` (surrounding quotes stripped); absence yields
`undefined` — wiring still succeeds and the first discharge fails as a
defect. **Liberty:** variable name, secret store — the pattern (secret
outside records, loud defect on absence) is the requirement.

## 5. Deterministic double (`InferenceStubController`)

Test-only controller claiming `inference.request`: answers with
`state = join(' ')` of the request's state and deltas (empty parts dropped),
`grade = heuristic([state])`, lane echoed. It makes the winding protocol
executable in the deterministic class and is the pattern for any
deterministic winding controller.

## 6. Demonstration heuristic

The bundled grading function over the collected texts (lower-cased,
concatenated): +0.3 if it contains «хочу» or «нужно»; +0.3 for «бюджет» or
«деньги»; +0.3 for «срок» or «завтра»; +0.1 when more than one message
contributed. Sum in IEEE-754 doubles — the golden fixture's grade
`0.9999999999999999` is this accumulation (Vol. 14 §2). It doubles as the
default local integrator's grader (chapter 02 §4). A port reproducing the
golden log MUST reproduce this function exactly, keyword strings included.
