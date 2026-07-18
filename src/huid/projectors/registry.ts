// The projector registry — adding a panel's server half is one entry here
// (the motherboard diff discipline, HUID 03 §3). `wireProjectors()`
// subscribes the plane to the store's commit hook once per process: warm
// caches advance eagerly on commit; cold ones catch up lazily inside
// projectorSnapshot(). Wiring is the app shell's act (assembly is the
// app's job) — the panel route calls it at module load.

import { onCommit } from "@/nest/wave/store";
import { depthProjector } from "@/huid/modules/depth-rail/projector";
import { advanceOnCommit, type PanelProjector } from "./runtime";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projectors = new Map<string, PanelProjector<any, any>>([
  [depthProjector.manifestId, depthProjector]
]);

export function projectorFor(panelId: string): PanelProjector | undefined {
  return projectors.get(panelId) as PanelProjector | undefined;
}

const globalWiring = globalThis as unknown as { __huidProjectorsWired?: boolean };

export function wireProjectors(): void {
  if (globalWiring.__huidProjectorsWired) return;
  globalWiring.__huidProjectorsWired = true;
  onCommit((sessionId, batch) => advanceOnCommit(sessionId, batch, projectors));
}
