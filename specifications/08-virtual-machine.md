# Volume 08 — The Nest Virtual Machine: Assembly, Settle, Classes, States

Status: CURRENT · Snapshot date: 2026-07-14 ·
Previous: [07-membrane-and-controllers.md](./07-membrane-and-controllers.md) ·
Next: [09-authoring-formats.md](./09-authoring-formats.md)

This volume assembles the parts of Vol. 02–07 into the machine as a whole: the
assembly rule, the settle algorithm that drives a wave to rest, the determinism
and replay guarantees per machine class, the honest terminal states, and the
derived-reading discipline for shells. A conforming Nest VM in any host language
is defined by this volume plus the formats it references.

## 1. Assembly

One machine instance is assembled as:

```text
NestVM = Runtime( Engine([ Topology(strategyRegistry), …observers ]),
                  Membrane([ …controllers ]) )
```

Rules:

1. **One assembly per product.** Every shell of one product (CLI, workbench,
   chat, tests) MUST drive the same assembly function, differing only in how
   seeds are fed and the log is read. Behaviour identical by construction.
2. Observers are plain processors registered beside the topology; observation
   never touches the core (the reference `LogMirror` feeds both the persisted
   JSONL store and live feeds from one sink).
3. Controllers are installed statically at assembly (Vol. 07 §2.6).
4. The topology is one processor among processors — replaceable by a routing
   processor that owns local topologies, which is exactly the Cell extension's
   move (Vol. 12 §4): `Engine([CellSpace(root: Topology), …observers])`.

Reference demonstration:

```ts
export function assembleWave(observers: readonly WaveProcessor<AnyTuple>[] = []) {
  const controller = new TogetherInferenceController(loadTogetherInferenceConfig(), {
    apiKey: resolveTogetherApiKey()
  });
  return new WaveRuntime(
    new WaveEngine<AnyTuple>([new TopologyGraph(), ...observers]),
    new Membrane([controller])
  );
}
```

## 2. Inputs: seeds

A run begins with **seeds**: the compiled pipeline's individual records followed
by the declared input facts (`buildInputFacts` translates named input values to
facts of the declared types on the chosen key). Seeds are ordinary emissions;
the engine assigns their offsets like any other.

## 3. The settle algorithm

The runtime drives the wave across the membrane until the machine settles:

```text
settle(seeds):
  assert ¬SETTLING; SETTLING ← true
  pending ← seeds
  loop:
      log ← engine.run(pending)                 // propagate to quiescence (Vol. 02 §7)
      for d in membrane.sweep(log):             // start new discharges (Vol. 07 §3)
          DISCHARGE.TABLE += d
      if DISCHARGE.TABLE = ∅:
          SETTLING ← false; return log          // settled
      pending ← await earliest completed discharge; remove it from DISCHARGE.TABLE
```

Normative points:

1. **Alternation.** Propagation and discharge alternate: the engine always runs
   to quiescence before the membrane sweeps; discharge answers re-enter as the
   next run's seeds. Controllers never observe a half-propagated log.
2. **Earliest completion wins.** The runtime awaits the earliest completed
   discharge (any fair completion order is conforming), commits its emissions,
   and loops. Multiple discharges MAY be in flight simultaneously; their
   answers interleave in completion order — consumers rely on correlation, not
   adjacency (Vol. 03 §3).
3. **One wave at a time.** A machine instance handles one settling wave; a
   concurrent `settle` is a caller error. Repeated *sequential* settles on one
   instance are permitted and are the substrate of sessions (§9).
4. **Defect path.** A rejected discharge aborts the settle with the defect; the
   log up to that point remains valid history (persisted by observers), and the
   shell reports the terminal state `defect`.
5. `settle([])` on a machine with committed-but-unswept tuples is valid: the
   sweep picks up from `MEMBRANE.CURSOR`.

## 4. The full tact, end to end

The complete causal chain of one semantic tact, as the log records it:

```text
input fact ──► knot matches, winds        (queues delta)
           └─► knot projects  inference.request(uid₁)      [engine run n]
membrane sweeps, controller discharges uid₁                [between runs]
world answers ──► inference.response(uid₁) (+reasoning)     [seeds of run n+1]
knot winds integration ──► GRADE ≥ threshold
topology commits  sys.knot.ready {knotId, understanding}
bind rendezvous completes ──► gates pass
bind projects  service.request(uid₂: scope, schema, emit)
membrane sweeps, controller discharges uid₂
world answers ──► publication under emit declaration (+service.reasoning)
                    e.g. fact  frame.truth.ready {bindId, uid₂, result}
… downstream knots wind the publication …                  (the cascade continues)
quiescent ∧ no discharge in flight ──► settled
```

## 5. Machine classes and determinism

The class taxonomy of Vol. 01 §5 has these normative consequences:

1. **Deterministic class.** With deterministic executors, integrators, and
   controllers (or none), re-execution from identical seeds MUST reproduce the
   log byte for byte (modulo host JSON number formatting, which SHOULD be
   normalised). This is the strongest conformance class and the required class
   for golden-log tests (Vol. 14 §2). Note the engine itself introduces no
   non-determinism: single-threaded propagation, ordered processors, ordered
   batches.
