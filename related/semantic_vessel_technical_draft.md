# Semantic Vessel — Technical Architecture Draft

**Status:** Working Draft  
**Scope:** API contract, field semantics, command invariants, implementation sequence

---

## 1. Core Premise

Vessel is a **stateful semantic object** with a REST API. It does not contain execution logic. Commands arrive from an external linear recipe (N8N pipeline, script, or other orchestrator). Vessel receives commands, mutates its internal field, and returns results. The separation is strict: **recipe = orchestration, Vessel = state + field + transformation**.

---

## 2. Vessel Structure

### 2.1 Source

The central fragment of the Vessel. Every level of unfolding begins from the source. Merge replaces the source and resets the field for a new cycle.

### 2.2 Force Line

The trace of commands executed against this Vessel. Not an internal queue — a log of external calls. Each entry records: command type, phase, input axes, output fragments, timestamp.

### 2.3 Information Field

A dynamic structure of **lines** and **fragments**.

- **Line**: a semantic thread with a current central fragment, an origin command, a relation to the source, and an axis label (aspect). A line may be active, stopped, or waiting.
- **Fragment**: the atomic unit of meaning. Has: `id`, `text`, `kind`, `source_command_id`, `relation_to_source`, `transformation_chain[]`, `metadata{}`.

### 2.4 Phase

The Vessel's current macro-phase: `Truth → Deep → Connect → Service`. Phases are set externally by the recipe. They influence prompt template selection at the Deep layer. During Service (Govern), each incoming question spawns an internal sub-cycle: `Truth → Deep → Connect → Service → Knowledge → Responsibility`.

---

## 3. Fragment System

### 3.1 Fragment Kinds

Fragments are typed. The `kind` field determines how a fragment participates in operations:

| Kind | Semantics | Example |
|------|-----------|---------|
| `text` | Raw unstructured text | Source document paragraph |
| `question` | A directed inquiry with force role | "How does Art.17 apply to backups?" |
| `concept` | Named semantic unit | "Right to erasure" |
| `statement` | An assertion with truth-evaluable content | "Backups must be purged within 30 days" |
| `selector` | A query/filter pointing to external data | `{ field: "category", equals: "data_protection" }` |
| `action` | An executable instruction for an external agent | `{ agent: "airtable", operation: "lookup", params: {...} }` |
| `evaluation` | A confidence/relevance assessment result | `{ score: 0.82, basis: "...", gaps: [...] }` |

### 3.2 Kind Reduction Table

A configurable table that defines transformation paths between kinds. This is the mechanism by which axes resolve to `plain` before the core LLM call.

```
selector  → [AirtableLookup]   → question[]
selector  → [AirtableLookup]   → text[]
question  → [AgentResolve]     → action → [AgentExecute] → text
question  → [identity]         → question  (already plain)
text      → [identity]         → text      (already plain)
```

Each row: `source_kind → [transformer] → target_kind`. Transformers are **pluggable**: an interface with `canTransform(from, to): boolean` and `transform(fragment): Fragment[]`.

The reduction chain is walked until `kind = plain_kind` (configurable per command, default: `text` or `question`). If no path exists → **failure → stop** (on first stage).

### 3.3 Pluggable Fragment Locators

Fragments referenced by axes may live in different stores. A **FragmentLocator** interface:

```
interface FragmentLocator {
  type: string                              // "airtable", "qdrant", "inline", ...
  resolve(axis: Axis): Promise<Fragment[]>
}
```

On the first stage, one locator: `AirtableLocator`. Axis `{ name: "Truth", type: "plain", kind: "questions" }` → AirtableLocator queries table `Questions`, filter `axis = "Truth"`, returns `Fragment[]` with `kind: "question"`.

Later: `QdrantLocator` (semantic search), `InlineLocator` (fragments passed directly in API body), `AgentLocator` (delegates to an external agent).

---

## 4. Command Invariant: Resolve

All commands share a single core pipeline:

```
Resolve(vessel, line, axes, phase) → ResultFragment

  1. axes.forEach(axis =>
       locator.resolve(axis)           // FragmentLocator
       → reductionTable.reduce(frags)  // Kind Reduction Table
     )
  2. buildContextBundle(source | line.center, resolvedAxes)
  3. selectTemplate(phase, axis.kinds)   // Deep layer decision
  4. assembleLLMCall(template, bundle)    // Pluggable LLM adapter
  5. execute() → rawResult
  6. parse(rawResult) → ResultFragment | ResultFragment[]
```

