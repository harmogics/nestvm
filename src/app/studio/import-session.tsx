"use client";

// Registry chrome, not a HUID module: importing a recording acts before a
// session's feed exists (ADR-008 Decision 2). One native file input, inline
// honest refusals, no dialogs (HUID 04).

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ImportSession() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function importFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const text = await file.text();
      const response = await fetch("/api/sessions/import", {
        method: "POST",
        headers: { "Content-Type": "application/jsonl" },
        body: text
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "The recording was not accepted.");
      router.push(`/studio/session/${data.sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The recording was not accepted.");
      setBusy(false);
    }
  }

  return (
    <div className="import-session">
      <h2>Continue from a recording</h2>
      <p>
        A session archived as a <code>.jsonl</code> wave log replays here and continues live —
        replay is reading; nothing is re-committed or re-discharged. A recording is a private
        history, not a publication.
      </p>
      <label className="import-drop">
        <input
          type="file"
          accept=".jsonl,application/jsonl,text/plain"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importFile(file);
            event.target.value = "";
          }}
        />
        {busy ? "Replaying the recording…" : "Choose a .jsonl recording"}
      </label>
      {error && (
        <p className="notice" style={{ margin: "12px 0 0" }}>
          The machine refused honestly: {error}
        </p>
      )}
    </div>
  );
}