2. **Semantic class.** Non-determinism enters exactly at discharge. Re-execution
   MAY differ; therefore: the log is the record of what happened (replay is
   reading, Vol. 03 §6.4); tests substitute deterministic controller doubles;
   acceptance runs are recorded, not re-run. Interleaving of concurrent
   discharge answers is additionally scheduling-dependent — consumers MUST be
   correlation-driven.
3. **Hybrid class.** Deterministic sub-figures retain class-1 guarantees when
   their inputs are fixed; the machine as a whole carries class-2 guarantees.
4. In all classes, given one already-committed log, every derivation of §8 MUST
   be a pure function of it — identical across implementations.

The class is decided by the installed strategy registry, local integrator, and
controllers — the **types of functions bound in knots and binds are an
implementation liberty**, bounded only by the protocol contracts (Vol. 04) and
station rules (Vol. 02 §3).

## 6. Conformance obligations of a machine

A conforming Nest VM MUST provide, observably:

1. the envelope, ordering, and batch semantics of Vol. 02 §7 / Vol. 03;
2. the topology dispatch and readiness reification of Vol. 02 §5;
3. the knot lifecycle and two bundled strategies of Vol. 05 (further strategies
   optional);
4. the two descriptor forms and rendezvous algorithm of Vol. 06;
5. the sweep, discharge, and failure discipline of Vol. 07;
6. the settle algorithm of §3 with its alternation and defect rules;
7. the honest terminal states of §7;
8. rejection-with-diagnostics for every unsupported authoring construct it
   loads (Vol. 09 §5) — silence is non-conforming;
9. the JSONL persistence format when it persists runs at all (Vol. 03 §6).

## 7. Terminal states

Every run ends in exactly one of three honest states, and shells MUST present
them without embellishment:

| State | Definition | Typical causes |
| --- | --- | --- |
| `settled` | settle returned; no open path in the derived reading | the figure completed |
| `settled` (unfinished) | settle returned; the derived reading shows an open path: unanswered intentions, a stalled clew (budget below threshold), an open rendezvous | winding budget exhaustion; a failure fact nobody collects; an unmet barrier |
| `defect` | settle rejected | missing credential; programming error in a controller; invalid registration |

"Unfinished" is a derivation over the settled log (unanswered-uid count, open
lids), not a distinct runtime signal — deliberately, until a quiescence hook is
added (Vol. 11 §6). Runtime quiescence is never presented as epistemic success:
*settled* means "the machine has nothing further to do", not "the answer is
good" (assessment is a separate concern, Vol. 12 §7).

## 8. Derived readings (shells)

Everything a shell shows MUST be derivable from committed tuples, persisted
logs, or immutable package artefacts — no shell-private truth about a run. The
reference derivations, all pure functions of the log:

- **the feed** — tuples in offset order (live via a mirror processor; SSE
  replay of a finished run reconstructs the same surface);
- **the trace digest (vault of lids)** — the log read backwards as bind lids:
  each bind with its outcome (fact / unfold / rejected / failed / pending), its
  intention (scope keys, instruction), and its affinity hanging below —
  activation and demand knots with their winding tacts (request / response /
  reasoning / failure offsets, grades), repeated readiness folded to a count,
  provenance threads (`emittedBy`) shown; an operator bind whose intention has
  not projected reads as an **open lid** with empty demand sockets — the
  barrier's wait is a picture, not a search;
- **run metadata** — the sidecar counters of Vol. 03 §6.3;
- (PROPOSED) Charter/Cell/decision/artefact digests of the extension
  (Vol. 12 §7).

Extensions and shells MUST follow the same rule: if the UI needs data not in
the log or records, the protocol is widened first.

## 9. Sessions and continuation

Current stage: one machine instance per run; `settle` called once (the
workbench's run orchestration) — plus the standing capability of repeated,
non-overlapping settles on one instance in one process.

- **WaveSession (PROPOSED).** A session layer owns one runtime and key,
  serialises ingress (messages, review decisions), calls `settle` again only
  after the previous settle completes, mirrors every tuple to one JSONL/SSE
  history, and exposes derived digests. It requires no core change
  (Vol. 12 §8; Vol. 13 §5 depends on it).
- **Restart-safe continuation** — rehydrating registers from a persisted log
  and continuing without re-discharging old intentions — is an explicitly open
  core-widening decision (Vol. 11 §6). A conforming machine MUST NOT silently
  re-discharge intentions from a reloaded log.

## 10. Shells of the reference implementation

For orientation (not normative beyond the one-assembly rule):

- **CLI** — bare start runs the bundled demo; `run | validate | nest` over
  pipelines; the log tail printed as JSON lines (refimpl 08 §1);
- **Nest Studio** (the workbench) — localhost server over the same assembly:
  pipeline catalogue with compiler verdicts, run creation with generated input
  forms, live SSE feed, persisted run history, the trace vault and feed,
  brick-based authoring writing ordinary pipeline packages (drafts), and
  template promotion with provenance — every view a derivation per §8; full
  description with the API surface: refimpl 08 §2–3;
- planned surfaces (chat + Charter rail; Learn) are extension volumes' concern
  (Vol. 12 §8, Vol. 13 §5).
