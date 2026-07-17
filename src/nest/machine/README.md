# nest/machine — knots, binds, runtime (v0 simulated)

**Role.** The simulated machine: command handlers that turn ingress into
committed tuple batches, the declared scene templates (expandScenePlan —
records before facts, Vol. 02 §5.1), winding tacts, and barrier settlement
(close binds publish themselves, Vol. 06 §4).

**Governed by.** Vol. 05–06, Vol. 08; ADR-004 Decision 4 (the machine
port); spec/first-turn-log-protocol.md (interpretation precedence).

**May import.** `nest/wave`, `nest/membrane`, `nest/readings`, `corpus`†,
`product`† — † documented v0 liberties: evidence search reaches corpus
directly (becomes an EvidenceController), and the ingress mapper handling
`TurnBody`/`DecisionBody` is folded in (moves to `product/` at the core
swap).

**Belongs here.** Everything that decides which tuples are committed.

**Never here.** UI, HTTP transport (routes call in), direct provider calls
(only through the membrane ports).
