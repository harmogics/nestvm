# product — the session contract

**Role.** The product-side vocabulary of the session API: command bodies
(`TurnBody`, `DecisionBody`, `CommandResult`), and — as the layer grows —
petal definitions, result contracts, and the operator catalogue. At the
core swap the ingress mapper (interpretation precedence, actor stamping,
completion contract) moves here from the machine (ADR-004 Decision 4).

**Governed by.** ADR-004 Decision 1; spec/first-turn-log-protocol.md.

**May import.** `nest/wave` (types).

**Belongs here.** Contract shapes and product policy — nothing executable
against the log directly.

**Never here.** Store access, derivations, UI, inference.
