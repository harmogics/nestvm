# centre-canvas — the document lens

**Role.** The centre carousel's document lens (`centre.canvas`): the
session's produced texts as a document flow — integrations always,
learner turns / answers / evidence by toggle — approaching a business
artefact. The second extracted centre module (design_proposal §6 step 2;
seed §4.5).

**Governing texts:** seed §4.2/§4.5; design_proposal §3.2 (the
produced-texts product; toggles are select parameters), §12.4 (form keys
stay additive-ready for `integration.revised`/supersession); ADR-003
(reframe retargets the one composer); HUID 01 §4.3 (`composer.target` —
the promoted shared key); HUID 02 (module contract).

**Shape.** `manifest.ts` declares `consumes: [produced-texts]`, the
namespaced toggle parameters plus the host's `session.busy`/
`session.status`, one commit (`accept`). `view.tsx` is a pure `select`
(toggle filter + acceptance re-forming: an accepted candidate reads as
`integration.value` with its released valueId) and a stateless view.
Retargeting the composer is a `composer.target` write — never a
module-to-module call.

**Formation** lives with the projector
([src/huid/projectors/produced-texts.ts](../../projectors/produced-texts.ts)):
the block-former registry — the client `canvasRenderers` embryo, moved to
the plane.

**What never belongs here:** payload parsing, fetch calls, imports of the
plane, semantic computation in render.
