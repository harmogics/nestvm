# refimpl 08 — Shells: CLI and Nest Studio

Status: CURRENT · Specifies against Vol. 08 §8–10 ·
Previous: [07-loader-and-schema.md](./07-loader-and-schema.md)

Shells are not required for Class M conformance; this chapter is the design
record of the reference shells and of the persistence/derivation behaviours
that **are** normative wherever a shell exists (JSONL format, purity of
derived readings, honest terminal states).

## 1. CLI

A thin bootstrap dispatches four invocations:

- **bare start** — runs the bundled demo: the `demo.intent` pipeline on key
  `session-123` fed the two classic seed messages
  «Привет, мне нужна помощь с проектом.» and
  «Хочу разработать сайт. Бюджет 1000$, срок до завтра.» — the run that must
  reproduce the golden log (Vol. 14 §2);
- **`run <pipeline> [--key k] [--<input> v]…`** — load, compile (errors
  listed, non-zero exit), parse flags as `--name value` pairs (repeated flags
  collect in order; `--key` defaults to `cli`), translate inputs
  (chapter 06 §3; the first unknown input aborts, listing the declared ones),
  assemble, settle; a failed settle reports the defect with non-zero exit;
  on success the final log is printed one JSON tuple per line — the **log
  tail**, byte-identical in line format to the persisted JSONL;
- **`validate <pipeline>`** — compile only; prints either the error list
  (non-zero exit) or a one-line summary with knot/descriptor/input counts;
- **`nest [--port N]`** — starts the workbench server (§2) and prints its
  address.

Diagnostic text around the tuples is free-form; the tuple lines themselves
are the contract.

## 2. Nest Studio server

One `node:http` server bound to `127.0.0.1` (default port 4242), serving
vanilla static assets and a JSON API. Construction seams for tests: `port`,
`runsDir`, `catalogRoot`. The API key never reaches the browser. Request
bodies are JSON, capped at 1 MB; errors return `{error}` with honest 400/404
codes.

### 2.1 API surface

| Method and path | Behaviour |
| --- | --- |
| GET `/api/pipelines` | the catalogue (§2.2) |
| GET `/api/pipelines/read?ref=` | raw files of one entry (`pipeline.yaml` + sorted `schemas/*`) |
| GET `/api/pipelines/document?ref=` | the authoring bundle: parsed document + schemas map |
| POST `/api/author/parse` | YAML text → `{document}` or 400 `{error}` with the parser's message |
| POST `/api/author/compose` | document → `{yaml}` (same YAML library both ways) |
| POST `/api/author/validate` | document + in-memory schemas → compiler verdict `{pipelineId, title, valid, errors, inputs}` |
| POST `/api/drafts` | write a draft package; body carries `name` + (`yaml` or `document`) + `schemas`; returns 201 with the verdict — **work in progress saves with its errors** |
| DELETE `/api/drafts/:name` | remove a draft (names confined to the drafts subtree) |
| POST `/api/templates` | promote a draft proven by a settled run (§2.4) |
| POST `/api/runs` | start a run: `{ref, key = 'nest', inputs}` → 202 `{runId}` or 400 |
| GET `/api/runs` | run metadata list, newest first |
| GET `/api/runs/:id` | `{meta, log}` |
| GET `/api/runs/:id/events` | SSE feed (§2.3) |
| GET `/api/runs/:id/digest` | `{digest: TraceDigest}` (§3) |

Draft and template names must match `^[a-z0-9][a-z0-9._-]*$` (case-insensitive)
— the escape-proofing rule for file-backed catalogues.

### 2.2 Catalogue

Scans the pipelines root: top-level `.yaml` files and package directories are
`bundled`; the `drafts/` and `templates/` subtrees yield kinds `draft` and
`template`. Every entry is compiled on listing, so the catalogue carries live
verdicts: `{ref, pipelineId, title, kind, isPackage, valid, errors, inputs,
provenance?}` — an unreadable entry degrades to `valid: false` with the load
error. Template provenance is read from the `template.json` sidecar.

### 2.3 Runs and the live feed

