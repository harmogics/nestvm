// The strip view of the session-archive module. A read affordance, styled
// lighter than the commit buttons around it (reads sit lighter than
// commits — HUID 04 §5); no dialog — the gesture is the download itself.

export function SessionArchiveChip({ sessionId }: { sessionId: string }) {
  return (
    <a
      href={`/api/sessions/${sessionId}/archive`}
      download={`${sessionId}.jsonl`}
      title={
        "Download this session's wave log (.jsonl, the wire format of Vol. 03 §6). " +
        "Importing it on the workbench start page replays and continues the session. " +
        "A recording is a private history, not a publication."
      }
      style={{ font: "inherit", color: "var(--muted)" }}
    >
      Archive ↓
    </a>
  );
}
