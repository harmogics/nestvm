# ADR-008: The session archive and the UI request path

**Status:** Accepted and executed, 2026-07-17. Builds on ADR-005 (replay
instruments), ADR-006/ADR-007 (the HUID layer and the radial layout), and
the public foundation documents ([PHILOSOPHY.md](../PHILOSOPHY.md),
[ECOSYSTEM.md](../ECOSYSTEM.md)).

## Context

The first UI feature request arrived after the rails landed: a surface for
saving and loading the current session. It was taken deliberately as the
proving request — implemented end to end to show where such functionality
enters the rails and how it is shaped on the UI — and used to fix the
standing intake path for every similar request, together with the calm
mandate (inductive UI, low element load, minimal popups), now grounded and
made binding in [HUID 04](../huid/04-attention-and-calm.md).

## Decision 1 — the UI request path (standing intake)

Every UI request travels one path, in order:

1. **Classify** by the routing table ([src/README.md](../src/README.md)):
   which regions does it touch? A request that fits no region is a layer
   question, not a guess.
2. **Manifest before code**: write the module manifest (or name the reason
   the surface is app chrome — see Decision 2); a read the log cannot serve
   is a protocol widening first (Vol. 08 §8).
3. **Dock and calm**: fix the placement (ADR-003 spatial grammar) and check
   the load contract (HUID 04): resting state within budget, disclosure
   over dialogs, refusals inline, visual weight by kind of act.
4. **Implement in the named regions** — backend capability in `nest`/
   `corpus`/`product`, orchestration in `app` routes, surface in
   `src/huid` (or app chrome), styles in the existing vocabulary.
5. **Verify**: `tsc`, fixtures where derivations changed, live smoke of the
   full gesture path including the honest refusals.
6. **Record**: a worked example in HUID 03 §5 when a boundary is
   discovered; an ADR when a decision is taken.

## Decision 2 — the archive, and the registry boundary it discovered

- **Export is a materialised reading.** `GET /api/sessions/:id/archive`
  streams the wave log verbatim in the wire format (Vol. 03 §6) as a
  download. It commits nothing and discharges nothing — replay is reading
  (Vol. 03 §6.4). On the UI it is one quiet link on the session strip
  (module `strip.session-archive`), styled lighter than commits.
- **Import is continuation as a product act.** `POST /api/sessions/import`
  accepts a `.jsonl` recording: parsed and validated at the wave level
  (dense offsets, envelope shape), the meta sidecar **derived from the log
  itself** via the shared projection (sidecars are convenience, never a
  second truth — Vol. 03 §6.3; the log carries no wall clock, so
  `createdAt` records the import moment). The log enters verbatim — never
  re-keyed, never renumbered, never re-discharged (Vol. 08 §9). An id
  collision refuses honestly; correction is a new act, never an overwrite.
- **The discovered boundary**: session-registry operations (open, list,
  import) act *before a session's feed exists* and are therefore app-shell
  chrome (`src/app/studio/import-session.tsx`, beside the new-session
  form), while in-session capability is a HUID module. Recorded as
  HUID 03 §5.4.
- **Archive ≠ publication.** A raw log belongs to the context that
  produced it (PHILOSOPHY §9; ECOSYSTEM boundary 2: history is not
  publication). The export is the owner's private record; both faces of
  the UI say so in one quiet line, and the fixtures licensing note applies
  the same rule to recorded sessions in this repository.

## Decision 3 — the trace's trajectory to a business instrument

The log view's present form (actor-classified rows, summaries, payload one
click away) is confirmed as the right substrate, and its evolution is
fixed on existing rails: trace rows graduate from technical summaries to
**matched templates** — a renderer registry over the trace (the
`canvasRenderers` pattern; the trace registry arrives in
`nest/readings/trace.ts` at HUID migration step 1), where each template
claims tuples by kind/factType/payload match exactly as collection rules
and claims do elsewhere in the machine. The raw JSON never disappears: it
stays one disclosure away (HUID 04 §3.3). The movement from technical
structure to a semantic business instrument is therefore a growth of
registered readings — never a second truth, never a lossy replacement.

## Consequences

1. `src/nest/wave/store.ts` gains `serialiseLog` / `parseLog` /
   `createSessionFromLog`; two thin routes orchestrate in `src/app`.
2. `src/huid/manifest.ts` seats the ModuleManifest type — the first code
   of the device layer; `src/huid/modules/session-archive/` is the first
   module directory, with its lid.
3. HUID 04 is binding: the module conformance checklist gains the calm
   item (HUID 03 §1.9).
4. Recorded sessions in `fixtures/` and archives exported by users stay
   outside the blanket licences (the fixtures licensing note); a commons
   contribution is a separate reviewed act.

## Open questions

1. Importing a duplicate under a fresh id — re-keying is forbidden, so a
   duplicate would be a *new session opened with re-presentation facts*
   referencing the source recording; deferred until wanted.
2. Exporting the result document (a derived artefact, not the raw log) as
   a shareable projection — the PHILOSOPHY §9 threshold applies; deferred.
3. Size and rate limits for import beyond the current 4 MB guard.
