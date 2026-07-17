import type { ModuleManifest } from "../../manifest";

// Session archive — the in-session face: one quiet link that materialises
// the session's wave log as a .jsonl download. Export is a read-model
// reference (replay is reading, Vol. 03 §6.4): it commits nothing, so the
// manifest declares no commits and no own fold. The registry face —
// importing a recording — is deliberately NOT a module: it acts before a
// session's feed exists, so it lives as app-shell chrome beside the
// new-session form (ADR-008 Decision 2).
export const sessionArchiveManifest: ModuleManifest = {
  id: "strip.session-archive",
  title: "Archive",
  dock: "strip",
  reads: { factTypes: [], joins: [] },
  derives: [],
  params: [],
  commits: [],
  navigates: ["download /api/sessions/:id/archive — the log in wire format; no log effect"]
};
