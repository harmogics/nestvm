"use client";

import { FormEvent, useState } from "react";

type Block = { id: number; kind: "observation" | "question" | "hypothesis" | "connection"; text: string; evidence: string };
type Move = "deepen" | "connect" | "challenge" | "evidence" | "alternative" | "consequence" | "apply";

const moves: { id: Move; icon: string; label: string; copy: string }[] = [
  { id: "deepen", icon: "↓", label: "Deepen", copy: "Inspect an unresolved part" },
  { id: "connect", icon: "⟷", label: "Connect", copy: "Test a relation" },
  { id: "challenge", icon: "◇", label: "Challenge", copy: "Question an assumption" },
  { id: "evidence", icon: "⌕", label: "Evidence", copy: "Ask what supports it" },
  { id: "alternative", icon: "⊞", label: "Alternative", copy: "Form another account" },
  { id: "consequence", icon: "→", label: "Consequence", copy: "Trace possible effects" },
  { id: "apply", icon: "↗", label: "Apply", copy: "Test in a new condition" }
];

const initial: Block[] = [
  { id: 1, kind: "observation", text: "A team has adopted AI assistance, but its analysis still converges too quickly on familiar explanations.", evidence: "Case brief · observation" },
  { id: 2, kind: "question", text: "Which steps make the team mistake a plausible answer for a well-supported one?", evidence: "Inquiry frontier" },
  { id: 3, kind: "hypothesis", text: "The process lacks explicit moments to challenge assumptions and compare alternatives.", evidence: "Working hypothesis" }
];

export function InductiveCanvas() {
  const [blocks, setBlocks] = useState(initial);
  const [input, setInput] = useState("");
  const [activeMove, setActiveMove] = useState<Move>("deepen");
  const [loading, setLoading] = useState(false);
  const [guideNote, setGuideNote] = useState("The guide is waiting for a direction.");
  const [source, setSource] = useState<"simulation" | "together">("simulation");

  async function send(event?: FormEvent, move = activeMove) {
    event?.preventDefault();
    const value = input.trim() || `Use the ${move} vector on the active inquiry.`;
    setLoading(true);
    try {
      const response = await fetch("/api/guide", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: value, move, context: blocks.map((block) => block.text) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const additions: Block[] = result.blocks.map((block: Omit<Block, "id">, index: number) => ({ ...block, id: Date.now() + index }));
      setBlocks((current) => [...current, ...additions]);
      setGuideNote(result.prompt);
      setSource(result.source);
      setInput("");
    } catch (error) { setGuideNote(error instanceof Error ? error.message : "The guide could not respond."); }
    finally { setLoading(false); }
  }

  function chooseMove(move: Move) { setActiveMove(move); setInput(""); }

  return <div className="shell">
    <header className="topbar">
      <a className="brand" href="#top"><span className="brand-mark">N</span><span>NEST <small>INDUCTIVE CANVAS</small></span></a>
      <div className="top-context"><span>LEARNING MODE</span><strong>AI as a reasoning assistant</strong></div>
      <div className="run-pill"><i /> RUN 04 · IN PROGRESS</div>
    </header>

    <section className="case-strip" id="top">
      <div><span className="eyebrow">CASE GROUND / 01</span><h1>When a plausible answer is not enough</h1><p>Learn to decompose a situation, expose assumptions, and build an evidence-backed explanation with an AI guide.</p></div>
      <div className="objective"><span className="eyebrow">LEARNING OBJECTIVE</span><p>Distinguish an observation, an inference, and a testable causal hypothesis.</p><div className="progress"><b style={{ width: "38%" }} /><span>38% explored</span></div></div>
    </section>

    <div className="workspace">
      <aside className="left-panel">
        <section><span className="eyebrow">EVIDENCE DRAWER</span><h2>Case materials</h2><article className="source-card"><span className="source-index">01</span><div><strong>Team reflection memo</strong><p>Seven analysts describe how AI suggestions enter their work.</p><small>PRIMARY · AVAILABLE</small></div></article><article className="source-card muted"><span className="source-index">02</span><div><strong>Decision log</strong><p>Three decisions accepted without recorded alternatives.</p><small>CASE RECORD · AVAILABLE</small></div></article></section>
        <section className="assumption"><span className="eyebrow">ACTIVE ASSUMPTION</span><p>“More AI output produces better analysis.”</p><button onClick={() => chooseMove("challenge")}>Challenge it <span>→</span></button></section>
      </aside>

      <section className="canvas" aria-label="Inquiry canvas">
        <div className="horizon"><span>RESULT HORIZON</span><div><strong>Defensible explanation</strong><em> · uncertainty · transfer</em></div></div>
        <div className="spine"><div className="node integrated">INTEGRATED UNDERSTANDING<span>Not yet formed</span></div><div className="connector" /></div>
        <div className="frontier-title"><span className="eyebrow">INQUIRY FRONTIER</span><p>Current material is arranged as visible reasoning artefacts—not a hidden model trace.</p></div>
        <div className="blocks">
          {blocks.map((block, index) => <article className={`reason-block ${block.kind}`} key={block.id}><div className="block-meta"><span>{String(index + 1).padStart(2, "0")}</span><b>{block.kind}</b></div><p>{block.text}</p><footer><span className="dot" /> {block.evidence}<button aria-label="Inspect block">↗</button></footer></article>)}
          {loading && <article className="reason-block pending"><div className="block-meta"><span>··</span><b>guide</b></div><p>Forming the next inspectable artefacts…</p></article>}
        </div>
        <div className="frontier-line"><span /> ACTIVE FRONTIER <span /></div>
      </section>

      <aside className="guide-panel">
        <section className="navigator"><div className="orb">✦</div><span className="eyebrow">AI NAVIGATOR</span><h2>Make the next move visible.</h2><p>{guideNote}</p><div className="guide-status"><i /> {source === "together" ? "Together AI connected" : "Local guide simulation"}</div></section>
        <section><span className="eyebrow">WHY THIS MOVE?</span><p className="move-copy">{moves.find((move) => move.id === activeMove)?.copy}. This becomes a recorded learner direction, not an opaque instruction.</p></section>
        <section><span className="eyebrow">TRACE</span><ol className="trace"><li className="done">Case ground</li><li className="done">Observation</li><li className="active">Inquiry</li><li>Integration</li></ol></section>
      </aside>
    </div>

    <section className="move-shelf"><div className="shelf-heading"><span className="eyebrow">VECTOR RAIL</span><p>Choose an intention for the guide. Each choice is saved as part of the inquiry path.</p></div><div className="moves">{moves.map((move) => <button key={move.id} onClick={() => chooseMove(move.id)} className={activeMove === move.id ? "selected" : ""}><span>{move.icon}</span><b>{move.label}</b><small>{move.copy}</small></button>)}</div></section>
    <form className="composer" onSubmit={send}><div className="selected-move">{moves.find((move) => move.id === activeMove)?.label}</div><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="What would you like to clarify or investigate?" aria-label="Inquiry direction" /><button type="submit" disabled={loading}>{loading ? "Working…" : "Send direction"} <span>↗</span></button></form>
  </div>;
}
