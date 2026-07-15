import { NextResponse } from "next/server";

export type GuideRequest = { input: string; move?: string; context?: string[] };

const system = `You are an AI learning guide in an inductive reasoning canvas. Return only JSON with this exact shape: {"title":string,"purpose":string,"blocks":[{"kind":"observation"|"question"|"hypothesis"|"connection","text":string,"evidence":string}],"prompt":string}. Be concise, evidence-aware, and never claim hidden chain-of-thought. Present inspectable reasoning artefacts, not private reasoning.`;

function fallback(input: string, move = "deepen") {
  const focus = input.trim() || "the current case";
  return {
    title: `${move[0].toUpperCase()}${move.slice(1)} the inquiry`,
    purpose: `Turn “${focus}” into inspectable observations and a testable next question.`,
    blocks: [
      { kind: "observation", text: `The request identifies a meaningful area of inquiry: ${focus}.`, evidence: "Learner direction" },
      { kind: "question", text: "What specific change, pattern, or decision would count as evidence here?", evidence: "Open obligation" },
      { kind: "hypothesis", text: "A useful explanation may depend on conditions that are not yet named.", evidence: "Candidate interpretation" }
    ],
    prompt: "Choose a vector or add a short qualification to continue the inquiry."
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as GuideRequest;
  if (!body.input?.trim()) return NextResponse.json({ error: "Input is required." }, { status: 400 });
  const key = process.env.TOGETHER_API_KEY;
  if (!key) return NextResponse.json({ ...fallback(body.input, body.move), source: "simulation" });
  try {
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo", temperature: 0.35, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: `Move: ${body.move || "clarify"}\nLearner input: ${body.input}\nVisible context: ${(body.context || []).join(" | ")}` }] })
    });
    if (!response.ok) throw new Error("Together request failed");
    const data = await response.json();
    return NextResponse.json({ ...JSON.parse(data.choices[0].message.content), source: "together" });
  } catch {
    return NextResponse.json({ ...fallback(body.input, body.move), source: "simulation" });
  }
}
