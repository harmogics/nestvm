# Volume 03 — The Wave Log: Envelope, Ordering, Persistence

Status: CURRENT · Snapshot date: 2026-07-14 ·
Previous: [02-machine-model.md](./02-machine-model.md) ·
Next: [04-tuple-reference.md](./04-tuple-reference.md)

The wave log is the machine's memory, instruction stream, and audit trail at
once. This volume specifies the tuple envelope, the ordering guarantees, the
attribution lanes, the correlation discipline, and the persisted wire format.
Compatibility between differing Nest implementations is defined first of all at
this surface.

## 1. The envelope

Every entry of the log is a **wave tuple**:

| Field | Type | Semantics |
| --- | --- | --- |
| `offset` | non-negative integer | The tuple's position in the log, assigned by the engine at append. Dense: the first tuple has offset 0 and each append increments by exactly 1. Never reused, never rewritten. |
| `kind` | string | The envelope kind, selecting the payload contract. The current closed set is in §2. |
| `key` | string or null | The attribution lane (§5). `null` for lane-less records (topology registrations). |
| `payload` | kind-specific record | Immutable content. For `domain.fact`, an open `{factType, data}` shape (Vol. 04). |

An **emission** is a tuple without `offset` — the form in which processors,
controllers, and shells hand content to the engine. Rules:

1. Emissions MUST NOT contain offsets; the engine alone assigns them.
2. A committed tuple and everything reachable from its payload MUST be treated
   as immutable. Implementations SHOULD enforce this (deep-freeze, persistent
   structures, or discipline plus tests).
3. Payloads MUST be JSON-representable values: no functions, no cycles, no
   non-finite numbers, no `undefined` inside records. (This is what makes §6
   and the digest rules of Vol. 12 §7 possible.)

## 2. Envelope kinds

The current machine dispatches exactly four kinds:

| Kind | Committed by | Payload | Reference |
| --- | --- | --- | --- |
| `sys.knot.defined` | loader, or a delegated emit template | `{id, strategy, config, emittedBy?}` | Vol. 04 §2.1 |
| `sys.descriptor.defined` | loader, or a delegated emit template | `{id, subscribesTo?, actionConfig?, operator?, emittedBy?}` | Vol. 04 §2.2 |
| `sys.knot.ready` | topology (readiness reification) | `{knotId, understanding}` | Vol. 04 §2.3 |
| `domain.fact` | inputs, knots, binds, controllers, shells | `{factType, data}` — the open fact shape carrying every protocol of Vol. 04 §3–5 | Vol. 04 §3 |

The kind set is part of the invariant core's stability surface: adding a kind is
a core widening under the discipline of Vol. 11 §2. Protocol growth happens
inside `domain.fact` via `factType` namespaces instead (this is how the proposed
Cell lifecycle stays on existing rails, Vol. 12 §5).

## 3. Ordering and happens-before

1. The log is totally ordered by `offset`; every processor and every membrane
   sweep observes tuples in exactly this order.
2. Emissions returned by one `apply` call are appended as a contiguous batch in
   returned order (Vol. 02 §7).
3. Asynchronous discharges re-enter as seeds of a later engine run; between two
   causally ordered tuples, unrelated tuples MAY therefore appear. **Consumers
   MUST rely on happens-before edges, never on adjacency.** (The Cell extension
   states its lifecycle partial order in exactly these terms, Vol. 12 §5.6.)
4. Causality is carried in payloads — correlation identities (§4), `triggeredBy`,
   `emittedBy` — not in envelope fields.

## 4. Correlation identities

Interaction with the world is asynchronous; the log keeps cause and answer
joined through correlation identities in payloads:

| Identity | Format | Minted by | Joins |
| --- | --- | --- | --- |
| winding uid | `<knotId>#<n>`, n from `WIND.CTR` | semantic knot | `inference.request` ↔ `inference.response` / `inference.reasoning` / `inference.failed` |
| service uid | `<bindId>#<n>`, n from `INTENT.CTR` | operator bind | `service.request` ↔ delegated publication / `service.reasoning` / `service.failed` |
| provenance stamp | `emittedBy: <service uid>` | delegated emit instantiation | sown records and head facts ↔ the sowing intention |

Rules:

1. A uid MUST uniquely identify its intention among the owner's unanswered
   intentions; service uids are unique per machine instance, winding uids per
   accumulation episode of the clew (exact semantics: Vol. 02 §4.7).
2. An answer MUST carry the uid of its intention verbatim; a knot MUST ignore
   correlated answers whose uid does not match its in-flight register.
3. The `emittedBy` stamp makes the sowing thread explicit on the log rather than
   recoverable by adjacency; the topology itself ignores the stamp.
4. Extensions defining new intention protocols MUST follow the same shape: mint
   at projection, echo in every answer, one terminal answer per intention
   (cf. the consumed-correlation rules of Vol. 12 §5).

