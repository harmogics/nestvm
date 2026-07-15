# Volume 15 — Terminology

Status: CURRENT · Snapshot date: 2026-07-14 ·
Previous: [14-conformance-and-verification.md](./14-conformance-and-verification.md)

This volume fixes a single, unambiguous name for every concept the
specification set rests on. Each concept has exactly one canonical term and one
meaning; older or metaphorical words are noted as *aka* but are not separate
concepts. Volumes cite this vocabulary; where a volume and this volume could be
read differently, the defining volume's normative text governs and this entry
is corrected.

The two central entities are the **activation knot** (which accumulates
understanding) and the **bind descriptor** (which binds, judges, and emits).
Within a bind descriptor, **heads** are part of the **affinity** structure.

## 1. Substrate

**Wave log.** The ordered, append-only history of committed wave tuples. The
single source of truth; entries are never rewritten, only appended. *aka*
append-log. (Vol. 03)

**Wave tuple.** An immutable record in the wave log: `offset`, `kind`, `key`,
`payload`. The unit of fact. *aka* tuple. (Vol. 03 §1)

**Emission.** A wave tuple without its `offset` — the form in which content is
handed to the engine; the engine assigns the offset at append. (Vol. 03 §1)

**Wave.** The propagation itself: committed tuples flow through the topology
and may produce further tuples, which are appended in turn, until the log stops
growing (quiescence). (Vol. 02 §5, Vol. 08)

**Topology.** The live set of registered activation knots and bind descriptors
that the wave flows through. (Vol. 02 §5)

**Key.** The attribution lane of a tuple; every registered knot winds one clew
per key. `null` marks lane-less records. (Vol. 03 §5)

## 2. The two entities

**Activation knot.** An accumulating unit that matches wave tuples, winds them,
and tests readiness; it *accumulates understanding*. When ready, it activates
bind descriptors. Its minimal form is a single condition matcher — a degenerate
configuration of the same accumulator, not a different kind. *aka* knot, clew
(for the per-key instance see **clew**). (Vol. 05)

**Bind descriptor.** A bind. Woken by an activation knot, it gathers named
understandings from the space, judges them, runs a service, and publishes an
integration. *aka* descriptor, bind. (Vol. 06)

**Clew.** One per-key executor instance of a registered knot definition;
parallel keys wind independent clews. (Vol. 05 §2)

## 3. Inside an activation knot

**Condition.** The predicate by which an activation knot matches tuples and, in
its readiness form, the test over the wound state. (Vol. 05 §4–5)

**Collection rule.** One declared acceptance-and-reduction rule of a knot:
slot name (`as`), matched fact type, reducer, optional payload field, optional
`where` clauses. (Vol. 05 §3)

**Wind.** The act of integrating a matched tuple into the knot's wound state.
Deterministic winding completes locally; semantic winding unfolds through the
world — the knot projects a winding intention and later winds the returned
integration. (Vol. 05 §1, §5)

**Winding intention.** An intention tuple a knot projects to grow its own wound
state: a request to integrate newly matched deltas into its accumulated
understanding, correlated back to the knot. Bounded to the knot's metabolism —
never an integration for others, never a decision. (Vol. 04 §4.1, Vol. 05 §5.2)

**Delta.** The unit of new material a collection rule extracts from an accepted
fact. On a canvas, deltas are labelled by their rule name. (Vol. 05 §3, §5.4)

**Readiness.** The state an activation knot reaches when its accumulated
understanding satisfies its test; readiness is what activates bind descriptors.
Readiness is **reified**: the topology commits it as a tuple carrying the
understanding snapshot. (Vol. 02 §5, Vol. 04 §2.3)

**Reset policy.** What readiness does to the clew: `on_ready` clears the wound
state; `never` keeps it, allowing repeated readiness. (Vol. 05 §1)

**Winding budget.** The cap on winding intentions one clew may project — the
resonance damper of the canvas. Exhaustion below threshold stalls the clew
visibly. (Vol. 05 §6)

**Lane.** A knot's mark written into its winding-protocol tuples and echoed by
controllers, so complementary cells can subscribe. (Vol. 05 §7)

**Understanding canvas.** Several clews winding in parallel and collecting one
another's committed integrations through `where` clauses over lanes —
cross-pollination under budgets. *aka* canvas. (Vol. 10 §4)

**Journal knot.** A never-resetting, zero-threshold knot accumulating a side
record without steering control flow. (Vol. 10 §5)

## 4. Inside a bind descriptor

**Activation (channel).** The single activation knot whose readiness wakes the
bind descriptor; its understanding is bound into the scope. The first of two
methods through which understanding enters the bind. (Vol. 06 §1, §4)

**Affinity.** The structure on a bind descriptor that holds its two faces —
**heads** and **demands**, under a **barrier**. Heads project; demands gather.
(Vol. 06 §1; heads are DECLARED, Vol. 11 §5)

