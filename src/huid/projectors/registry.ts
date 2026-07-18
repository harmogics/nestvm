import "server-only";

// The projector registry — adding a contract's formation is one entry
// here (the motherboard diff discipline, HUID 03 §3). Keyed by contract
// id, never by panel: one projector may feed any number of consuming
// panels (ADR-010). `wireProjectors()` subscribes the plane to the
// store's observer hook once per process — the app shell's act, because
// assembly is the app's job. The wave itself stays panel-ignorant.

import { onCommit } from "@/nest/wave/store";
import { sceneRegistryProjector } from "./scene-registry";
import { advanceOnCommit, type SnapshotProjector } from "./runtime";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projectors = new Map<string, SnapshotProjector<any, any>>([
  [sceneRegistryProjector.manifest.contract, sceneRegistryProjector]
]);

export function projectorFor(contractId: string): SnapshotProjector | undefined {
  return projectors.get(contractId) as SnapshotProjector | undefined;
}

const globalWiring = globalThis as unknown as { __huidProjectorsWired?: boolean };

export function wireProjectors(): void {
  if (globalWiring.__huidProjectorsWired) return;
  globalWiring.__huidProjectorsWired = true;
  onCommit((sessionId, batch) => advanceOnCommit(sessionId, batch, projectors));
}
