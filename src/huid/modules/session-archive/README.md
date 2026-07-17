# session-archive — the first seated module

**Role.** Saving and loading a session, split along the feed boundary:

- **In-session face (this module, dock `strip`).** One quiet link that
  downloads the session's wave log in the wire format — a materialised
  reading with no log effect. Manifest: [manifest.ts](./manifest.ts); view:
  [strip.tsx](./strip.tsx).
- **Registry face (not a module).** Importing a recording acts *before a
  session's feed exists*, so it is app-shell chrome beside the new-session
  form (`src/app/studio/import-session.tsx`) calling the registry route
  `POST /api/sessions/import`. This boundary — session-registry operations
  are app chrome, in-session capability is a module — is recorded in
  ADR-008 Decision 2 and HUID 03 §5.4.

**Governed by.** ADR-008; ADR-005 Decision 2 (continuation); Vol. 03 §6
(wire format, sidecars as convenience); Vol. 08 §9 (never re-discharge);
PHILOSOPHY §9 and ECOSYSTEM boundary 2 (a recording is private history,
not a publication).

**Calm notes (HUID 04).** No dialogs on either face: export is the
download itself; import is one native file input with inline honest
refusals. Reads render lighter than commits.
