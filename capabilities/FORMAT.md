# The capability seed format — first vision

**Status:** SEED format, 2026-07-18 (free-form markdown now; the YAML
profile arrives when manifestation is mechanised). Companion to
[spec/guild-seeds.md](../spec/guild-seeds.md); guards inherited from its
§5 verbatim. A capability seed is the distributable declaration of one
growable capability; **code never travels in a seed** — declared forms
and semantic content do.

## 1. One format, a taxonomy of kinds

Capability kinds map one-to-one onto the registration sites of the
growth table (the routing table, src/README.md) — a capability *is* a distributable
registration:

| kind | what it declares | registration in a target |
| --- | --- | --- |
| `fact-family` | fact types + schemas | machine template acceptance (+ projector claims) |
| `figure` | knots/binds topology (pipeline grammar, Vol. 09) | compiled records committed as seeds |
| `contract` | snapshot shape + its formation (reads, fold strategy, snapshot schema) | contract file + projector + registry line |
| `module` | panel manifest (consumes, dock, params, gestures) + view intent | module directory + dock-registry entry |
| `form` | form keys + widget hints + resolution defaults | former (plane) + widget + table line |
| `gesture` | command body + handler semantics | product body + machine handler + `commits` |
| `controller-need` | a required external capability, declared only | **granted solely by the target's control plane** |
| `guild` | the maximal composite: members + ideology | all of the above, admitted as one slice |

**The degenerate rule** (meta-bind-01 §3): an atomic capability is a
degenerate guild — a composition of one, ideology optional. Same format,
fewer sections; nothing else changes.

## 2. Required sections of any seed

1. **Identity** — `kind`, `id`, `version`, status
   (SEED → TRIAL → PROMOTED; plus "manifested-in-source" noted),
   provenance (source system, authors, date), licence.
2. **Purpose** — what it gives the system / the architect / the operator
   (the persona triple; PROTOCOL_DEV phase 1 discipline).
3. **The fractal passport** — the capability's declared collection,
   accumulation, and publication, named explicitly. A seed that cannot
   fill this section is off the rails and not publishable.
4. **Declared parts** — the growable content per kind: schemas, reads,
   contract shapes, manifests, form keys, templates, semantic filling
   (questions, angles, thresholds, rubrics, close instructions). Wire
   shapes follow the house wire conventions
   ([src/CONVENTIONS.md](../src/CONVENTIONS.md) §1: absence over null,
   present flags, anchoring by shape, bounded at formation, the
   factType idiom for form keys).
5. **Dependencies and grants** — what the target must already hold
   (contracts, fold strategies, docks, params) and which
   `controller-need`s require control-plane grants. Distinguished
   strictly: dependencies are checked at admission; grants are *asked*,
   never assumed. **Visual dependencies are token references** (the
   [themes](../themes/README.md) vocabulary) plus optional theme
   *suggestions* — a seed carrying raw CSS values fails review: the
   guild's identity travels as semantics; the target keeps its own ink.
6. **Fixtures and trial** — recorded evidence, golden expectations, the
   parity method by which manifestation is verified in the target.
7. **Applicability and failure examples** — where it fits, where it is
   known to fail (PHILOSOPHY §8: no silent universality).
8. **Manifestation and degradation** — the admit → sow → ground → seat
   notes, and the honest shape of every partial state (ungranted needs,
   missing widgets → generic forms, absent transports → fallbacks).
9. **Open questions** — living, with owners where known.

## 3. Format rules

1. **No second truth, with a lifecycle** (PROTOCOL_DEV, the cycle).
   While a development cycle is open, the living proposal — the cycle's
   working canvas — governs, and the seed follows it. At cycle close the
   roles invert: the learned detail back-propagates into the seed
   (version bumped, status advanced), the proposal freezes into
   `spec/history/`, and the seed becomes the durable description until
   the next cycle opens a fresh proposal.
2. **British English; Vol. 15 terminology**; ids kebab-case; guild ids
   prefixed `guild.`.
3. **Guards apply whole** (guild-seeds §5): no self-granted capability;
   the target's constitution governs; admission explicit; history is not
   publication.
4. **The register** ([README.md](./README.md)) lists every seed in this
   repository with kind, version, and status — one line each.
