// The shared row widget — the default rendering of every `row.*` form
// (the shared row-former vocabulary): one paper-integrated line — offset,
// actor chip, summary, correlation uid, kind label — fronting the record,
// never replacing it: the raw-JSON disclosure composes beneath
// (ADR-008 D3; HUID 04 §3.3). Lenses route to it per their own
// resolution-table lines; kneaded cards compose it inside disclosures
// (design_proposal §7, trap 4).

import type { TraceRow } from "../contracts/trace";
import { RawJsonWidget } from "./raw-json";
import type { FormedItem, WidgetProps } from "./registry";

export function RowWidget({ item, readTuple }: WidgetProps) {
  const row = item as FormedItem & TraceRow;
  return (
    <div className={`trace-row actor-${row.actor}`}>
      <div className="trace-row-line">
        <span className="off">{row.offset}</span>
        <span className={`actor-chip ${row.actor}`}>{row.actor}</span>
        <span className="summary">{row.summary}</span>
        {row.uid && <span className="uid">{row.uid}</span>}
        <span className="kind-tag">{row.label}</span>
      </div>
      <RawJsonWidget item={item} readTuple={readTuple} />
    </div>
  );
}
