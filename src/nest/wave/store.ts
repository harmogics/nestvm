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
  logBytes: number; // size of the JSONL mirror this cache reflects
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
  const record: SessionRecord = { meta, tuples: [], logBytes: 0 };
  store().set(meta.id, record);
  await fs.writeFile(metaPath(meta.id), JSON.stringify(meta, null, 2), "utf8");
  await fs.writeFile(logPath(meta.id), "", "utf8");
  return record;
}

export async function loadSession(id: string): Promise<SessionRecord | null> {
  if (!safeId(id)) return null;
  const cached = store().get(id);
  if (cached) {
    // The in-memory record is a cache of the JSONL mirror, never a second
    // truth: revalidate against the file so a batch appended by another
    // process (a second workbench on the same store) becomes visible.
    // Reloading is reading (Vol. 03 §6.4) — nothing is re-discharged.
    try {
      const stat = await fs.stat(logPath(id));
      if (stat.size === cached.logBytes) return cached;
    } catch {
      return cached; // file momentarily unreadable — the cache stands
    }
  }
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
    const record: SessionRecord = { meta, tuples, logBytes: Buffer.byteLength(logRaw, "utf8") };
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
    record.logBytes += Buffer.byteLength(lines, "utf8");
    record.meta.tuples = record.tuples.length;
    await fs.writeFile(metaPath(record.meta.id), JSON.stringify(record.meta, null, 2), "utf8");
    notifyCommit(record.meta.id, committed);
  }
  return committed;
}

// ---------------------------------------------------------------------------
// The commit hook — the mirror's second half (Vol. 08 §1.2: one sink feeds
// the persisted store and the live listeners). Listeners are reading-side
// infrastructure (panel projectors, later the SSE feed): they receive the
// committed batch read-only, return nothing, and a throwing listener never
// fails a commit (observers must not alter machine behaviour, Vol. 02
// §3.4). Registration of imported history (createSessionFromLog) does not
// notify — projectors rebuild lazily by replay.
// ---------------------------------------------------------------------------

export type CommitListener = (sessionId: string, tuples: readonly WaveTuple[]) => void;

const globalListeners = globalThis as unknown as { __nestCommitListeners?: Set<CommitListener> };

function commitListeners(): Set<CommitListener> {
  if (!globalListeners.__nestCommitListeners) globalListeners.__nestCommitListeners = new Set();
  return globalListeners.__nestCommitListeners;
}

export function onCommit(listener: CommitListener): () => void {
  commitListeners().add(listener);
  return () => commitListeners().delete(listener);
}

function notifyCommit(sessionId: string, tuples: readonly WaveTuple[]): void {
  for (const listener of commitListeners()) {
    try {
      listener(sessionId, tuples);
    } catch {
      // an observer defect never fails the commit
    }
  }
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

// Serialise a committed log in the reference field order of Vol. 03 §6
// (kind, key, payload, offset) — one tuple per line, the archive format.
export function serialiseLog(tuples: readonly WaveTuple[]): string {
  return (
    tuples
      .map((t) => JSON.stringify({ kind: t.kind, key: t.key, payload: t.payload, offset: t.offset }))
      .join("\n") + "\n"
  );
}

// Parse and validate a persisted log: JSON per line, envelope fields present,
// offsets dense from 0 (Vol. 03 §6.2 — a reader may verify and must not
// renumber). Returns the tuples or one honest refusal reason.
export function parseLog(text: string): { tuples: WaveTuple[] } | { error: string } {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { error: "The file carries no tuples." };
  const tuples: WaveTuple[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(lines[i]);
    } catch {
      return { error: `Line ${i + 1} is not valid JSON.` };
    }
    const t = parsed as Partial<WaveTuple>;
    if (typeof t.kind !== "string" || t.payload === undefined || (t.key !== null && typeof t.key !== "string")) {
      return { error: `Line ${i + 1} is not a wave tuple (kind, key, payload, offset).` };
    }
    if (t.offset !== i) {
      return { error: `Offsets are not dense from 0: line ${i + 1} carries offset ${String(t.offset)}.` };
    }
    tuples.push({ kind: t.kind, key: t.key ?? null, payload: t.payload, offset: i });
  }
  return { tuples };
}

// Register an imported session: the log enters verbatim — never re-keyed,
// never renumbered, never re-discharged (Vol. 08 §9). A collision refuses
// honestly: correction is a new act, never an overwrite.
export async function createSessionFromLog(
  meta: SessionMeta,
  tuples: readonly WaveTuple[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!safeId(meta.id)) return { ok: false, error: `"${meta.id}" is not a safe session id.` };
  await ensureRoot();
  if (store().has(meta.id)) {
    return { ok: false, error: `Session ${meta.id} already exists on this workbench.` };
  }
  try {
    await fs.access(metaPath(meta.id));
    return { ok: false, error: `Session ${meta.id} already exists on this workbench.` };
  } catch {
    // absent — free to register
  }
  const serialised = serialiseLog(tuples);
  const record: SessionRecord = {
    meta,
    tuples: [...tuples],
    logBytes: Buffer.byteLength(serialised, "utf8")
  };
  await fs.writeFile(logPath(meta.id), serialised, "utf8");
  await fs.writeFile(metaPath(meta.id), JSON.stringify(meta, null, 2), "utf8");
  store().set(meta.id, record);
  return { ok: true };
}

export type { SessionRecord };
