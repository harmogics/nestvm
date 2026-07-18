# huid — the device (both sides of the wire)

**Role.** The implementation of the Human Interaction Device specified in
[../../huid/](../../huid/00-overview.md), split along the formation
boundary (ADR-010):

- `contracts/` — snapshot contracts: types + id constants, the only
  compile-time join between the sides; erased at build.
- `projectors/` — the **server-only** formation plane (`server-only`
  marker: a client import fails the build): projector manifests with
  single-source claims, the runtime (cache-of-fold(replay), `asOfOffset`),
  the registry wired to the store's commit hook.
- `modules/` — purely client presentation: manifests (`consumes`, dock,
  params, gestures), `select` + `View`.
- `workbench.tsx` — the interim host (snapshot transport per contract,
  params, port, docks, chrome) until HUID 03 §6 step 2.

**Governed by.** The HUID volumes and the refimpl book
([../../huid/refimpl/](../../huid/refimpl/00-map.md)); ADR-005/006/008/
009/010; spec/ui-panel-rails.md.

**May import.** `nest/readings` (interim, host only), `nest/wave`,
`product` (command bodies). **Never `nest/machine` or `nest/membrane`** —
the surface is a Class L citizen. Modules never import `projectors/`;
contract types come from `contracts/`.

**Never here.** Fetch outside the host's transport and command port,
inference, judgement, semantic state outside projector folds ("panels
never infer; the machine infers, the log carries, panels read" —
HUID 02 §7).
