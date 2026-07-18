# src/ — the implementation nest

The code mirrors the nest figure: the wave at the centre, levels conducting
information outward through transformations to the surface (HUID). Imports
point inward only — a region may import regions closer to the centre, never
outward (Vol. 02 §2.5 applied to the whole tree). The layout is fixed by
[ADR-007](../spec/ADR-007-implementation-layout.md); each region carries its
own lid (README) stating role, governing documents, and import rules — the
lid is the region's bind, its files are the knots.

    nest/wave       centre: wire vocabulary + the append-only store   Vol. 02–04
    nest/readings   pure derivations of the log                       Vol. 08 §8
    nest/membrane   ports to the world: inference, oracle, resolvers  Vol. 07
    nest/machine    knots · binds · runtime (v0 simulated)            Vol. 05–06, 08
    corpus/         the studied specification set as a store          —
    product/        session-contract bodies (petal, commands)         ADR-004
    huid/           the surface: device code (host, modules)          ../huid/
    app/            Next.js shell: thin routes and pages              ADR-004 D1

Allowed imports (→ = may import):

    app      → everything below
    huid     → readings, wave, product        (never machine, membrane)
    product  → wave
    machine  → membrane, readings, wave, corpus, product†
    membrane → wave, corpus
    readings → wave
    corpus   → wave (types only)
    wave     → nothing

† documented v0 liberties: the ingress mapper is folded into the machine
(moves to product/ at the core swap), and evidence search reaches corpus
directly (becomes an EvidenceController on the membrane).

Routing table — where a new fragment of source code lands:

    a panel / centre view / widget   → huid/modules/<id>/ (nothing else — diff test)
    a gesture / decision kind        → product (body) + machine (handler) + module chip
    a fact family                    → machine (declared template) + readings (fold)
    a world capability               → membrane (adapter + configuration record)
    a derivation / shared reading    → readings
    a resolver store                 → membrane/resources adapter
    a petal / result contract        → product
    a storage change                 → wave (WaveStore adapter)

House contracts — wire shapes, flow, code style, adopted references and
the deviation ledger — are [CONVENTIONS.md](./CONVENTIONS.md).
