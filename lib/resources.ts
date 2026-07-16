// The pluggable resource resolvers (ADR-004 Decision 5): tuples carry
// bounded references; content is resolved at attention time, server-side,
// within a declared budget. Adapters: the spec corpus (volume sections), the
// wave log itself (committed tuples by offset), and — once the workshop
// exists — frozen drafts.

import { corpus } from "./corpus";
import type { SessionRecord } from "./store";
import type { DomainFactPayload, ResourceRef, WaveTuple } from "./types";

export type ResolvedResource = { title: string; content: string };

export interface ResourceResolver {
  resolve(ref: ResourceRef): Promise<ResolvedResource | null>;
}

function bound(text: string, limit: number): string {
  const flat = text.replace(/\s+\n/g, "\n").trim();
  return flat.length > limit ? flat.slice(0, limit - 1).replace(/\s+\S*$/, "") + "…" : flat;
}

// --- spec corpus: '05-activation-knots' or '05-activation-knots#3-…' --------

async function resolveSpec(ref: string, limit: number): Promise<ResolvedResource | null> {
  const [slug, anchor] = ref.split("#");
  const c = await corpus();
  if (anchor) {
    const section = c.sections.find((s) => s.slug === slug && s.anchor === anchor);
    if (!section) return null;
    return {
      title: `${section.volumeLabel} · ${section.heading}`,
      content: bound(section.text, limit)
    };
  }
  const doc = c.docs.find((d) => d.slug === slug);
  const markdown = c.markdownBySlug.get(slug);
  if (!doc || markdown === undefined) return null;
  return { title: `${doc.volumeLabel} — ${doc.title}`, content: bound(markdown, limit) };
}

// --- wave log: 'offset:42' ---------------------------------------------------

function resolveWave(record: SessionRecord, ref: string, limit: number): ResolvedResource | null {
  const match = ref.match(/^offset:(\d+)$/);
  if (!match) return null;
  const tuple: WaveTuple | undefined = record.tuples[Number(match[1])];
  if (!tuple) return null;
  if (tuple.kind === "domain.fact") {
    const payload = tuple.payload as DomainFactPayload;
    const d = payload.data ?? {};
    if (
      payload.factType === "learning.integration.candidate" ||
      payload.factType === "learning.integration.returned"
    ) {
      const result = (d.result ?? {}) as { statement?: string };
      return {
        title: `integration @${tuple.offset}`,
        content: bound(String(result.statement ?? ""), limit)
      };
    }
    if (payload.factType === "learning.turn.submitted") {
      return { title: `turn @${tuple.offset}`, content: bound(String(d.text ?? ""), limit) };
    }
  }
  return {
    title: `${tuple.kind} @${tuple.offset}`,
    content: bound(JSON.stringify(tuple.payload), limit)
  };
}

// --- composite ---------------------------------------------------------------

export function resolverFor(record: SessionRecord, limit = 1600): ResourceResolver {
  return {
    async resolve(ref: ResourceRef): Promise<ResolvedResource | null> {
      switch (ref.store) {
        case "spec":
          return resolveSpec(ref.ref, limit);
        case "wave":
          return resolveWave(record, ref.ref, limit);
        case "workshop":
          return null; // arrives with the workshop store
        default:
          return null;
      }
    }
  };
}
