// Server-side session store: an append-only tuple log per session, held in
// memory and mirrored to var/sessions/<id>.jsonl (one tuple per line, offset
// order — the persisted wire format of Vol. 03 §6). The JSONL mirror is the
// durable history; the in-memory record is a cache. Restart replays the file.

import { promises as fs } from "fs";
import path from "path";
import type { SessionMeta, WaveEmission, WaveTuple } from "./envelope";

const ROOT = path.join(process.cwd(), "var", "sessions");

type SessionRecord = {
  meta: SessionMeta;
  tuples: WaveTuple[];
};

type Store = Map<string, SessionRecord>;

const globalStore = globalThis as unknown as { __nestStudySessions?: Store };

function store(): Store {
  if (!globalStore.__nestStudySessions) globalStore.__nestStudySessions = new Map();
  return globalStore.__nestStudySessions;
}

async function ensureRoot(): Promise<void> {
  await fs.mkdir(ROOT, { recursive: true });
}

function logPath(id: string): string {
  return path.join(ROOT, `${id}.jsonl`);
}

function metaPath(id: string): string {
  return path.join(ROOT, `${id}.meta.json`);
}

function safeId(id: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/i.test(id);
}

export function mintSessionId(): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `s-${stamp}-${rand}`;
}

export async function createSession(meta: SessionMeta): Promise<SessionRecord> {
  await ensureRoot();
  const record: SessionRecord = { meta, tuples: [] };
  store().set(meta.id, record);
  await fs.writeFile(metaPath(meta.id), JSON.stringify(meta, null, 2), "utf8");
  await fs.writeFile(logPath(meta.id), "", "utf8");
  return record;
}

export async function loadSession(id: string): Promise<SessionRecord | null> {
  if (!safeId(id)) return null;
  const cached = store().get(id);
  if (cached) return cached;
  try {
    const [metaRaw, logRaw] = await Promise.all([
      fs.readFile(metaPath(id), "utf8"),
      fs.readFile(logPath(id), "utf8")
    ]);
    const meta = JSON.parse(metaRaw) as SessionMeta;
    const tuples: WaveTuple[] = logRaw
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as WaveTuple);
    meta.tuples = tuples.length;
    const record: SessionRecord = { meta, tuples };
    store().set(id, record);
    return record;
  } catch {
    return null;
  }
}

export async function listSessions(): Promise<SessionMeta[]> {
  await ensureRoot();
  const entries = await fs.readdir(ROOT);
  const metas: SessionMeta[] = [];
  for (const entry of entries) {
    if (!entry.endsWith(".meta.json")) continue;
    try {
      const raw = await fs.readFile(path.join(ROOT, entry), "utf8");
      metas.push(JSON.parse(raw) as SessionMeta);
    } catch {
      // an unreadable sidecar degrades to omission, never to a crash
    }
  }
  metas.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return metas;
}

// Appends emissions as committed tuples: offsets assigned here and only here,
// the batch written contiguously in returned order (Vol. 02 §7 batch rule).
export async function commit(
  record: SessionRecord,
  emissions: readonly WaveEmission[]
): Promise<WaveTuple[]> {
  const committed: WaveTuple[] = [];
  for (const emission of emissions) {
    const tuple: WaveTuple = { ...emission, offset: record.tuples.length } as WaveTuple;
    record.tuples.push(tuple);
    committed.push(tuple);
  }
  if (committed.length > 0) {
    const lines = committed.map((t) => JSON.stringify(t)).join("\n") + "\n";
    await fs.appendFile(logPath(record.meta.id), lines, "utf8");
    record.meta.tuples = record.tuples.length;
    await fs.writeFile(metaPath(record.meta.id), JSON.stringify(record.meta, null, 2), "utf8");
  }
  return committed;
}

export async function updateMeta(record: SessionRecord, patch: Partial<SessionMeta>): Promise<void> {
  Object.assign(record.meta, patch);
  await fs.writeFile(metaPath(record.meta.id), JSON.stringify(record.meta, null, 2), "utf8");
}

// Helper for building domain facts on the session lane.
export function fact(
  key: string,
  factType: string,
  data: Record<string, unknown>
): WaveEmission {
  return { kind: "domain.fact", key, payload: { factType, data } };
}

export function readiness(key: string, knotId: string, understanding: unknown): WaveEmission {
  return { kind: "sys.knot.ready", key, payload: { knotId, understanding } };
}

export type { SessionRecord };
