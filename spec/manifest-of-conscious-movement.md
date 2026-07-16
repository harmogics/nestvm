# Manifest of conscious movement

**Status:** Working agreement, 2026-07-16. This document states how the human
participates in the study machine — what the human brings, what lies outside
the human's reach, and where responsibility concentrates. It is checked
against the Nest Runtime Specification Set, the Semantic Vessel drafts, and
the thinking rails in `CLAUDE.md`, and it is to be kept current as the system
evolves. It is a reconciliation of vision, not an exhaustive rulebook.

## 1. Two planes, one truth

There are two storage planes, but only one truth:

1. **The append log of the system** — wave tuples. It records *everything
   that happened*, including every responsibility-bearing human act, because
   a human decision that is not a committed fact cannot participate in the
   machine's causality and cannot be replayed. Human facts are stamped with
   actor identity server-side, never self-declared by the browser
   (Vol. 12 §5.5, §8).
2. **The UI backend around the log** — three legitimate residents, none of
   which is a second truth:
   - the **command journal**: raw API commands with idempotency keys, before
     they become committed facts (a retry must not duplicate a turn);
   - **navigation state**: focus, scrolling, opened inspectors — read-model
     only; navigation never enters the wave (ADR-003; open-bind-architecture,
     command boundary);
   - **derived readings**: projections recomputable from the log at any time
     — among them the manifest below.

The **interaction point** between the planes is the session API: a gesture
arrives as a command, the ingress mapper validates it, stamps authority, and
commits it as a fact; everything the UI then shows is a derivation of
committed tuples. This API (sessions / turns / decisions / projections) is
the swap surface under which the simulated machine will be replaced by the
core organised as semantic vessels.

## 2. What the human brings

| Act | Fact vocabulary | Notes |
| --- | --- | --- |
| Brings external context; initiates the dialogue | `learning.session.opened`, `learning.turn.submitted` (plain signal) | Plain signals rest quietly; nothing activates without an operator |
| Asks to deepen where the system cannot reach the needed level | decision `deepen` → sown child figure | The system's honest stalls (budget exhaustion, settled unfinished) are its way of *inviting* this act |
| Gives direct answers to questions | `learning.answer.submitted` (targeted, correlated) | A `human.answer` obligation cannot be satisfied by guide text (Vol. 13 §5) |
| Participates in binds/knots architecture — only through inputs and the choice of semantic operation | `learning.bind.selected` (operator id + parameters + emphasis) | The agent authors content within the declared template; the human authors purpose, emphasis and the act itself (ADR-003 authorship boundary) |
| Selects artefacts and focuses the forming bind on them | `sourceSnapshot` sealed in `learning.bind.selected`; re-presentation facts | Inclusion/exclusion is frozen at creation; later movement on the left never changes a running bind |
| Reads what a bind produced, revises it, and commits the revision as a new tuple | `learning.integration.revised` (planned) → new fact with `sourceOffset` + seams | **The key responsibility step** — see §4 |
| Accepts or declines adoption of a result | `learning.integration.accepted`, review/archive facts | Silence is never consent |
| Attests completion under the result contract | `learning.session.completed` | Quiescence is never presented as completion |

## 3. Outside the human's reach

1. **Nothing committed can be changed.** Append-only history; registers are
   not addressable (Vol. 02 §4.7). Correction is always a *new* fact carrying
   a reference to what it corrects.
2. **No forced wording of a knot or bind on the live surface.** In-session
   authoring goes through the agent within allowlisted templates; the human
   steers by inputs, emphasis and acceptance, and may reject or request
   revision — not dictate the record. (The full-precision authoring path —
   external YAML through compile and admission — exists, but it is a
   different, heavier door; and re-registration of a live knot resets its
   clew, destroying accumulated understanding, so it is never an "edit".)
3. **Knots decide what they wind.** Collection rules are fixed at
   registration. An ambient fact reaches every attuned clew — the human can
   *aim* a fact narrowly (discriminators: a targeted answer), but cannot
   shield other attuned knots from an ambient one (reception is reading,
   Vol. 01 §8).
4. **A bind fires when its barrier settles.** Once its records are in the
   log, no one stops the rendezvous (one-shot latch, Vol. 06 §4.2). What
   remains human is *adoption*: the four verdicts never collapse — bind
   completion ≠ assessment ≠ human acceptance (Vol. 12 §5.4). Budgets, not
   vetoes, bound the machine's motion.

## 4. The responsibility step

The centre of human responsibility is the **read → revise → append** cycle
over what a bind produced:

- the human reads the published integration;
- makes it their own — accepting parts, correcting parts, adding their own
  judgement;
- commits the result as a **new tuple** that references the source offset and
  preserves the seams: what came from the machine, what the human changed
  and why (no-laundering; supersession leaves a visible seam).

This is the carrier-transfer moment (open-bind-architecture O7, scenario 6):
authorship boundaries survive the transfer, and the revised value — not the
raw machine output — is what enters future affinity as the human-adopted
understanding.

## 5. The geometry of gestures

- **Top-down**: bind → read its publication → append the human revision as a
  new tuple. The human acts as an integrator whose delta enters the log.
- **Right-to-left through the centre**: binds awaiting attention (published
  candidates, obligations awaiting answers) queue on the right; the human
  pulls one into the centre, works it, and releases the accepted artefact to
  the left — where it becomes a source for the next bind formed above.

Binds are formed in exactly two places: the composer (text + operation
choice) and Deepen on a knot. Information enters knots in exactly three ways:
the composer (targeted by the chosen coordinates — answer/challenge — or
ambient), attunement of a new scene's knots to selected left artefacts
(re-presentation with refs), and the human's committed revision of a bind's
product.

## 6. The manifest as a living surface

The manifest itself is a **derived reading**: a pure function of the log that
lists every human act by category (initiations, answers, deepenings, source
selections, revisions, acceptances, unknown-marks, attestations) with offsets
and context — and equally what was *not* done (candidates left unadopted).
It is at once the audit trail of responsibility, the honest record of the
human/machine seam, and the evidence base for the maturity-cube E-face:
articulability measured from committed work, not self-report.

## 7. Known gaps against this manifest (to be closed)

1. `learning.integration.revised` — the read→revise→append step — is not yet
   implemented; acceptance is currently binary.
2. Re-presentation facts for left-rail sources (beyond the sealed snapshot
   and agent prompt context) are not yet committed to the log.
3. The right rail is not yet an attention queue (published candidates and
   awaiting obligations across all scenes).
4. The manifest surface (derived panel/export) does not yet exist.
5. Actor identity is nominal (`learner`); real attribution arrives with the
   session layer of the core phase.