Every command calls Resolve. Commands differ **only** in what they do with the ResultFragment.

---

## 5. Commands

### 5.1 Stop

The **minimal command**. Full Resolve pipeline, zero mutation.

```
POST /api/vessels/{id}/stop
{
  "line_id": "...",          // optional: specific line, or all active lines
  "axes": [...]              // optional: additional evaluation axes
}
```

**Algorithm:**
1. `Resolve(vessel, line, axes, phase) → evalFragment`
2. `evaluate(line.center, evalFragment) → Decision`
3. Decision is one of:
   - `continue` — line proceeds, no state change
   - `stop` — line marked as stopped
   - `wait(question)` — line marked as waiting, question registered as a blocker

**Wait** is a sub-case of Stop where the evaluation produces an explicit unanswered question.

Evaluate itself is an LLM call: prompt receives both `line.center` and `evalFragment`, asks "should this line continue, and if not, what is missing?"

### 5.2 Fold

Resolve + replace central fragment of current line.

```
POST /api/vessels/{id}/fold
{
  "line_id": "...",
  "axes": [
    { "name": "context", "type": "selector", "kind": "articles",
      "value": { "field": "scope", "equals": "gdpr_ch3" } }
  ]
}
```

**Algorithm:**
1. `Resolve(vessel, line, axes, phase) → newFragment`
2. `line.center = newFragment`
3. Transformation chain recorded: `[previous_center] → fold(axes) → [newFragment]`

**Directionality:** Fold pulls understanding **from the field into the line**. The axes point outward to find fragments that are then synthesized into a new center.

### 5.3 Unfold

Resolve + split result into multiple new lines.

```
POST /api/vessels/{id}/unfold
{
  "axes": [
    { "name": "Truth", "type": "plain", "kind": "questions" },
    { "name": "Deep", "type": "plain", "kind": "questions" }
  ]
}
```

**Algorithm:**
1. `Resolve(vessel, source, axes, phase) → resultFragments[]`
2. For each fragment: create new Line with fragment as center
3. Each line tagged with its origin axis

**Directionality:** Unfold pushes understanding **from the center outward** into new lines. Axes define the directions of expansion.

**Parse step note:** The Resolve pipeline here must produce multiple fragments. This may require:
- One LLM call → structured Markdown → second LLM call or deterministic parser → Fragment[]
- Or one LLM call with JSON mode → Fragment[] directly

On the first stage: two-call approach (Markdown → JSON) for observability.

### 5.4 Merge

Resolve over all active line centers + replace source.

```
POST /api/vessels/{id}/merge
```

**Algorithm:**
1. Collect `center` fragments from all active (non-stopped) lines tied to current source
2. These centers become the input (instead of axes)
3. `Resolve(vessel, source, centers_as_axes, phase) → newSource`
4. `vessel.source = newSource`
5. All lines collapse into a single new central line
6. Field reset: ready for next unfolding cycle

**Irreversibility:** Merge is a commitment point. The recipe should log or snapshot Vessel state before Merge if rollback capability is needed.

### 5.5 Govern

Orthogonal to Stop. Waits for external questions, matches them to lines, creates per-question execution contexts.

```
POST /api/vessels/{id}/govern
{
  "question": "How does Art.17 apply to backup systems?",
  "source_space": "vessel:other-id:line:xyz"    // optional: origin reference
}
```

**Algorithm:**
1. Receive question as a Fragment with `kind: "question"`
2. **Match:** For each active line, run a lightweight Resolve:
   - `Resolve(vessel, line, [question_as_axis], phase) → matchFragment`
   - `evaluate(line.center, matchFragment) → relevance_score`
3. Lines with relevance above threshold accept the question
4. **Place:** For each accepting line, the question is incorporated:
   - Question becomes part of the line's context (not replacing center, but augmenting it)
   - One-directional link to `source_space` is recorded
5. **Spark:** Each question-line binding is a Spark — a point where the external recipe can now run a sub-cycle (`Truth → Deep → Connect → Service → Knowledge → Responsibility`) scoped to this question on this line

**First stage:** Govern = `waiting for human`. Human submits question via REST. Match runs automatically. Spark triggers a pre-defined sub-recipe externally.

**Multi-entry:** Govern does not close after accepting one question. Multiple questions can enter, each matched independently, each spawning its own Spark.

---

## 6. Layered Execution Model

Each command passes through four layers:

