# nest/readings — pure derivations

**Role.** Pure functions of the tuple log: the canonical projection, the
text-canvas blocks, and (arriving with the HUID migration) trace summaries
and scene strata. The only place that turns `factType` into meaning for
display.

**Governed by.** Vol. 08 §8; ADR-005 Decision 1; HUID 02 §2 (fold rules).

**May import.** `nest/wave` (types) only.

**Belongs here.** Single-pass folds in offset order; provenance joins
(`uid`, `emittedBy`, `bindId`, `knotId`) — never adjacency; view shapes
(`views.ts`); renderer registries.

**Never here.** Store access, fetch, inference, browser state, gesture
handling. A derivation that needs data the log does not carry is a protocol
gap to raise, not a heuristic to invent.
