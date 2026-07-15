# ADR-003: Spatial bind-and-knot workspace with one composer

**Status:** Current product direction

## Context

The interface is inductive: it should show only what the person needs to work on
now, while preserving the ability to move through the structure that produced the
current understanding. A complete runtime graph, a chat transcript, and a form for
every operator would all spend attention on implementation detail instead of the
current semantic obligation.

Nest already supplies the appropriate underlying primitives. An activation knot
accumulates understanding. A bind descriptor gathers named understanding through
activation and affinity, applies gates and a service, and publishes an integration.
Heads may seed child cascades whose results return through demands. The UI should
be a sparse projection of this topology, not a second execution model.

## Decision

### One scene in focus

The centre shows one scene: the bind instance the user is resolving now. The bind
is the scene's master heading. Its visible knots are the details beneath it. The
centre does not attempt to display the whole wave or every available branch.

The user-facing bind instance is not necessarily a newly authored runtime
descriptor. In the initial implementation it is normally an invocation of an
allowlisted, precompiled bind template with a new instance identity, parameters,
source references, and branch attribution.

### Four meaningful directions

The workspace gives stable meaning to direction:

- **Left — available history.** Completed local integrations that have been
  released from prior scenes and still may participate in a higher-order
  integration. When a new bind is created, left-side values not excluded by the
  user become affinity sources. The backend records an exact source snapshot at
  creation time; it never reconstructs affinity later from mutable UI state.
- **Right — chosen depth.** A knot marked for deeper work opens as its own bind
  scene in the right-side list. Runtime-wise this is a child cascade: the parent
  projects an attributed head, the child works on its own branch or ledger, and
  the resulting integration can return to the parent through a demand.
- **Up — ancestry and root.** Moving up restores the parent or root discussion
  context and allows it to be refined through the same bind-plus-knots primitive.
  Up is semantic ancestry, not merely vertical scrolling.
- **Down — the current scene.** Moving down scrolls through the current bind's
  knots and local progression. Down does not imply a new branch.

These directions are navigation in a read model. They do not create a second
event history or replace the wave log's order.

### One composer

There is exactly one text composer. Context around it changes how the turn is
committed:

- with a focused answer obligation, the text is an answer for that knot;
- with a selected semantic operator, the text is a user parameter of a new bind;
- with neither, the text is a plain informational signal.

Operator selection is adjacent to the composer. It does not open a large form.
The selected operator, current target, source exclusions, and other compact
controls provide the structured parameters around the same text field.

A plain signal is valid. It is committed without forcing an operator, inventing
knots, or initiating inference. The system respects the user's right to choose
when information should become active work.

### Silence is part of the interface

Position, selection, typography, and state carry meaning. The product must not
fill empty space with diagnostic prose such as “incoming signal”, “not yet bound”,
or generic commentary that does not help the current decision. The user's own
words may remain visible as the root material without being surrounded by a
status explanation.

The interface still provides a clear action map: the four directions, available
operators, current target, source inclusion, and completion action remain
discoverable. Silence removes narration, not agency.

## Runtime distinctions that the UI must preserve

- A **knot reaches readiness** after winding sufficient understanding.
- A **bind completes** after activation, affinity, gates, and service produce an
  emit or reject.
- A **user accepts or releases** a presented local integration for later use.
- A **session finishes** only under its declared result and completion contract.

The UI may use concise user language, but the persisted events must not collapse
these four transitions into one `ready` flag.

## Completion

The topology can always be unfolded further, so depth alone has no natural end.
Each selected session type must therefore declare a result contract. A normal
finish occurs when:

1. the root result has been published under that contract;
2. required child demands are integrated, explicitly unknown, skipped under
   policy, or preserved as declared uncertainty;
3. the user accepts the root result or explicitly closes the session;
4. any mandatory assessment or reflection gate for the session type has run.

Wave quiescence is not product completion. It may simply mean that a bind is
waiting for a person, an external answer, or a later choice.

The final document is a projection rooted in the accepted root integration. It
may read as a tree, but its provenance is generally a DAG because one left-side
value can feed several later binds. The append log remains the authoritative
history behind that projection.

## Holds

- Show one current semantic obligation rather than the whole runtime topology.
- Use bind plus knots as the recursive visual primitive at every depth.
- Keep one composer; do not generate operator-specific intake forms by default.
- Do not interpret a plain signal as consent to run an operator.
- Do not expose private model chain-of-thought as knot content.
- Derive every durable visible state from committed tuples or immutable package
  data; the browser must not own an independent semantic history.
- Preserve source identity, operator identity, model provenance, human answers,
  and acceptance decisions in the log.
- Keep external inference behind an output controller and return its answer only
  through committed ingress.

## Working assumptions

- The first plain signal can serve as the visible root material without becoming
  a knot or integration.
- The first selected operator takes the current root material plus the exact set
  of non-excluded left-side values as its initial sources.
- Marking a knot for depth creates a child bind instance and a demand by which its
  eventual integration returns to the parent.
- Releasing a completed bind to the left publishes or references a stable local
  integration rather than moving mutable browser state.

## Open questions

1. If several plain signals exist before the first bind, does the first operator
   receive all of them by default, only the focused one, or an explicitly bounded
   root projection?
2. If a knot is focused and an operator is also selected, is the text an answer,
   an operator parameter over that knot, or must the UI prevent this ambiguous
   combination?
3. Does “mark bind ready” mean accept an already emitted integration, request that
   the current bind attempt integrate now, or both as two visibly distinct steps?
4. When several child binds are opened on the right, does the parent demand use an
   `all`, `any`, threshold, or user-selected barrier?
5. Is moving up always the immediate parent, always the root, or a compact
   ancestry chooser expressed through one upward gesture?
6. How should the interface reveal source inclusion on the left without turning
   the left rail into a checklist-heavy form?

