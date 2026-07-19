# Guild seeds — growing cross-level modules through the system

**Status:** Working vision (SEED), 2026-07-18 — recorded at PROTOCOL_DEV
phases 1–3 depth (goal, constraints, anchors); not an ADR. Anchors:
ECOSYSTEM (packages, the two flows, boundaries), PHILOSOPHY §5/§8/§9,
Vol. 06 §7, Vol. 09, Vol. 12–13, HUID 02, meta-bind-01,
[proposal-centre-dock](./history/proposal-centre-dock.md) §7–8.

## 1. The vision

A system-scale module — a **guild seed** — is a cross-level capability
slice (fact vocabulary, topology figures, formation, presentation,
obligations) that plugs into a system **not as code but as a published
semantic description**, out of which the target system *grows* every
needed part — in the shape and at the points that target requires, while
carrying the experience and ideology of the source guild.

Code stays where it was manifested. What travels is the seed: declared
forms plus semantic content — questions, angles, thresholds, rubrics,
close instructions, schemas, fixtures, provenance, applicability,
licence. Distribution is publication; installation is growth.

## 2. What the corpus already provides

The vision is anticipated, not invented — the anchors:

1. **Packages, not code merges.** "Portable knowledge crosses the
   product boundary primarily as pipeline packages … not as code
   merges"; "The primary public unit is not a source-code fork … It is a
   versioned figure package" (ECOSYSTEM).
2. **Programmes are data.** An authoring pipeline is YAML compiled into
   records committed as seeds (Vol. 09); a bind may sow bounded topology
   from a declared template mid-flight (unfold, Vol. 06 §7). Growth
   through description is the machine's native mode.
3. **Inert until admitted.** "Proposal is not installation. Generated
   topology is inert until compiled and admitted" (PHILOSOPHY §5;
   Vol. 12's admission/trial/promotion cycle; Vol. 13 §2).
4. **Guilds and case packages exist in the seed extensions.** CoAgnes
   names professions, guilds, teams as the carriers of gestures
   (Vol. 13); the case package already bundles `pipeline + schemas +
   evidence + rubric + views/ + fixtures + manifest` — with the decisive
   note that "generic schema-derived UI [is] always sufficient".
5. **HUID modules are proposable artefacts.** PHILOSOPHY §5 lists what
   the system may propose from observed work: "new tuples, schemas, YAML
   packages, bind functions, controllers, **HUID modules**, or external
   agents".

And the figure holds: seed → manifestation is collection → accumulation
→ publication at ecosystem scale (meta-bind-01; the commons rows).

## 3. What is genuinely new here

1. **Cross-level scope in one seed.** Existing packages cover
   pipeline + schemas (+ views for cases). The guild seed spans all
   radii coherently: fact families, knot/bind figures, snapshot
   contracts with their folds, module manifests with form keys,
   obligations and rubrics — one vertical slice, one provenance.
2. **Target-adaptive manifestation.** The seed does not dictate
   placement byte-for-byte; the target assembles per its own geometry —
   which docks exist, which widgets are registered, which capabilities
   its control plane grants. The fallback chains make partial
   manifestation honest: schema-derived generic widgets render what has
   no custom form; ungranted capabilities degrade to visible,
   settled-unfinished states — never silent absence.
3. **Ideology travels as content.** The guild's experience arrives as
   the semantic filling of declared forms — the very split the system
   runs on (declared form, supplied content): questions, angles,
   thresholds, rubrics, evidence, applicability, failure examples.
   Precedent informs the new act; it does not silently become law
   (PHILOSOPHY §8).

## 4. The manifestation walk (the figure at package scale)

```text
source system: the guild's work → structural analysis → the seed
  (de-identification, rights review — the commons threshold, PHILOSOPHY §9)
        ↓ publication (versioned, provenance, licence)
target system:
  admit    — compiler verdicts per part; capability requirements checked
             against the target's control plane; licence/applicability
             reviewed; all-or-nothing per part, explicit rejections
  sow      — records, contracts, manifests committed through declared
             templates (the system's own unfold, one radius up)
  ground   — the seed's fixtures replayed; a trial run where required
  seat     — modules appear in docks; degraded parts named honestly
        ↓
the guild lives: the target's geometry, the seed's ideology
```

## 5. Guards (hard, from the standing law)

1. **Capability is never self-granted.** A seed *declares* required
   controllers and capabilities; only the target's control plane grants
   them (Vol. 07 §2.6; Vol. 12 §9–10; PHILOSOPHY §5). Absent grants
   degrade honestly.
2. **The target's constitution governs.** A seed cannot widen the
   target's core or bend its articles; anything beyond declared rails
   arrives as an inert proposal for the target's own review cycle.
3. **Admission is explicit.** Unknown constructs are rejected with
   diagnostics, never skipped silently (Vol. 09 §6 discipline).
4. **History is not publication.** A seed is a reviewed derivative,
   never an accidental exposure of the source guild's raw history
   (PHILOSOPHY §9; ECOSYSTEM boundary 2).

## 6. The runway — what must become declarative, in order

The current work is this vision's precondition path, not a detour:

1. **The widget fallback chain** (proposal-centre-dock §7) — once the factory
   stands, presentation is growable from schemas alone: a seed's fact
   family renders through generic widgets on day one, gaining custom
   forms only where the target registers them.
2. **Declarative projector folds** — the projector is knot-shaped
   (meta-bind-01), and knots already have a declarative accumulator
   grammar (collect rules + condition, Vol. 05); a fold-strategy
   registry mirroring the knot strategy registry (Vol. 05 §8) lets a
   seed *declare* its contracts' formation; custom strategies remain
   named extension points the target must hold or admit as inert
   proposals.
3. **Config-driven seating** — module manifests are already data;
   host-side registries (the centre carousel, the resolution tables)
   must read from configuration so a seed can seat panels without host
   edits (preparation P3/P5).
4. **Fact families by schema** — the Vol. 09 §7 subset carries the
   seed's tuple vocabulary.
5. **The guild layer proper** — charters, obligations, rubrics, roles:
   the Vol. 12–13 territory, entered when the machine core lands.

## 7. Open questions (living)

1. The seed format itself: one manifest spanning the parts, or the
   case-package layout (Vol. 13 §5) extended with `contracts/` and
   `modules/` sections? — *2026-07-18: first answer recorded — one
   markdown format with a kind taxonomy (atomic capabilities as
   degenerate guilds), [capabilities/FORMAT.md](../capabilities/FORMAT.md);
   the first seed is
   [guild.centre-dock](../capabilities/seed_centre-dock.md). The YAML
   profile stays open until manifestation is mechanised.*
2. Versioning and revision of a manifested guild in a target that has
   since grown its own local forms atop it.
3. Trial semantics for presentation parts (what is the "fixture run" of
   a widget resolution table?).
4. The naming boundary: "guild seed" is product-layer language; whether
   the machine set ever needs a term for it (likely not — it is a
   package profile, not a runtime concept).
