# Volume 14 — Conformance, Compatibility, and the Seven Verification Matrices

Status: CURRENT · Snapshot date: 2026-07-14 ·
Previous: [13-ext-experience-protocols.md](./13-ext-experience-protocols.md) ·
Next: [15-terminology.md](./15-terminology.md)

This closing volume defines what "a conforming Nest implementation" means, the
compatibility surfaces between differing implementations, the regression
anchors of the reference implementation, and the verification instrument — the
seven matrices — through which this specification set itself is checked and
through which future changes should be checked.

## 1. Conformance classes

An implementation claims one or more classes; each subsumes the previous:

- **Class L — Log-conforming (reader/tooling).** Consumes and produces the
  envelope and JSONL of Vol. 03; implements derivations as pure functions of
  the log (Vol. 08 §8). Sufficient for trace tools, digest services, UIs.
- **Class M — Machine-conforming.** Class L plus the full obligations of
  Vol. 08 §6: propagation, topology dispatch and readiness reification, the
  two bundled strategies, the two descriptor forms, membrane semantics, the
  settle algorithm, honest terminal states, explicit rejection of unsupported
  constructs. Machine class (deterministic / semantic / hybrid) is declared
  alongside (Vol. 08 §5).
- **Class A — Authoring-conforming.** Class M plus the compiler of Vol. 09:
  grammar acceptance, closed-key discipline, path-anchored diagnostics,
  all-or-nothing compilation, schema subset, package layout.
- **Class E(x) — Extension-conforming.** Class A plus a named extension volume
  implemented in full, including its root-compatibility proof and regression
  catalogue (e.g. E(cells) per Vol. 12 §12).

## 2. Compatibility surfaces and anchors

Two implementations are compatible when they agree on three surfaces:

1. **The log** — envelope, kinds, protocol payloads, ordering, JSONL (Vol. 03,
   04). Test: exchange persisted runs; derivations agree.
2. **The algorithms** — propagation batches, dispatch, readiness, rendezvous,
   sweep, settle (Vol. 02, 05–08). Test: deterministic-class execution of the
   shared fixtures reproduces identical logs.
3. **The YAML core-structure formats** — pipeline grammar, record shapes,
   controller records, schema subset (Vol. 09). Test: identical documents
   compile to equivalent records or identical diagnostics.

### 2.1 The golden fixture

The normative deterministic-class anchor, embedded here in full. Programme:
the bundled demo pipeline exactly as printed in Vol. 01 §6, whose semantic
knot winds **locally** through the bundled integrator (join the collected
values with one space; grade with the demonstration heuristic of
refimpl 05 §6). Seeds: the compiled records, then two input facts on key
`session-123` carrying, in order, the messages
«I want to understand the question» and
«What is love?».

Required log — six tuples, byte-equivalent under the JSONL rules of
Vol. 03 §6 (field order not significant; values significant, including the
IEEE-754 grade):

```jsonl
{"kind":"sys.knot.defined","key":null,"payload":{"id":"intent.understanding","strategy":"semantic_evaluator","config":{"wind":{"collect":[{"as":"user_messages","match_type":"chat.message.received","reduce":"append","field":"message"}]},"condition":{"evaluate_understanding":true,"questions":["What is the purpose of the question?","What are the external conditions?"],"threshold_grade":0.8}}},"offset":0}
{"kind":"sys.descriptor.defined","key":null,"payload":{"id":"action.notify.business.analyst","subscribesTo":"intent.understanding","actionConfig":{"writes":"intent.understanding.ready"}},"offset":1}
{"kind":"domain.fact","key":"session-123","payload":{"factType":"chat.message.received","data":{"message":"I want to understand the question"}},"offset":2}
{"kind":"domain.fact","key":"session-123","payload":{"factType":"chat.message.received","data":{"message":"What is love?"}},"offset":3}

```

Why each line falls where it does: records at 0–1 (registration precedes
facts); the first message winds grade 0 (no keyword hits, one message) — no
readiness; the second raises the accumulated grade to
0.3+0.3+0.3+0.1 = 0.9999999999999999 ≥ 0.8 — readiness reified at 4 with the
snapshot taken before reset; the emit descriptor, activated by the committed
readiness, publishes at 5. A quiescent engine and an empty membrane settle
the run.

### 2.2 Further anchors

- **Compiler fixture**: the same pipeline document compiles to exactly the
  two records of offsets 0–1 (equivalent payloads), and the two-message input
  set translates to exactly the facts of offsets 2–3 — proving loader/record
  equivalence (Vol. 09 §9.2).
- **Negative anchors**: feeding only the first message yields a three-tuple
  log (the two records plus one fact) with **no** readiness and no final
  fact; unsupported constructs yield their exact "declared but not yet
  supported at this stage" / "unknown key" diagnostics (Vol. 09 §6.1); a
  missing controller credential on a discharging run fails the settle as a
  defect (Vol. 07 §2.5).
