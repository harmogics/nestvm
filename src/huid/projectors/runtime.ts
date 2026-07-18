import "server-only";

// The projector plane — the formation side's runtime (HUID 01 §7,
// ADR-009/ADR-010). A projector is an observer-class reading: a manifest
// (contract + reads), a pure fold, and a wire snapshot served with
// `asOfOffset`. Everything held here is a cache of fold(replay): any
// entry can be dropped and rebuilt from the log at any time — no second
// truth. The `server-only` marker makes any client-graph import a
// build-time error (ADR-010 Decision 2).

import type { WaveTuple } from "@/nest/wave/envelope";
import type { SessionRecord } from "@/nest/wave/store";
import { matchesReads, type ProjectorManifest } from "./manifest";

export type SnapshotProjector<S = unknown, M = unknown> = {
  manifest: ProjectorManifest;
  init(): S;
  step(state: S, tuple: WaveTuple): S; // pure over the log; offset order
  snapshot(state: S): M; // the serialisable wire model
};

type Entry = { state: unknown; folded: number };

const globalCache = globalThis as unknown as {
  __huidProjectorCache?: Map<string, Map<string, Entry>>;
};

function cache(): Map<string, Map<string, Entry>> {
  if (!globalCache.__huidProjectorCache) globalCache.__huidProjectorCache = new Map();
  return globalCache.__huidProjectorCache;
}

// `asOfOffset` is the length of the log the snapshot reflects: tuples
// 0…asOfOffset−1 are folded. Catch-up is lazy — a cold or lagging entry
// folds the missing suffix here; warm entries are advanced eagerly by the
// commit hook (registry.ts). A shrunken log (replaced session) rebuilds.
export function projectorSnapshot<S, M>(
  record: SessionRecord,
  projector: SnapshotProjector<S, M>
): { model: M; asOfOffset: number } {
  let perSession = cache().get(record.meta.id);
  if (!perSession) {
    perSession = new Map();
    cache().set(record.meta.id, perSession);
  }
  let entry = perSession.get(projector.manifest.contract);
  if (!entry || entry.folded > record.tuples.length) {
    entry = { state: projector.init(), folded: 0 };
    perSession.set(projector.manifest.contract, entry);
  }
  while (entry.folded < record.tuples.length) {
    const tuple = record.tuples[entry.folded];
    if (matchesReads(projector.manifest.reads, tuple)) {
      entry.state = projector.step(entry.state as S, tuple);
    }
    entry.folded += 1;
  }
  return { model: projector.snapshot(entry.state as S), asOfOffset: entry.folded };
}

// Eager advance for warm entries, driven by the store's commit hook. A gap
// (an entry lagging behind the batch head) is left for the lazy path — the
// two paths run the same fold, so divergence is impossible by construction.
export function advanceOnCommit(
  sessionId: string,
  batch: readonly WaveTuple[],
  projectors: ReadonlyMap<string, SnapshotProjector>
): void {
  const perSession = cache().get(sessionId);
  if (!perSession) return;
  for (const [contract, entry] of perSession) {
    const projector = projectors.get(contract);
    if (!projector) continue;
    for (const tuple of batch) {
      if (tuple.offset !== entry.folded) break;
      if (matchesReads(projector.manifest.reads, tuple)) {
        entry.state = projector.step(entry.state, tuple);
      }
      entry.folded += 1;
    }
  }
}
