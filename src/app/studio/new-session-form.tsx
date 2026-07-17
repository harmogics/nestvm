"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VolumeOption = { slug: string; label: string };

export function NewSessionForm({
  volumes,
  initialSubject
}: {
  volumes: VolumeOption[];
  initialSubject?: string;
}) {
  const router = useRouter();
  const initialIsVolume = Boolean(initialSubject && volumes.some((v) => v.slug === initialSubject));
  const [mode, setMode] = useState<"volume" | "question">(initialIsVolume || !initialSubject ? "volume" : "question");
  const [volumeRef, setVolumeRef] = useState(initialIsVolume ? initialSubject! : volumes[0]?.slug ?? "");
  const [question, setQuestion] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSource(slug: string) {
    setSources((current) =>
      current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]
    );
  }

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const subject =
        mode === "volume" ? { kind: "volume", ref: volumeRef } : { kind: "question", text: question };
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petal: "understand-the-machine", subject, sources })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not open the session.");
      router.push(`/studio/session/${data.sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open the session.");
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="subject-toggle">
        <button type="button" className={mode === "volume" ? "on" : ""} onClick={() => setMode("volume")}>
          A volume of the set
        </button>
        <button type="button" className={mode === "question" ? "on" : ""} onClick={() => setMode("question")}>
          My own question
        </button>
      </div>
      {mode === "volume" ? (
        <div className="field">
          <label htmlFor="volume">Subject volume</label>
          <select id="volume" value={volumeRef} onChange={(e) => setVolumeRef(e.target.value)}>
            {volumes.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="field">
          <label htmlFor="question">Your question about the machine</label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Why is readiness reified as a committed tuple?"
          />
        </div>
      )}
      <details className="sources-picker">
        <summary>
          Sources on the shelf
          {mode === "volume" ? " · the subject volume is included automatically" : ""}
          {sources.length > 0 ? ` · ${sources.length} selected` : ""}
        </summary>
        <div className="sources-list">
          {volumes.map((v) => {
            const isSubject = mode === "volume" && v.slug === volumeRef;
            return (
              <label key={v.slug} className={isSubject ? "muted" : ""}>
                <input
                  type="checkbox"
                  checked={isSubject || sources.includes(v.slug)}
                  disabled={isSubject}
                  onChange={() => toggleSource(v.slug)}
                />
                {v.label}
              </label>
            );
          })}
        </div>
      </details>
      <button
        className="cta terra"
        type="button"
        disabled={busy || (mode === "question" && !question.trim())}
        onClick={start}
      >
        {busy ? "Opening…" : "Open a study session"}
      </button>
      {error && <p className="notice" style={{ margin: "14px 0 0" }}>{error}</p>}
      <p className="contract-note">
        Petal: understand-the-machine · result contract: defended-articulation@1 — a statement you
        are prepared to defend, with evidence references and preserved open questions. Attested by
        you; quiescence is never presented as completion.
      </p>
    </div>
  );
}