## 5. Keys: attribution lanes

The `key` field partitions winding without partitioning the log:

1. Every registered knot winds **one clew per key** (Vol. 02 §4.2); facts on
   parallel keys accumulate independent understanding.
2. A readiness tuple carries the key of the fact that completed the clew; an
   operator bind maintains one rendezvous per key (Vol. 06 §4).
3. Winding and service intentions are projected on the key of their cause, and
   controllers MUST answer on the same key.
4. Topology registrations use `key: null`; they are lane-less and machine-wide.
5. A shell chooses keys at ingress (a session id, a case id). Keys are opaque to
   the machine; no format is imposed.

**Branches and ledgers (DECLARED).** The authoring format reserves named lanes
of a richer kind — branches (planes of breadth) and ledgers (levels of depth)
with declared isolation. They are parsed, validated, and rejected if used beyond
`main` (Vol. 09 §4); the runtime does not yet enforce them. Attribution today is
carried by keys, uids, and stamps alone — which bounds the machine to figures
whose lanes those can express (Vol. 11 §4.3).

## 6. Persisted wire format (JSONL)

A persisted run is a UTF-8 JSON-Lines file: exactly one tuple per line, in
offset order, each line a JSON object with the four envelope fields. The
reference serialisation writes fields in the order `kind`, `key`, `payload`,
`offset`; consumers MUST NOT depend on field order, only on names.

```jsonl
{"kind":"sys.knot.defined","key":null,"payload":{"id":"intent.understanding","strategy":"semantic_evaluator","config":{"wind":{"collect":[{"as":"user_messages","match_type":"chat.message.received","reduce":"append","field":"message"}]},"condition":{"evaluate_understanding":true,"questions":["…","…"],"threshold_grade":0.8}}},"offset":0}
{"kind":"sys.descriptor.defined","key":null,"payload":{"id":"action.notify.business.analyst","subscribesTo":"intent.understanding","actionConfig":{"writes":"intent.understanding.ready"}},"offset":1}
{"kind":"domain.fact","key":"nest-1","payload":{"factType":"chat.message.received","data":{"message":"…"}},"offset":2}
{"kind":"sys.knot.ready","key":"nest-1","payload":{"knotId":"intent.understanding","understanding":{"state":"…","grade":0.9}},"offset":3}
{"kind":"domain.fact","key":"nest-1","payload":{"factType":"intent.understanding.ready","data":{"triggeredBy":["intent.understanding"],"understanding":{"state":"…","grade":0.9}}},"offset":4}
```

Rules:

1. The JSONL line format MUST be identical across shells of one implementation
   (the reference CLI log tail and the Nest Studio run store are line-identical
   by test; refimpl 08 §1, §2.3).
2. Offsets in a persisted log MUST be dense from 0; a reader MAY verify and MUST
   NOT renumber.
3. A run metadata sidecar MAY accompany the log; the reference shape is
   `{id, pipelineRef, pipelineId, key, startedAt, finishedAt?, status:
   'running'|'settled'|'defect', defect?, tuples, failures, unanswered}`.
   Sidecars are derived convenience, never a second truth: `failures` counts
   committed `*.failed` facts; `unanswered` counts intentions without a
   correlated answer on the log.
4. Replay is reading: feeding a persisted log to derivations (digests, UI)
   MUST reproduce their outputs. Feeding it back into a live engine as
   continuation is NOT part of this specification (open decision, Vol. 11 §6).

## 7. Quiescence and the two cursors

Two independent cursors read the one log (Vol. 02 §4): the engine's propagation
cursor and the membrane's sweep cursor. From them the machine's global states
are defined:

- **Quiescent**: `ENGINE.CURSOR = |LOG|` — propagation has consumed every
  committed tuple and produced nothing further.
- **Settled**: quiescent and `DISCHARGE.TABLE` empty — additionally no external
  answer is pending. The settle algorithm (Vol. 08 §3) returns only here.
- **Settled unfinished**: settled, while a derivation of the log shows an open
  path — a stalled clew (budget exhausted below threshold), an unanswered
  intention, an operator bind with an incomplete rendezvous. This is a visible,
  honest terminal state, not an error (Vol. 08 §7).

## 8. Growth characteristics

Append-only history trades space for truth. Current known pressure points, fixed
here so no implementer designs against a hidden assumption:

- repeated readiness under `reset: never` multiplies snapshots; shells fold them
  at read time («×N» folding in the trace digest) until edge-triggered readiness
  and understanding-by-reference land (recorded future work, Vol. 11 §5);
- embedded schemas and packages enlarge records in exchange for self-contained
  replay — deliberate;
- retention, archival, and content-addressed externalisation of large bodies are
  extension-level concerns (Vol. 12 §10, Vol. 13 §4); the log proper carries
  bounded content and immutable references.
