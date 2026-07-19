import "server-only";

// The trace projector — the record lens's formation (proposal-centre-dock
// §3.3): an append fold producing one bounded row per tuple through the
// shared row-former registry (row-formers.ts). The observer-class claim
// (`factTypes: "*"`) is justified by the lens itself: its data product is
// everything, actor-classified (HUID 02 §5; HUID 03 §1.1). Summaries are
// bounded at formation; payloads never enter the snapshot — raw truth
// stays one disclosure away (P4).

import { TRACE, type TraceRow, type TraceSnapshot } from "@/huid/contracts/trace";
import { formRow } from "./row-formers";
import type { SnapshotProjector } from "./runtime";

export const traceProjector: SnapshotProjector<TraceRow[], TraceSnapshot> = {
  manifest: {
    contract: TRACE,
    reads: {
      kinds: ["sys.knot.defined", "sys.descriptor.defined", "sys.knot.ready"],
      factTypes: "*", // observer-class: the record lens's product is everything
      joins: ["knotId", "bindId", "uid"]
    }
  },
  init: () => [],
  step: (rows, tuple) => {
    rows.push(formRow(tuple));
    return rows;
  },
  snapshot: (rows) => ({ rows: [...rows] })
};
