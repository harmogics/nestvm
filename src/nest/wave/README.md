# nest/wave — the centre

**Role.** The wire vocabulary (envelope of Vol. 03 §1, payload conventions:
ResourceRef, EvidenceExcerpt, operator/vector ids) and the append-only
session store (JSONL wire format of Vol. 03 §6; offsets assigned at commit
and only here).

**Governed by.** Vol. 02–04; ADR-004 Decision 3 (WaveStore plane).

**May import.** Nothing internal.

**Belongs here.** Envelope and payload types; store adapters preserving
dense offsets; the `fact()` / `readiness()` emission helpers.

**Never here.** Interpretation of fact types (readings), machine behaviour,
network, UI. Nothing in this region ever edits a committed tuple.
