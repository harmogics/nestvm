# app — the Next.js shell

**Role.** Thin framework shell: the session API routes (ADR-004
Decision 1) and the pages (landing, reading room, studio). Routes validate
transport concerns and delegate to the machine; pages assemble regions —
no interpretation, no derivation logic of its own.

**Governed by.** ADR-004 Decision 1 (the session API is a swap surface —
its shapes change only by recorded decision).

**May import.** Any region (`nest/*`, `corpus`, `product`, `huid`) — the
shell is the only place allowed to see everything.

**Belongs here.** Route handlers, page composition, global styles,
co-located page-level components (the spec markdown renderer, the
new-session form).

**Never here.** Machine semantics (the ingress mapper owns
interpretation), derivations (readings own meaning), module logic (huid
owns the device).
