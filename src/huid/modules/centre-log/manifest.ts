import { TRACE } from "../../contracts/trace";
import type { ModuleManifest } from "../../manifest";

// The record lens (centre carousel) — everything, actor-classified, one
// paper-integrated row per tuple; raw truth one disclosure away through
// the host's tuple reader. Presentation side only (ADR-010): the module
// consumes the trace contract; the observer-class formation declaration
// lives with the projector (src/huid/projectors/trace.ts). The actor
// filter is the module's own namespaced parameter — every control here
// is navigation or disclosure; the lens never commits (seed §4.6).
export const centreLogManifest: ModuleManifest = {
  id: "centre.log",
  title: "log",
  dock: "centre",
  consumes: [TRACE],
  params: ["centre.log.actor"],
  commits: [],
  navigates: ["centre.log.actor"]
};