Starting a run: load and compile the referenced pipeline (first error →
refusal), translate inputs, mint the run id (ISO timestamp with `:`/`.`
replaced by `-`, plus a counter), persist the initial metadata, then settle
**in the background** on a fresh assembly whose only observer is a mirror
that (a) appends each tuple to `<id>.jsonl`, (b) forwards it to SSE
listeners. On completion the metadata gains the honest terminal state
(`settled` or `defect` + message), finish time, and the derived counters:
`tuples`, `failures` (committed facts whose type ends `.failed`),
`unanswered` (uids of `inference.request`/`service.request` facts with no
later fact carrying the same uid).

SSE protocol: on subscribe, replay every committed tuple as `tuple` events;
then send `status` with the current metadata; a finished run closes with
`end`, a running one stays live until the settle completes (then `status`,
`end`, close). A shell reading only this stream reconstructs the same
surface as the live view — replay is reading.

Run store: `<id>.jsonl` (one tuple per line, exactly the CLI tail format) and
`<id>.meta.json` (pretty-printed metadata sidecar, Vol. 03 §6.3).

### 2.4 Promotion

`POST /api/templates {name, sourceRef, runId}`: refuses non-drafts (only
`drafts/*` promote), unknown runs, runs not `settled`, and runs of a
different `pipelineRef`. Promotion copies the draft package into
`templates/<name>/` and writes the `template.json` sidecar
`{promotedFrom, sourceRun, promotedAt}`. The exact package that ran is what
is promoted; nothing is rewritten.

### 2.5 Authoring bundle

The brick constructor edits the parsed document directly; schemas travel as
parsed JSON keyed by package-relative name; validation resolves schema
references against that in-memory map (falling back to the name without the
`schemas/` prefix) — same compiler, no files needed. YAML in and out goes
through the same library the loader uses, so raw text remains a first-class
equivalent view.

## 3. Trace digest (`digestTrace`)

A pure function of the log producing the vault of lids (Vol. 08 §8). Shapes:

```ts
TactDigest  { uid, requestOffset, sibling, responseOffset?, grade?,
              reasoningOffset?, failedOffset?, failedReason? }
KnotDigest  { knotId, as?, sownBy?, readinessCount, lastGrade?,
              lastReadyOffset?, statePreview?, tacts[] }
BindOutcome fact {factType, offset} | unfold {sownKnots[], closeBind?, headOffsets[]}
            | rejected {offset, reason} | failed {offset, reason} | pending
BindDigest  { bindId, kind: operator|emit, sownBy?, outcome, requestOffset?,
              uid?, instruction?, scopeKeys?, reasoningOffset?, activation?, demands[] }
TraceDigest { binds[], freeKnots[] }
```

Derivation outline:

1. Index registrations (with `emittedBy` as `sownBy`) from the system tuples.
2. Fold winding tacts per knot by uid: request offset (with a `sibling` flag
   when any delta starts with `[sibling]`), response offset + grade,
   reasoning offset, failure offset + reason.
3. Fold readiness per knot: count, last offset, last grade, a 200-character
   state preview.
4. For each operator bind: find its `service.request` by bindId; resolve the
   outcome in precedence order — `bind.rejected` (by bindId) → `service.failed`
   (by uid) → a delegated fact (same uid + bindId, excluding
   request/reasoning) → an unfold (from the intention's own emit declaration
   and/or `emittedBy` stamps: sown knots from stamped records, else the
   declared close's demands; head offsets from stamped facts) → `pending`.
   Attach instruction preview (300 chars), scope keys, activation and demand
   knot digests.
5. For each emit descriptor: outcome is the first fact of its declared type,
   else `pending`.
6. Sort lids by outcome offset descending with `pending` as +∞ (open lids
   float to the top); knots claimed by no bind are listed as `freeKnots`.

Notes: reading the unfold from the intention's declaration keeps pre-stamp
logs readable; folding by uid means a winding uid reused across accumulation
episodes (chapter 03 §4.6) collapses to the latest tact — a known, accepted
read-time simplification.

## 4. Static client

Three vanilla scripts (app/run views, authoring bricks, trace vault) over the
API — no framework, no bundler, explicit `window` entry points. Not part of
compatibility; the derivation purity behind every rendered element is.
