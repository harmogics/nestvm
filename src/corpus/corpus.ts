// The specification corpus: loads specifications/*.md (volumes and the
// refimpl book), indexes sections, and answers deterministic evidence
// queries with quoted excerpts and volume/section references. Server-only.

import { promises as fs } from "fs";
import path from "path";
import { anchorOf } from "./anchor";
import type { EvidenceExcerpt } from "@/nest/wave/envelope";

const SPEC_ROOT = path.join(process.cwd(), "specifications");

export type SpecDocMeta = {
  slug: string; // '01-overview' | 'refimpl/03-knots'
  file: string;
  volumeLabel: string; // 'Vol. 01' | 'refimpl 03'
  title: string;
  status: string; // CURRENT | DECLARED | PROPOSED | SEED | mixed labels
  order: number;
  book: "volumes" | "refimpl";
};

export type SpecSection = {
  slug: string;
  volumeLabel: string;
  docTitle: string;
  heading: string;
  anchor: string;
  text: string;
};

export type SpecDocument = SpecDocMeta & { markdown: string };

type Corpus = {
  docs: SpecDocMeta[];
  sections: SpecSection[];
  markdownBySlug: Map<string, string>;
};

const globalCorpus = globalThis as unknown as { __nestSpecCorpus?: Promise<Corpus> };

function volumeLabelFor(slug: string): string {
  const base = slug.split("/").pop() ?? slug;
  const match = base.match(/^(\d{2})-/);
  const num = match ? match[1] : "??";
  return slug.startsWith("refimpl/") ? `refimpl ${num}` : `Vol. ${num}`;
}

function titleAndStatus(markdown: string): { title: string; status: string } {
  const lines = markdown.split("\n");
  const titleLine = lines.find((l) => l.startsWith("# ")) ?? "# Untitled";
  const title = titleLine
    .replace(/^#\s+/, "")
    .replace(/^Volume \d+ — /, "")
    .replace(/^refimpl \d+ — /, "")
    .trim();
  const statusLine = lines.find((l) => /^Status:\s/i.test(l.trim())) ?? "";
  const statusMatch = statusLine.match(/Status:\s*([A-Z /]+?)(?:\s*·|$)/i);
  const status = statusMatch ? statusMatch[1].trim() : "CURRENT";
  return { title, status };
}

async function buildCorpus(): Promise<Corpus> {
  const docs: SpecDocMeta[] = [];
  const sections: SpecSection[] = [];
  const markdownBySlug = new Map<string, string>();

  async function loadDir(dir: string, book: "volumes" | "refimpl"): Promise<void> {
    const entries = (await fs.readdir(dir)).filter((f) => f.endsWith(".md")).sort();
    for (const file of entries) {
      const slug = book === "refimpl" ? `refimpl/${file.replace(/\.md$/, "")}` : file.replace(/\.md$/, "");
      const markdown = await fs.readFile(path.join(dir, file), "utf8");
      const { title, status } = titleAndStatus(markdown);
      const orderMatch = file.match(/^(\d{2})-/);
      const meta: SpecDocMeta = {
        slug,
        file,
        volumeLabel: volumeLabelFor(slug),
        title,
        status,
        order: orderMatch ? Number(orderMatch[1]) : 99,
        book
      };
      docs.push(meta);
      markdownBySlug.set(slug, markdown);
      indexSections(meta, markdown, sections);
    }
  }

  await loadDir(SPEC_ROOT, "volumes");
  await loadDir(path.join(SPEC_ROOT, "refimpl"), "refimpl");
  return { docs, sections, markdownBySlug };
}

function indexSections(meta: SpecDocMeta, markdown: string, out: SpecSection[]): void {
  const lines = markdown.split("\n");
  let heading = meta.title;
  let buffer: string[] = [];
  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text.length > 0) {
      out.push({
        slug: meta.slug,
        volumeLabel: meta.volumeLabel,
        docTitle: meta.title,
        heading,
        anchor: anchorOf(heading),
        text
      });
    }
    buffer = [];
  };
  for (const line of lines) {
    const h = line.match(/^#{2,3}\s+(.*)$/);
    if (h) {
      flush();
      heading = h[1].trim();
    } else if (!line.startsWith("# ")) {
      buffer.push(line);
    }
  }
  flush();
}

export async function corpus(): Promise<Corpus> {
  if (!globalCorpus.__nestSpecCorpus) globalCorpus.__nestSpecCorpus = buildCorpus();
  return globalCorpus.__nestSpecCorpus;
}

export async function listSpecDocs(): Promise<SpecDocMeta[]> {
  return (await corpus()).docs;
}

export async function getSpecDocument(slug: string): Promise<SpecDocument | null> {
  const c = await corpus();
  const meta = c.docs.find((d) => d.slug === slug);
  const markdown = c.markdownBySlug.get(slug);
  if (!meta || markdown === undefined) return null;
  return { ...meta, markdown };
}

// ---------------------------------------------------------------------------
// Deterministic evidence retrieval
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(
  "the a an and or of to in is are be as by for with on at it its this that these those from into not no never only one two how what why when where which does do must may shall should can".split(
    " "
  )
);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function excerptAround(text: string, queryTokens: string[], limit = 460): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").replace(/\*\*|`/g, "").replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 40);
  let best = paragraphs[0] ?? text.slice(0, limit);
  let bestScore = -1;
  for (const paragraph of paragraphs) {
    const lower = paragraph.toLowerCase();
    let score = 0;
    for (const token of queryTokens) if (lower.includes(token)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = paragraph;
    }
  }
  if (best.length > limit) best = best.slice(0, limit - 1).replace(/\s+\S*$/, "") + "…";
  return best;
}

// Deterministic retrieval; when `preferSlugs` is given (the session's
// presented spec sources), sections of those documents are boosted so the
// learner's own sources anchor the evidence before the wider corpus.
export async function findEvidence(
  query: string,
  count = 3,
  preferSlugs: readonly string[] = []
): Promise<EvidenceExcerpt[]> {
  const c = await corpus();
  const preferred = new Set(preferSlugs);
  const queryTokens = [...new Set(tokens(query))];
  if (queryTokens.length === 0) return [];
  const scored = c.sections
    .map((section) => {
      const headingLower = section.heading.toLowerCase();
      const bodyLower = section.text.toLowerCase();
      let score = 0;
      for (const token of queryTokens) {
        if (headingLower.includes(token)) score += 3;
        let index = bodyLower.indexOf(token);
        let hits = 0;
        while (index !== -1 && hits < 4) {
          hits += 1;
          index = bodyLower.indexOf(token, index + token.length);
        }
        score += hits;
      }
      if (preferred.has(section.slug)) score *= 2;
      return { section, score };
    })
    .filter((s) => s.score > 2)
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const results: EvidenceExcerpt[] = [];
  for (const { section } of scored) {
    const dedupeKey = `${section.slug}#${section.anchor}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    results.push({
      volume: section.volumeLabel,
      section: section.heading,
      slug: section.slug,
      anchor: section.anchor,
      excerpt: excerptAround(section.text, queryTokens)
    });
    if (results.length >= count) break;
  }
  return results;
}
