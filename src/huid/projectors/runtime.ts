// The projector plane — the host's server half (HUID 01 §7, ADR-009). A
// projector is an observer-class reading: executable claims (the module
// manifest's `reads`), a pure fold, and a wire snapshot served with
// `asOfOffset`. Everything held here is a cache of fold(replay): any entry
// can be dropped and rebuilt from the log at any time — no second truth.
// Server-only code; client components never import this directory.

import type { WaveTuple } from "@/nest/wave/envelope";
import type { SessionRecord } from "@/nest/wave/store";

export type PanelProjector<S = unknown, M = unknown> = {
  manifestId: string; // the module it serves, e.g. 'right.depth'
  claims(tuple: WaveTuple): boolean; // manifest.reads, executable
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
  projector: PanelProjector<S, M>
): { model: M; asOfOffset: number } {
  let perSession = cache().get(record.meta.id);
  if (!perSession) {
    perSession = new Map();
    cache().set(record.meta.id, perSession);
  }
  let entry = perSession.get(projector.manifestId);
  if (!entry || entry.folded > record.tuples.length) {
    entry = { state: projector.init(), folded: 0 };
    perSession.set(projector.manifestId, entry);
  }
  while (entry.folded < record.tuples.length) {
    const tuple = record.tuples[entry.folded];
    if (projector.claims(tuple)) entry.state = projector.step(entry.state as S, tuple);
    entry.folded += 1;
  }
  return { model: projector.snapshot(entry.state as S), asOfOffset: entry.folded };
}

// Eager advance for warm entries, driven by the store's commit hook. A gap
// (entry lagging behind the batch head) is left for the lazy path — the
// two paths run the same fold, so no divergence is possible.
export function advanceOnCommit(
  sessionId: string,
  batch: readonly WaveTuple[],
  projectors: ReadonlyMap<string, PanelProjector>
): void {
  const perSession = cache().get(sessionId);
  if (!perSession) return;
  for (const [manifestId, entry] of perSession) {
    const projector = projectors.get(manifestId);
    if (!projector) continue;
    for (const tuple of batch) {
      if (tuple.offset !== entry.folded) break;
      if (projector.claims(tuple)) entry.state = projector.step(entry.state, tuple);
      entry.folded += 1;
    }
  }
}
