// The widget seam (design_proposal §7, preparation P5) — the presentation
// face of the tuple factory. Form keys are stamped server-side by the
// projectors' formers; widgets resolve client-side through the table
// below, keyed (lens, form) — never form alone (§7 trap 1) — cascading
// exact form → family (`<family>.*`) → the raw-JSON floor. Widgets never
// parse payloads (classification lives in projectors only) and never
// fetch: raw truth arrives through the host-injected reader (§12.5.4).
// Growth = one widget + one table line; re-routing a form to another
// widget is a table line, never a widget edit.

import type { ComponentType } from "react";
import { RawJsonWidget } from "./raw-json";
import { RowWidget } from "./row";

export { RawJsonWidget } from "./raw-json";
export { RowWidget } from "./row";

// An offset-anchored item as a projector formed it: the truth anchor,
// the server-stamped form key (factType idiom), and the fields that
// survived formation.
export type FormedItem = {
  offset: number;
  form: string;
} & Record<string, unknown>;

// The host-owned Class L reader over GET /sessions/:id/tuples/:offset.
export type TupleReader = (offset: number) => Promise<unknown>;

export type WidgetProps = {
  item: FormedItem;
  readTuple: TupleReader;
};

export type WidgetComponent = ComponentType<WidgetProps>;

export const RAW_JSON = "raw-json";
export const ROW = "row";

// — the widget implementations, by id —
const widgets = new Map<string, WidgetComponent>([
  [RAW_JSON, RawJsonWidget],
  [ROW, RowWidget]
]);

export function registerWidget(id: string, component: WidgetComponent): void {
  widgets.set(id, component);
}

// — the declarative resolution table: one line per (lens, form) route —
type ResolutionLine = { lens: string; form: string; use: readonly string[] };

const resolutionTable: ResolutionLine[] = [];

export function routeForm(line: ResolutionLine): void {
  resolutionTable.push(line);
}

function familyOf(form: string): string {
  const dot = form.indexOf(".");
  return dot === -1 ? form : `${form.slice(0, dot)}.*`;
}

// The cascade: exact (lens, form) → (lens, family) → the raw-JSON floor.
// Total coverage property: no formed item is ever without a widget.
export function resolve(lens: string, form: string): readonly WidgetComponent[] {
  const ids: string[] = [];
  for (const line of resolutionTable) {
    if (line.lens === lens && line.form === form) ids.push(...line.use);
  }
  const family = familyOf(form);
  for (const line of resolutionTable) {
    if (line.lens === lens && line.form === family) ids.push(...line.use);
  }
  ids.push(RAW_JSON);
  const seen = new Set<string>();
  const chain: WidgetComponent[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const component = widgets.get(id);
    if (component) chain.push(component);
  }
  return chain;
}
