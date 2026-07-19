# widgets — the presentation face of the tuple factory

**Role.** The client half of the form/widget factory (design_proposal §7;
preparation P5): pure components keyed by server-stamped **form keys**,
resolved per lens through the declarative table in
[registry.ts](./registry.ts) — cascade exact form → family → the
**lazy raw-JSON floor**. Governing texts: design_proposal §7 (the cut and
the four traps), §12.5.4 (widgets never fetch — the host injects the
tuple reader), HUID 04 §3.3 (raw truth one disclosure away), themes rule 4
(a widget names its class scope and consumed tokens).

**Rules.**

1. Widgets render formed fields only — never parse payloads, never fetch,
   never import the projector plane. Contract types come from
   `../contracts/`; the raw record arrives via the injected `TupleReader`.
2. The resolution key is `(lens, form)` — never `form` alone.
3. Growth = one widget component + `registerWidget` + one `routeForm`
   line. Re-routing a form is a table line, never a widget edit.
4. Representation choice is an ordinary per-form client parameter
   selecting within the resolved candidates (first candidate is the
   default rendering).
5. Visual face: tokens and act-weight classes only (themes rules 1/3/4);
   a raw value here is drift. Widget styles land with their first render
   site (the trace restyle carries the first block).
6. **The named liberty**: `raw-json.tsx` is the seam's one stateful
   widget — its state is a cache of a Class L read plus the native
   `details` disclosure, never semantic state (meta-bind-01 §3:
   degeneracy named, never hidden).

**What never belongs here:** fetch calls, payload classification,
semantic computation, module manifests, projector imports, hex colours.
