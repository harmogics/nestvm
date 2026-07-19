# centre-log — the record lens

**Role.** The centre carousel's record lens (`centre.log`): everything the
session committed, one paper-integrated row per tuple, actor-classified,
with the raw record one disclosure away. The first extracted centre
module (proposal-centre-dock §6 step 1; seed §4.6).

**Governing texts:** seed §4.3/§4.6; proposal-centre-dock §3.3 (the trace
product), §7 (the factory), §12.5.4 (the host-injected tuple reader);
ADR-008 D3 (templates front the record); HUID 02 (module contract);
HUID 04 §3.3/§5 (raw truth one disclosure away; read-weight surface).

**Shape.** `manifest.ts` declares `consumes: [trace]`, the namespaced
`centre.log.actor` parameter, no commits. `view.tsx` is a pure `select`
(actor filter) plus a stateless view rendering rows through the widget
factory — `resolve("log", row.form)`; the module registers its row widget
and one `row.*` family line at load (growth by registration). Raw
payloads arrive only through the host's `readTuple` reader — this module
never fetches.

**Formation** lives with the projector
([src/huid/projectors/trace.ts](../../projectors/trace.ts)): the
row-former registry where matched templates grow; the generic former is
the total-coverage floor.

**What never belongs here:** payload parsing, semantic computation,
commits (the lens is read-weight), fetch calls, imports of the plane.
