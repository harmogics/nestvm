# HUID 04 — Attention and Calm: the Load Contract

Status: SEED · Snapshot date: 2026-07-19 ·
Previous: [03-conformance-and-migration.md](./03-conformance-and-migration.md)

The device serves inductive work: it shows what the next judgement needs and
keeps everything else one deliberate gesture away. This volume makes the
attention discipline binding for every module — inherited from ADR-003
("silence is part of the interface"), the attention contract of
[open-bind-architecture](../spec/open-bind-architecture.md), and
PHILOSOPHY §3 (a gesture is more important than a screen event) — and
grounds it in the psychology of attention and load. Citations are brief;
sources are listed in §8.

## 1. Why calm is an architectural property

Working memory holds very few active chunks — the classical estimate is
seven plus or minus two (Miller 1956), the modern one nearer four
(Cowan 2001). Every element on screen competes for those slots, and every
always-visible control taxes every choice: decision time grows with the
logarithm of the number of alternatives (Hick 1952). Load that does not
serve the material is extraneous load, and it displaces the intrinsic load
the person came to carry — the semantics of their study (Sweller 1988).
Calm is therefore not styling; it is capacity management for the semantic
work the machine exists to host.

## 2. The load budget

1. A module's **resting state** shows only what the next judgement needs —
   a handful of elements, not an inventory. If a resting surface wants more
   than working memory comfortably holds (§1), it is two surfaces.
2. Enumerations longer than a glance (catalogues, long traces) rest
   **collapsed or filtered**, never fully unrolled by default.
3. A control appears where and when its gesture is possible — not
   permanently "in case". Empty states stay quiet: no diagnostic prose for
   valid inactivity (ADR-003).
4. Representation and preference controls rest in the quiet meta line or
   appear on disclosure — never as standing chrome (2026-07-19).

## 3. Disclosure over dialogs

1. **Progressive disclosure** is the default mechanism: detail unfolds in
   place, initiated by the user, and folds back (Nielsen 2006). The
   existing surfaces already carry the pattern — the produced-tuples
   `details`, the trace row expanding to its payload, the evidence menu
   opening inline under its knot.
2. **No modal popups; no overlapping layers.** The device renders in one
   plane; expansion happens inside the flow that requested it. Native
   lightweight controls (details, select, file input, `title` hints) are
   preferred to constructed overlays.
3. **Raw truth one gesture away.** As trace rows grow matched, readable
   templates (ADR-008 Decision 3), the underlying JSON payload stays
   exactly one disclosure away — the business reading never replaces the
   inspectable record, it fronts it.

## 4. Interruption discipline

Interruptions measurably raise completion time, error rates, and
self-reported anxiety (Bailey & Konstan 2006); people compensate for
interrupted work by working faster at the price of stress (Mark, Gudith &
Klocke 2008). Therefore:

1. **Nothing unsolicited moves or appears.** No toasts, no auto-opening
   panels, no attention-seeking animation. The machine's self-movement
   (readiness, barrier settlement) surfaces as quiet state change in place,
   discovered where the person already looks.
2. **Refusals and failures appear inline**, at the gesture that caused
   them, in the machine's honest words — and they do appear: calm never
   hides failure. Honest incompleteness is "not a defect to conceal behind
   a calm interface" (PHILOSOPHY §7; Vol. 08 §7).
3. A blocking dialog is reserved for one class only: confirming a
   genuinely irreversible act outside the log's own protections. Nothing in
   the current device qualifies.

## 5. Visual weight follows the kind of act

The three kinds of act (thinking rail 1) read at three weights: **reads**
(links, disclosures) sit lightest; **navigation** sits light;
**commits** carry button weight; **authoring** gestures (unfold, deepen,
reframe) carry distinguished weight (thinking rail 6). A person should be
able to sense, before reading a label, whether a control merely shows,
moves, commits, or sows.

## 6. Rising-cost points

Provenance, seams, grades, context radius, and raw payloads become visible
at their rising-cost points — operator execution, integration review,
challenge, acceptance, attestation, replay inspection
(open-bind-architecture, attention contract) — and stay collapsed
elsewhere. The log remains complete while the surface stays selective:
omission never erases provenance, it defers it one gesture.

## 7. Module obligations

Added to the conformance checklist (HUID 03 §1, item 9). A conforming
module demonstrates:

1. a resting state within the load budget of §2, and expansions that are
   user-initiated and fold back;
2. no modal or overlapping layers; native controls preferred;
3. no unsolicited interruptions; refusals inline and verbatim;
4. visual weight per §5, authoring distinguished;
5. raw records one disclosure away wherever a template fronts them.

## 8. Sources

- G. A. Miller (1956), "The magical number seven, plus or minus two",
  *Psychological Review* 63(2), 81–97.
- N. Cowan (2001), "The magical number 4 in short-term memory",
  *Behavioral and Brain Sciences* 24(1), 87–114.
- W. E. Hick (1952), "On the rate of gain of information", *Quarterly
  Journal of Experimental Psychology* 4(1), 11–26.
- J. Sweller (1988), "Cognitive load during problem solving", *Cognitive
  Science* 12(2), 257–285.
- B. P. Bailey, J. A. Konstan (2006), "On the need for attention-aware
  systems", *Computers in Human Behavior* 22(4), 685–708.
- G. Mark, D. Gudith, U. Klocke (2008), "The cost of interrupted work:
  more speed and stress", *Proc. CHI '08*, 107–110.
- J. Nielsen (2006), "Progressive disclosure", Nielsen Norman Group.