**Head.** A tuple the bind descriptor writes into the wave *at activation*. It
seeds a computation or cascade and injects the angle of perception. The
projecting face of affinity; it may also declare the branch that arises and
what may be written there. *aka* ray. (Vol. 11 §5; the executable subset is the
unfold template's head facts, Vol. 06 §7)

**Demand.** A named binding (`as:`) to an activation knot whose integrated
understanding the bind descriptor gathers back. The gathering face of affinity,
and the second method through which understanding enters the bind. *aka*
tendril. (Vol. 06 §3–4)

**Barrier.** The join policy over demands (currently `all`): the rendezvous at
which the bound demands become simultaneously available. The current barrier
latches: a later readiness refreshes a demand's entry until projection.
(Vol. 06 §4)

**Rendezvous.** One key lane's gathering state of an operator bind: activation
flag, scope, one-shot projection latch. (Vol. 02 §4.5, Vol. 06 §4)

**Bound scope.** The record of names — from the activation tuple and the
demands — over which gates and the service are evaluated. (Vol. 06 §4)

**Gate.** A predicate over the bound scope. Gates decide between emit and
reject; the current form is `min_grade` over a named entry. (Vol. 06 §5)

**Service.** The function evaluated over the bound scope to produce the
integration. Its kind (model instruction, deterministic function, other) is an
assembly property. *aka* service function. (Vol. 06 §3, Vol. 08 §5)

**Service intention.** The machine-complete `service.request` an operator bind
projects: instruction, scope, schema, emit declaration. (Vol. 04 §5.1)

**Emit.** The tuple(s) a bind descriptor publishes on success — the reified
integration, written *at completion*. For an operator bind, publication is by
proxy under its emit declaration. (Vol. 06 §6–7)

**Emit declaration.** The declared publication form carried in the intention:
`writes` (one fact) or `unfold` (a sown-topology template); the proposed third
member is `cell`. (Vol. 06 §6–8)

**Reject.** The tuple(s) a bind descriptor publishes when a gate fails
(`bind.rejected`). (Vol. 06 §5)

**Operator bind.** The full bind form: activation + demands + gates + a service
crossing the membrane. (Vol. 06 §3)

**Emit descriptor.** The minimal bind form: one activation, immediate truthful
publication. (Vol. 06 §2)

## 5. Cross-cutting

**Angle of perception.** The framing a head tuple or a knot's questions inject
into the computation they seed, specialising a general capability to the
declared need. (Vol. 05 §5, Vol. 10 §3)

**Cascade.** The chain (activation knot → bind descriptor → activation knot →
…) seeded by a head, whose integrative end a demand gathers. (Vol. 01 §7)

**Integration.** The understanding a bind descriptor forms and publishes as a
wave tuple; received by others through binding — as an activation or as a
demand — so integrations compose into higher-order understanding. (Vol. 06 §1)

**Branch.** A named lane of the wave log declared by a head; activation knots
may hang on a branch. The mechanism of attribution. DECLARED: parsed, not yet
enforced. (Vol. 09 §4, Vol. 11 §4.3)

**Ledger.** An isolated sub-scope of a branch in which a single sub-computation
accumulates. DECLARED. (Vol. 11 §4.3)

**Plane.** A branch a head declares when an intent is unfolded in breadth: one
parallel angle of perception whose integration is gathered back under a
barrier. (Vol. 11 §4.3)

**Level.** A ledger within a plane's branch: one turn of depth in the cascade
elaborating that plane. (Vol. 11 §4.3)

**Guard descriptor.** A parallel bind descriptor that detects a boundary breach
(out-of-bounds) and diverts or terminates the wave. Current rails approximate
it; `polarity`/`terminal` are DECLARED. (Vol. 10 §7, Vol. 11 §5)

**Correlation identity.** The uid joining an intention with its answers
(`<ownerId>#<n>`), plus the `emittedBy` provenance stamp on sown emissions.
(Vol. 03 §4)

**Provenance stamp.** `emittedBy: <service uid>` on every emission of a
delegated emit template — the explicit sowing thread. (Vol. 06 §7.4)

**Unfold.** The constrained in-wave authoring form: a service result
instantiates declared knot/close/head templates. (Vol. 06 §7)

**Attribution, reachability, termination.** The three load-bearing obligations
of the decoupled model. (Vol. 01 §7)

## 6. The membrane

**Membrane.** The boundary where the wave meets the world: output controllers
face outward, ingress faces inward. (Vol. 07)

**Output controller.** A receiver of committed tuples facing outward: it claims
tuples by kind/fact type and discharges them to the external world exactly once
per runtime. It neither judges nor integrates — a third station beside the
activation knot and the bind descriptor, standing outside the propagation cycle
on its own cursor. *aka* effector, egress handler. (Vol. 07 §2–3)

**Claim.** A controller's synchronous predicate over committed tuples.
(Vol. 07 §2)

**Discharge.** The asynchronous execution of an external effect for one claimed
tuple, resolving with the world's answers as emissions. (Vol. 07 §2)

**Intention tuple.** A committed tuple claimed by an output controller: the
reified intent to interact with the world, carrying a correlation identity so
the world's answer can find its cascade. (Vol. 04 §4.1, §5.1)

**Ingress.** The inward half of the membrane: the edge through which external
events — the world's answers among them — are committed to the wave log as fact
tuples. (Vol. 07 §6)

**Expected failure.** An external failure returned as a correlated fact
(`*.failed`), letting the wave settle with the failure on record. Distinct from
a **defect** — a configuration or programming error that rejects the discharge
and fails the settle. (Vol. 07 §7)

## 7. The machine

**Nest runtime / Nest virtual machine (Nest VM).** The whole machine this set
specifies: wave log + processors (topology and observers) + membrane + settle
loop. In the reference project the bare word *Nest* historically named the
workbench shell; this set reserves the machine sense and calls the workbench
**Nest Studio**. (Vol. 00 §5)

**Assembly.** The construction of one machine instance: engine with processors,
membrane with controllers — one assembly shared by every shell of a product.
(Vol. 08 §1)

**Machine class.** The execution profile fixed at assembly: **deterministic**
(pure functions everywhere; byte-reproducible re-execution), **semantic**
(non-determinism enters at discharge), **hybrid** (both). (Vol. 01 §5,
Vol. 08 §5)

**Seeds.** The emissions a run starts from: compiled records plus declared
input facts. (Vol. 08 §2)

**Settle.** The runtime algorithm alternating propagation with membrane
discharges until the machine settles. (Vol. 08 §3)

**Quiescent.** The engine cursor has consumed the whole log and produced
nothing further. (Vol. 03 §7)

**Settled.** Quiescent with no discharge in flight. (Vol. 03 §7)

**Settled unfinished.** Settled while a derivation shows an open path —
unanswered intentions, a stalled clew, an open rendezvous. An honest terminal
state, never masked. (Vol. 08 §7)

**Defect.** A rejected discharge or invalid registration; the settle fails and
the shell reports it. (Vol. 08 §7)

**Observer.** A passive wave processor that mirrors tuples and emits nothing
behavioural. (Vol. 02 §3.4)

**Derived reading.** Any view computed as a pure function of committed tuples
and immutable artefacts — feed, trace digest (vault of lids), run metadata,
extension digests. Shells hold no other truth. (Vol. 08 §8)

**Vault of lids.** The trace digest read backwards: binds as closing lids with
their affinity hanging below; an unprojected bind is an **open lid** with empty
demand sockets. (Vol. 08 §8)

**Strategy registry.** The named-factory table resolving knot strategies at
registration; also the injection seam for the local integrator. (Vol. 05 §8)

**Local integrator.** The pure function `(deltas) → {state, grade}` used by
locally winding semantic knots. (Vol. 05 §5.1)

**Golden log.** The normative six-tuple fixture of the bundled demo used as a
conformance anchor. (Vol. 14 §2)

## 8. Authoring and loading

**Authoring pipeline.** The external, human-authored document describing a
whole scenario. It lives outside the machine. (Vol. 09)

**Individual record.** A single activation-knot or bind-descriptor definition,
split out of the authoring pipeline at load and committed to the wave log.
(Vol. 04 §2)

**Loader.** The component that splits an authoring pipeline into individual
records and commits them as seeds. *aka* splitter. (Vol. 09 §6)

**Pipeline package.** A directory of `pipeline.yaml` beside `schemas/*` —
the portable programme unit; drafts and templates are ordinary packages.
(Vol. 09 §8)

**Template (library).** A promoted, provenance-stamped pipeline package proven
by a settled run. Distinct from the **unfold template** (Vol. 06 §7) and from
the extension's **template** artefact (Vol. 12 §2). (Vol. 09 §8)

**Reference artefact.** A format document fixing target vocabulary that the
current compiler deliberately rejects beyond its stage. (Vol. 09 §1)

**Planner descriptor.** A bind descriptor whose service designs topology: it
binds achieved understanding and emits individual records, guarded by
reachability, budget, and attribution obligations. *aka* planner. (Vol. 06 §7,
Vol. 10 §6)

## 9. Extension terms (PROPOSED / SEED)

Defined in their volumes; listed here for collision control:
**Semantic Charter**, **Cell**, **CellSpace**, **CellBlueprint**,
**CellPackage**, **Trial Cell**, **precedent**, **semantic link**, **admission**,
**sealing**, **revision**, **reframe** (Vol. 12); **Experience Charter**,
**evidence substrate**, **experience unit**, **claim ledger**, **case
package**, **vector grammar** (Vol. 13). The canonical disambiguation table:

```text
knot        = accumulator
bind        = gather/judge/publish relation
bound scope = one bind's gathered record
Cell        = bounded local topology and lifecycle        (PROPOSED)
Charter     = semantic obligation presented to the user   (PROPOSED)
Membrane    = the organism's external controller boundary
```