- The reference implementation's regression suite (51 tests at snapshot,
  refimpl 00 §2) is the executable form of these anchors; a port SHOULD
  translate it.

## 3. Specification governance

Restating Vol. 00 §7 as requirements: behaviour changes and their specification
changes land in the same work item; dated log entries are append-only; the
distinction CURRENT / DECLARED / PROPOSED / SEED is maintained; every structural
rule names its enforcement path (type boundary, narrow export, or regression
test); core widenings follow Vol. 11 §2 and are recorded in its table.

## 4. The seven verification matrices

Every substantial change to the machine, to an extension, or to this set is
checked through seven matrices. Each matrix is a dimension crossed with the
artefact under review; a cell is a question that must have a demonstrable
answer. The matrices operationalise, for specification work, the same
obligations the machine imposes on its programmes.

### 4.1 Truth

*Is every statement grounded in something inspectable?*

- Does each CURRENT claim trace to code or a test in the reference
  implementation? Each PROPOSED/SEED claim to its source document, without
  status inflation?
- Are limitations and non-goals stated where a reader would otherwise assume
  capability (declared-not-enforced, blind spots, open decisions)?
- Do examples reproduce (golden log offsets, YAML that compiles, shapes that
  match the reference type declarations described in refimpl)?
- Is failure honest — do the documents show what stalls and defects look like,
  not only success paths?

### 4.2 Deep

*Does the specification reach the load-bearing level, not the surface?*

- Are algorithms stated precisely enough to reimplement without reading the
  reference (registers, orders, latches, edge cases such as stale uids,
  one-shot rendezvous, batch append order)?
- Are invariants explicit where behaviour would be guessable but wrong
  (readiness reified before reset; sweep between runs, never inside apply;
  reservation before request)?
- Does each construct name *why* it exists (the obligation it serves), not
  only *what* it does?

### 4.3 Connect

*Does everything link — within the set, to the repository, to the seeds?*

- Do cross-references resolve (volume/section, file paths)?
- Is every term used as Vol. 15 fixes it; are collisions resolved explicitly
  (Nest naming note, the `cell` table)?
- Are the extension volumes connected back to the exact rails they use
  (Vol. 11 checklist), and forward from the rails to the volumes that use
  them?

### 4.4 Service

*Does the set serve its readers' work?*

- Can an implementer start from Vol. 02–08 and build; an author from
  Vol. 09–10 and write; an extension designer from Vol. 11–13 and design;
  a tool builder from Vol. 03–04 and parse?
- Are reference cards, tables, and checklists present where a reader will
  return repeatedly (tuple card, register file, obligations checklist)?
- Is normative vs descriptive vs demonstrative text distinguishable
  (RFC 2119, "reference implementation" markers)?

### 4.5 Knowledge

*Is the knowledge complete and duplicated nowhere?*

- Is every format, algorithm, register, and protocol of the current machine
  covered exactly once, with pointers elsewhere?
- Are the authoritative sources named where this set digests them
  (design proposal, seeds), so depth is never lost by summarisation?
- Are known unknowns catalogued as such (blind-spot sections) rather than
  omitted?

### 4.6 Evolution

*Can the machine and the set grow without breaking what stands?*

- Does every growth path have a rail and a discipline (extension points,
  widening table, reserved words, phase plans)?
- Are stage gates explicit — what moves a construct from DECLARED to CURRENT,
  from PROPOSED to implemented?
- Do compatibility rules protect old artefacts (root compatibility, absent
  `home`, byte-identical flat logs, additive sessions)?

### 4.7 Responsibility

*Are authority, trust, and consequence assigned?*

- Is it always decidable who may produce a fact (producer classes, ingress
  rules, control plane) and who may not?
- Are trust boundaries marked (untrusted model output, validation points,
  all-or-nothing registration, secrets outside records)?
- Are human decision points preserved against automation drift (review,
  promotion, capability approval), and are the four verdicts kept distinct?
- Does every budget name its accounting semantics, so responsibility for cost
  and termination is assignable?

### 4.8 Applying the matrices

For a change: build the 7 × (affected artefacts) grid; answer each cell or
record the gap; a red cell either blocks the change or lands in the honest-gap
sections (blind spots, open decisions) — pretending is the only non-conforming
option. The verification record of this set's initial publication is kept with
the work item that created it; subsequent revisions append theirs.

## 5. Non-conformance examples (for calibration)

- silently accepting an unknown YAML key (violates Vol. 09 §6.1; Truth);
- treating quiescence as success in a UI (Vol. 08 §7; Truth/Responsibility);
- a controller answering without the intention's uid (Vol. 04 §4–5; Connect);
- a shell holding run state not derivable from the log (Vol. 08 §8; Truth);
- an extension widening `raw_input` deny→allow in a nested declaration
  (Vol. 12 §3; Responsibility);
- re-discharging intentions after reloading a persisted log (Vol. 08 §9;
  Responsibility);
- two condition languages for one machine (Vol. 11 §4.2/4.5; Evolution).