| Layer | Responsibility | Boundary |
|-------|---------------|----------|
| **Service** | REST endpoint. Validate input, load Vessel state, persist results, return response. | HTTP contract |
| **Connect** | Resolve axes via FragmentLocators. Reduce fragment kinds via Reduction Table. Build ContextBundle. | Data assembly |
| **Deep** | Select LLM adapter, prompt template, parse strategy based on phase + kind configuration. | Strategy selection |
| **Truth** | Execute LLM call(s). Parse results into typed fragments. Record transformation chains. | Execution |

Each layer has a clean interface to the next. Layers are independently testable. On the first stage, each layer may be a single function; the boundary matters, not the deployment unit.

---

## 7. ContextBundle

The object passed from Connect to Deep:

```
ContextBundle {
  source: Fragment                    // Vessel source or line center
  axes: [
    {
      name: string
      originalKind: string
      resolvedFragments: Fragment[]   // after reduction to plain
      reductionTrace: TransformStep[] // for observability
    }
  ]
  phase: Phase
  vessel_id: string
  line_id?: string
  metadata: {
    depth: number                     // current unfolding level
    active_lines: number
    govern_sparks: number
  }
}
```

---

## 8. Pluggable LLM Adapter

```
interface LLMAdapter {
  id: string
  assemblePrompt(template: PromptTemplate, bundle: ContextBundle): Prompt
  execute(prompt: Prompt): Promise<RawResult>
  parse(raw: RawResult, strategy: ParseStrategy): Fragment | Fragment[]
}
```

Template selection logic lives in the Deep layer. The adapter only assembles and executes. Templates are stored externally (Airtable or filesystem on first stage).

---

## 9. Implementation Sequence

Based on the invariant structure, the build order follows minimal mutation:

### Phase 1: Resolve + Stop
- Fragment model and persistence (Airtable)
- AirtableLocator (single FragmentLocator)
- Kind Reduction Table (hardcoded, 3-4 rows)
- ContextBundle assembly
- Single LLM adapter (Claude)
- Single prompt template (evaluation)
- Stop command end-to-end
- **Deliverable:** a Vessel that can load a source fragment, resolve axes from Airtable, call LLM, and produce a continue/stop/wait decision

### Phase 2: Fold
- Fold endpoint reusing Resolve
- Line center replacement logic
- Transformation chain recording
- Different prompt template (synthesis)
- **Deliverable:** a Vessel that can pull external fragments into a line and update its center

### Phase 3: Unfold
- Multi-fragment parse strategy (Markdown → JSON two-call)
- Line creation logic
- Axis-to-line mapping
- **Deliverable:** a Vessel that can expand its source into multiple semantic lines

### Phase 4: Merge
- Multi-line center collection
- Source replacement
- Field reset
- State snapshot before merge (for diagnostics)
- **Deliverable:** full unfolding cycle (Unfold → work → Merge → new level)

### Phase 5: Govern
- Question intake endpoint
- Match evaluation (lightweight Resolve per line)
- Spark registration
- Sub-recipe triggering interface
- **Deliverable:** a Vessel that accepts external questions and binds them to its semantic field

### Phase 6: Extensions
- Additional FragmentLocators (Qdrant, Agent)
- Additional LLM adapters
- Richer Kind Reduction Table (configurable, not hardcoded)
- Govern with recipe library (automatic path finding)
- Wait-to-Govern cross-vessel linking

---

## 10. Failure Model (First Stage)

Any failure at any layer → **full stop**. The Vessel records the failure point (layer, command, axis, fragment) and halts. External recipe receives an error response and decides whether to retry or abort.

No partial execution. No fallback. No retry logic inside Vessel. This is deliberate: on the first stage, clean failure signals are more valuable than resilience. Every failure is a diagnostic opportunity.

---

## 11. Open Questions

1. **Axis → Line cardinality in Unfold:** Does one axis always produce one line, or can it produce many? Current assumption: one axis → one line with a single center fragment that synthesizes all content for that axis. Multiple fragments per axis are folded into one center during parse.

2. **Govern placement semantics:** When a question is placed into a line, does it augment the center or replace it? Current assumption: augment (question is added as context alongside the existing center, not replacing it).

3. **Sub-cycle depth:** Spark sub-cycles (Truth→...→Responsibility) — are they flat or recursive? Current assumption: flat. A sub-cycle cannot spawn another sub-cycle. This may change after Phase 5 experience.

4. **Cross-vessel linking:** Stop produces `wait(question)`. This question could be routed to another Vessel's Govern. The linking mechanism (message bus, direct API call, manual routing) is deferred to Phase 6.
