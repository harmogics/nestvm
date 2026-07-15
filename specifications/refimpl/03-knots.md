# refimpl 03 — Knot Executors

Status: CURRENT · Specifies against Vol. 05 ·
Previous: [02-topology.md](./02-topology.md) ·
Next: [04-descriptors.md](./04-descriptors.md)

Two executors implement the accumulator lifecycle, sharing one matching
helper and one condition parser.

## 1. Rule matching (`knots/ruleMatches`)

One pure function used by both executors (and required for extension ingress,
Vol. 11 §4.2):

```ts
ruleMatches(rule, factType, data): boolean
  if rule.match_type ≠ factType → false
  for each clause of rule.where ?? []:
      value ← data[clause.field]
      if 'equals'     present and value ≠ clause.equals      → false
      if 'not_equals' present and value = clause.not_equals  → false
  return true
```

Comparisons are strict identity (`!==`/`===`); presence of the operator key —
not definedness of its value — selects the check.

## 2. Deterministic condition parser (`knots/parseDeterministicCondition`)

Parses the closed subset at load/registration time into a closure:

- split the source on `&&`; each trimmed part must match
  `^([A-Za-z_][\w.]*)\s*(!=|==)\s*null$`;
- a non-matching atom throws `Unsupported condition atom '<part>'; this stage
  supports 'name != null' and 'name == null' joined by '&&'.`;
- a name outside the declared slot names throws
  `Condition references unknown name '<name>'; declared names: <list>.`;
- the compiled predicate evaluates each check with loose null comparison
  (`== null` / `!= null` — both `null` and `undefined` count as absent).

The parser is called twice in the reference: by the compiler (authoring error
path, Vol. 09 §5.1) and by the executor's constructor (defence at
registration).

## 3. `DeterministicKnot`

State: `collected: Map<string, unknown>` plus the parsed condition.

- `matches`: `domain.fact` and at least one rule accepts (§1).
- `wind`: for **every** accepting rule — extract `data[field]` when `field`
  is declared, else the whole `data`; `append` pushes into an array slot,
  otherwise overwrite the slot. Returns `[]` always.
- `test`: the parsed conjunction over `collected.get(name)`.
- `understanding`: the plain record of the collected map.
- `reset`: clear the map unless `reset: 'never'`.

## 4. `SemanticKnot`

State registers (Vol. 02 §4.3): `collectedData: Record<string, string[]>`,
`woundState: string` (`''` initial), `grade: number` (0), `queuedDeltas:
string[]`, `inFlightUid: string | null`, `windCounter: number`. Constructor
takes `(id, config, integrateLocally)`.

### 4.1 Matching

`domain.fact` and (own integration ∨ some rule accepts). *Own integration*:
`factType === 'inference.response'` ∧ winding policy is `through_world` ∧
`data.knotId === this.id`. Reasoning and failure facts are deliberately not
matched (a failure therefore leaves the clew in flight — the honest stall,
Vol. 04 §4.4).

### 4.2 Delta extraction (`deltaOf`)

`value ← rule.field ? data[rule.field] : undefined`; `text ← typeof value ===
'string' ? value : JSON.stringify(data)` — i.e. a missing field declaration
**or** a non-string field value falls back to the whole data as JSON. With
more than one collection rule the delta is labelled `"[<rule.as>] <text>"`
(canvas provenance, Vol. 05 §5.4); with one rule it stays raw.

### 4.3 Local winding

For each accepting rule: `append` pushes the delta into `collectedData[as]`,
otherwise slot position 0 is overwritten. Then
`integration ← integrateLocally(flatten(values of collectedData))`;
`woundState ← integration.state`; `grade ← integration.grade`. No emissions.

### 4.4 Through-world winding — tact one

Queue the labelled deltas of all accepting rules, then
`projectWindingIntention(key)`:

```text
if inFlightUid ≠ null ∨ queuedDeltas empty → []
if budget defined ∧ windCounter ≥ budget   → []          (stall, visible)
windCounter += 1
uid ← `${id}#${windCounter}`; deltas ← queuedDeltas; queuedDeltas ← []
inFlightUid ← uid
emit one inference.request on the clew's key:
  { knotId: id, uid, questions: condition.questions,
    state: woundState, deltas, lane? }
```

### 4.5 Through-world winding — tact two

On an own integration: if `data.uid ≠ inFlightUid` → ignore (`[]`). Else
adopt `state`/`grade`, clear `inFlightUid`, and call
`projectWindingIntention` again — queued deltas wait their turn, budget
permitting.

### 4.6 Readiness, snapshot, reset

`test`: `condition.evaluate_understanding ∧ grade ≥ threshold_grade`.
`understanding`: `{ state: woundState, grade }`. `reset` (unless `never`):
clear all six registers — collected data, state, grade 0, queue, in-flight,
**and the wind counter** (the budget is per accumulation episode, not per
clew lifetime).

**Liberty:** internal buffering structure; string-building; none of the
observable protocol (uid format, one-in-flight, budget refusal point, label
format, fallback-to-JSON rule) is liberty — each is visible on the log.
