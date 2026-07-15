# refimpl 06 — Runtime Loop, Assembly, Input Facts

Status: CURRENT · Specifies against Vol. 08 ·
Previous: [05-membrane-and-controllers.md](./05-membrane-and-controllers.md) ·
Next: [07-loader-and-schema.md](./07-loader-and-schema.md)

## 1. `WaveRuntime`

State: `inFlight: Map<number, Promise<{id, emissions}>>`, `nextDischargeId`,
`settling: boolean`. Construction: `(engine, membrane)`.

```ts
async settle(seeds = []):
  if settling: throw 'A wave is already settling; the runtime handles one wave at a time.'
  settling ← true
  try:
    pending ← seeds
    loop:
      log ← engine.run(pending)
      for d of membrane.sweep(log): track(d)     // wrap with an id, store
      if inFlight empty: return log
      pending ← await nextAnswer()               // Promise.race over values;
                                                 // delete the winner's slot
  finally: settling ← false
```

Points a port must preserve: alternation (engine to quiescence, then sweep);
earliest-completion re-entry (any fair completion order conforms); several
discharges in flight simultaneously; a rejected discharge propagates out of
`settle` (the defect path) with `settling` reset, so the instance remains
usable; sequential settles on one instance are supported (sessions build on
this).

**Liberty:** the completion-selection mechanism (race, queue, channel) —
observable interleaving is already declared scheduling-dependent
(Vol. 08 §5.2).

## 2. `assembleWave`

The one product assembly (Vol. 08 §1):

```ts
assembleWave(observers = []) =
  WaveRuntime(
    WaveEngine([ TopologyGraph(), ...observers ]),
    Membrane([ TogetherInferenceController(loadConfig(), { apiKey: resolveKey() }) ]))
```

Every shell calls this function; shells differ only in seeds and log reading.
A deterministic-class assembly swaps the controller list (e.g. the stub, or
none) and/or the strategy registry's integrator — same function shape.

## 3. `buildInputFacts`

The one translation of provided input values into seed facts, shared by every
shell:

```ts
buildInputFacts(declared, values, key) → { facts, unknown }
  for each (name, value) of values:
      declaration ← declared.find(id = name)
      if none: unknown += name; continue
      for each entry of (string ? [value] : value):     // arrays fan out in order
          facts += { kind: 'domain.fact', key,
                     payload: { factType: declaration.writes,
                                data: { [declaration.field ?? 'value']: entry } } }
```

Undeclared names are reported, never silently dropped; shells surface the
first unknown as an error before running.
