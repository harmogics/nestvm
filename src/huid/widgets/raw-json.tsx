// The lazy raw-JSON widget — the factory's total fallback (design_proposal
// §7): every formed item can disclose the committed record it fronts. The
// tuple is fetched by offset through the host-injected reader on first
// disclosure — the snapshot wire stays bounded, raw truth stays one
// gesture away (HUID 04 §3.3). This is the seam's one stateful widget:
// its state is a cache of a Class L read plus the native disclosure
// element — never semantic, never a second truth. An unreachable reading
// endpoint is stated, not hidden (seed §9 degradation).

import { useState } from "react";
import type { WidgetProps } from "./registry";

export function RawJsonWidget({ item, readTuple }: WidgetProps) {
  const [payload, setPayload] = useState<string | null>(null);
  const [absent, setAbsent] = useState<string | null>(null);

  async function disclose() {
    if (payload !== null || absent !== null) return;
    try {
      const tuple = await readTuple(item.offset);
      setPayload(JSON.stringify(tuple, null, 2));
    } catch {
      setAbsent("The raw record is not reachable here — the payload endpoint did not answer.");
    }
  }

  return (
    <details
      className="raw-tuple"
      onToggle={(event) => {
        if ((event.target as HTMLDetailsElement).open) void disclose();
      }}
    >
      <summary>raw · @{item.offset}</summary>
      {absent ? (
        <p className="raw-tuple-absent">{absent}</p>
      ) : (
        <pre className="raw-tuple-payload">{payload ?? "…"}</pre>
      )}
    </details>
  );
}
