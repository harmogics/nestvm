# refimpl 01 — Kernel: Envelope, Contracts, Engine

Status: CURRENT · Specifies against Vol. 02, 03 ·
[Book map](./00-book-map.md) · Next: [02-topology.md](./02-topology.md)

The kernel is three small files: the tuple envelope, the three contracts, and
the engine. It is the invariant core (Vol. 11 §2): nothing here knows what a
knot, bind, pipeline, or model is.

## 1. Tuple envelope (`core/tuples`)

```ts
export type WaveTuple<K extends string = string, P = unknown> = Readonly<{
  offset: number;
  kind: K;
  key: string | null;
  payload: P;
}>;

export type WaveEmission<TTuple extends WaveTuple = WaveTuple> =
  TTuple extends WaveTuple ? Omit<TTuple, 'offset'> : never;
```

Notes for a port:

- `WaveEmission` distributes over tuple unions (the conditional form), so an
  emission of a union type is a union of offset-less members — a TypeScript
  idiom; any encoding that types "tuple minus offset" is equivalent.
- `Readonly` is compile-time only. The reference relies on discipline plus
  tests for immutability. **Liberty:** enforce immutability harder (freeze,
  persistent structures); never weaker observable behaviour.

## 2. Contracts (`core/contracts`)

Exactly as normatively stated in Vol. 02 §2: `WaveProcessor.apply`,
`IKnotExecutor` (`id`, `matches`, `wind`, `test`, `understanding`, `reset`),
`DescriptorActivation {knotId, key, understanding}`, `IDescriptorExecutor`
(`id`, `subscribesTo`, `execute`). All synchronous. The knot contract's
documentation records the agreed widening: winding may return emissions —
winding intentions bounded to the knot's own accumulation; readiness stays
synchronous; `understanding()` is the snapshot read when readiness is reified.

**Liberty:** interface mechanics (structural typing here; traits, protocols,
duck typing elsewhere). The five knot methods and their call discipline are
not liberty.

## 3. Engine (`core/WaveEngine`)

State: `log: T[]` (private array) and `cursor: number` (starts 0). One public
method:

```ts
run(seeds): ReadonlyArray<T>
  appendEmissions(seeds)
  while cursor < log.length:
      tuple ← log[cursor++]
      for each processor (constructor order):
          out ← processor.apply(tuple)
          if out non-empty: appendEmissions(out)
  return log
```

`appendEmissions` assigns `offset = log.length` per emission, in array order,
pushing `{ ...emission, offset }`.

Behavioural points a port must preserve (Vol. 02 §7):

1. A batch returned by one `apply` is appended contiguously, in returned
   order, before the next processor sees the same tuple.
2. Every processor receives every tuple exactly once, in identical log order;
   the cursor never rewinds; `run` returns only at quiescence.
3. Offsets are dense and equal final log positions.
4. `run` may be called repeatedly on one engine; the log persists and the
   cursor continues — this is what repeated settles and the runtime loop rely
   on. Seeds of a later call are appended after all earlier tuples.
5. The returned value is the engine's own log (a live readonly view).
   **Liberty:** return an immutable snapshot instead; callers may not mutate
   it either way.

**Liberty:** storage (array, deque, arena, persisted segment) provided
indexing by offset and append cost characteristics do not change observable
ordering; concurrency is NOT a liberty at this stage — propagation is
single-threaded by specification (`runtime.mode: single-thread`, Vol. 09 §2).
