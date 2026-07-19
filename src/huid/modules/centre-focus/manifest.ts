import { SCENE_DETAIL } from "../../contracts/scene-detail";
import type { ModuleManifest } from "../../manifest";

// The figure lens (centre carousel) — one scene in depth: the opened lid
// (ADR-005 D3), knot cards composing factory widgets in their strata
// disclosures, the candidate panel (seed §4.4). Retargeting the composer
// is a `composer.target` write (the promoted shared key) — never a
// module-to-module call. The evidence source menu and catalogue picks are
// the module's namespaced disclosure parameters.
export const centreFocusManifest: ModuleManifest = {
  id: "centre.focus",
  title: "focus",
  dock: "centre",
  consumes: [SCENE_DETAIL],
  params: [
    "focus.bindId",
    "composer.target",
    "centre.focus.sourceMenu",
    "centre.focus.catVolume",
    "centre.focus.catSection",
    "session.busy",
    "session.status"
  ],
  commits: ["evidence", "readSource", "deepen", "markUnknown", "accept"],
  navigates: [
    "focus.bindId",
    "centre.view",
    "composer.target",
    "centre.focus.sourceMenu",
    "centre.focus.catVolume",
    "centre.focus.catSection"
  ]
};
