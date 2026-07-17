# nest/membrane — the world boundary

**Role.** The ports through which the machine reaches the world and the
world answers: the pluggable inference port with its adapters
(ADR-004 Decision 4), the oracle tasks the simulated services discharge
(scene authoring, winding, folds — declared form, supplied content,
Vol. 01 §2.5), and the resource resolvers that turn bounded refs into
content at attention time (ADR-004 Decision 5).

**Governed by.** Vol. 07; ADR-004 Decisions 4–5.

**May import.** `nest/wave`, `corpus`.

**Belongs here.** Port interfaces and adapters (live / null / scripted);
resolver adapters per store; controller configuration when the core lands.
Secrets resolve from the environment at assembly — never from records or
the log.

**Never here.** Judgement or integration (a controller converts intentions
to effects and answers to correlated facts — Vol. 07 §2.3); UI; store
writes outside the correlated-answer path.
