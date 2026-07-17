# fixtures/sessions — recorded goldens

Recorded study sessions in the persisted wire format of Vol. 03 §6 (one
tuple per line, dense offsets) with their meta sidecars, copied verbatim
from `var/sessions/` on 2026-07-17 — the reading-fixture pin of ADR-005
Decision 2 and step 0 of the HUID migration (HUID 03 §6). Derivations
replayed over these files must keep producing the same models across
refactors; a divergence is a regression caught as a byte diff.

Fixtures are recorded from real sessions, never handcrafted tuple by tuple
(minimal negative anchors excepted). To add one: run a session to the state
worth pinning, copy its `var/sessions/<id>.jsonl` + `<id>.meta.json` here,
and name it for the state it captures.

## Licensing status

These recorded sessions are not covered by the repository's CC BY or AGPL
blanket licences. They are test inputs, not a public experience dataset. An
individual recording requires explicit provenance and licensing review before
it may be presented as reusable material.
