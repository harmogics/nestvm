# huid — the surface (device code)

**Role.** The implementation of the Human Interaction Device specified in
[../../huid/](../../huid/00-overview.md): the host (feed, parameter space,
command port, five docks) and the modules seated in them. Interim state:
`workbench.tsx` holds today's surfaces whole; it splits into
`host/` + `modules/` at HUID migration step 2 (HUID 03 §6).

**Governed by.** The HUID volumes; ADR-005; ADR-006;
spec/ui-panel-rails.md.

**May import.** `nest/readings`, `nest/wave` (types), `product` (command
bodies). **Never `nest/machine` or `nest/membrane`** — the surface is a
Class L citizen: it reads the log and speaks only through the session API.

**Belongs here.** Host, docks, module folds/selects/views, manifests.

**Never here.** Fetch beyond the command port, inference, store access,
semantic state outside folds ("panels never infer; the machine infers, the
log carries, panels read" — HUID 02 §7).
