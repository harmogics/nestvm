// The simulated semantic side of the machine: three bounded tasks discharged
// to Together AI when a key is configured, with deterministic fallbacks so the
// workbench runs credibly without one. Declared form, supplied content
// (Vol. 01 §2.5): every task fixes its JSON result shape in advance; the
// model fills content only. British English throughout.

type GuideSource = "together" | "simulation";

// The agent's authoring output: a bounded scene plan. The model supplies
// content only; lib/machine.ts expands the plan through the declared template
// into sys.knot.defined / sys.descriptor.defined records and head facts.
export type ScenePlan = {
  title: string;
  purpose: string;
  knots: { question: string; angle: string; threshold_grade: number; budget: number }[];
  close_instruction: string;
};

export type WindResult = {
  state: string;
  grade: number;
  reasoning: string;
};

export type FoldResult = {
  statement: string;
  contributions: { source: string; note: string }[];
  openQuestions: string[];
  uncertainties: string[];
};

export type Guided<T> = { result: T; source: GuideSource };

const TOGETHER_URL = "https://api.together.xyz/v1/chat/completions";

async function callTogether(system: string, user: string): Promise<unknown | null> {
  const key = process.env.TOGETHER_API_KEY;
  if (!key) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    const response = await fetch(TOGETHER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        temperature: 0.3,
        max_tokens: 1400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function clampGrade(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function focusPhrase(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, " ");
  return cleaned.length > 90 ? cleaned.slice(0, 89).replace(/\s+\S*$/, "") + "…" : cleaned;
}

// ---------------------------------------------------------------------------
// authorScene — the internal simulating agent playing the planner service:
// it authors the content of a bounded child figure (questions, angles,
// thresholds, budgets, closing instruction). The declared form — record
// shapes, ids, collect rules, return sockets, emit targets — is fixed by the
// template in lib/machine.ts and is never the model's to change.
// ---------------------------------------------------------------------------

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function authorScene(input: {
  subjectLabel: string;
  rootText: string;
  emphasis?: string;
  focusQuestion?: string;
  focusState?: string;
  sources?: string[];
}): Promise<Guided<ScenePlan>> {
  const system = `You are the planner service of a study workbench for the Nest virtual machine specification. Your task is one bounded act of semantic authoring: unfold the given material into a scene of 3 or 4 question knots and one closing instruction. A knot's question is the test an adequate understanding must pass — not a task, not a heading. Write British English. Return only JSON, exactly this shape:
{"title": string, "purpose": string, "knots": [{"question": string, "angle": string, "threshold_grade": number, "budget": number}], "close_instruction": string}
Constraints: "title" names the scene in the learner's own domain language (max 9 words). "purpose" is one sentence on what this scene settles. "angle" is 2-5 words naming the direction of perception (e.g. "failure behaviour", "load-bearing rule"). "threshold_grade" is the readiness bar in [0.55, 0.85] — set it higher for questions where a shallow answer is dangerous. "budget" is the winding budget in [2, 6]. "close_instruction" tells the closing service how to integrate the ripened understandings, seams preserved. You author content only; the record forms, sockets and emit targets are fixed by the machine. Never request or reveal hidden chain-of-thought.`;
  const user = [
    `Subject under study: ${input.subjectLabel}`,
    input.focusQuestion
      ? `The learner deepens this knot: ${input.focusQuestion}\nIts current understanding: ${input.focusState || "(none yet)"}`
      : `The learner's root material: ${input.rootText}`,
    input.emphasis?.trim() ? `The learner's emphasis for this unfold: ${input.emphasis.trim()}` : "",
    input.sources && input.sources.length > 0
      ? `Released values available as sources:\n${input.sources.map((s) => `- ${s}`).join("\n")}`
      : "",
    `Author the scene plan.`
  ]
    .filter(Boolean)
    .join("\n");

  const raw = (await callTogether(system, user)) as ScenePlan | null;
  if (raw && Array.isArray(raw.knots) && raw.knots.length > 0 && typeof raw.title === "string") {
    return {
      source: "together",
      result: {
        title: String(raw.title || "Unfolded inquiry").trim(),
        purpose: String(raw.purpose || "").trim(),
        knots: raw.knots
          .slice(0, 4)
          .filter((k) => String(k.question || "").trim().length > 0)
          .map((k) => ({
            question: String(k.question).trim(),
            angle: String(k.angle || "angle").trim(),
            threshold_grade: clampNumber(k.threshold_grade, 0.55, 0.85, 0.7),
            budget: Math.round(clampNumber(k.budget, 2, 6, 4))
          })),
        close_instruction:
          String(raw.close_instruction || "").trim() ||
          "Integrate the ripened understandings into one seam-preserving articulation."
      }
    };
  }

  const focus = focusPhrase(input.focusQuestion ?? input.emphasis?.trim() ?? input.subjectLabel);
  return {
    source: "simulation",
    result: {
      title: `Understanding: ${focus}`,
      purpose: `Settle what "${focus}" means, which rules govern it, and how it behaves at its boundaries.`,
      knots: [
        { question: `What exactly is meant by "${focus}", and which problem does it exist to solve?`, angle: "purpose and meaning", threshold_grade: 0.7, budget: 4 },
        { question: `Which normative rules or invariants govern it, and where are they stated?`, angle: "load-bearing rules", threshold_grade: 0.7, budget: 4 },
        { question: `What happens when it fails, stalls, or is absent — what does the honest failure look like?`, angle: "failure behaviour", threshold_grade: 0.7, budget: 4 },
        { question: `How does it connect to the rest of the machine — what feeds it and what consumes it?`, angle: "connections", threshold_grade: 0.7, budget: 4 }
      ],
      close_instruction: "Integrate the ripened understandings into one seam-preserving articulation that answers the scene's purpose."
    }
  };
}

// ---------------------------------------------------------------------------
// wind — integrate labelled deltas into a knot's understanding (Vol. 07 §4.1)
// ---------------------------------------------------------------------------

export async function windUnderstanding(input: {
  questions: string[];
  state: string;
  priorGrade: number;
  deltas: string[];
}): Promise<Guided<WindResult>> {
  const system = `You are the integration service of a study workbench (the winding protocol of the Nest VM, Vol. 07 §4.1). Rewrite STATE into one updated, self-contained integrated understanding that absorbs the DELTAS and addresses the QUESTIONS. Preserve seams: keep it visible which part came from the learner ([answer]/[challenge]), from the specification ([evidence]), or from a child scene ([return]). Assess sufficiency honestly with a grade in [0,1] — fluency does not raise the grade; grounding and directness do. Write British English. Return only JSON: {"state": string, "grade": number, "reasoning": string}. "reasoning" is 1-2 inspectable sentences on what changed and what is still missing; no hidden chain-of-thought.`;
  const user = [
    `QUESTIONS:\n${input.questions.map((q) => `- ${q}`).join("\n")}`,
    `STATE (previous integrated understanding):\n${input.state || "(empty)"}`,
    `DELTAS (new material, labelled by origin):\n${input.deltas.map((d) => `- ${d}`).join("\n")}`
  ].join("\n\n");

  const raw = (await callTogether(system, user)) as WindResult | null;
  if (raw && typeof raw.state === "string" && raw.state.trim()) {
    return {
      source: "together",
      result: {
        state: raw.state.trim(),
        grade: clampGrade(raw.grade),
        reasoning: String(raw.reasoning || "").trim()
      }
    };
  }

  // Deterministic integrator: merge deltas into the state with seams kept,
  // grade grown by origin weights (the demonstration heuristic of this shell).
  let increment = 0;
  for (const delta of input.deltas) {
    if (delta.startsWith("[answer]")) increment += 0.34;
    else if (delta.startsWith("[evidence]")) increment += 0.15;
    else if (delta.startsWith("[return]")) increment += 0.36;
    else if (delta.startsWith("[challenge]")) increment += 0.2;
    else increment += 0.1;
  }
  const base = input.state ? input.priorGrade : 0.38;
  const grade = Math.min(0.94, base + increment);
  const merged = [
    input.state,
    ...input.deltas.map((d) => (d.length > 380 ? d.slice(0, 379).replace(/\s+\S*$/, "") + "…" : d))
  ]
    .filter(Boolean)
    .join("\n");
  return {
    source: "simulation",
    result: {
      state: merged,
      grade,
      reasoning: `Absorbed ${input.deltas.length} delta(s); grade reflects origin weights of the deterministic integrator.`
    }
  };
}

// ---------------------------------------------------------------------------
// fold — form the scene's integration candidate with a contribution map
// ---------------------------------------------------------------------------

export async function foldIntegration(input: {
  title: string;
  purpose: string;
  rootText: string;
  entries: { name: string; kind: string; text: string; grade?: number }[];
}): Promise<Guided<FoldResult>> {
  const system = `You are the integration service of a study workbench. Form one seam-preserving integration over the gathered scope: a concise defended articulation (3-6 sentences) that answers the scene's purpose. No laundering: every contribution must remain addressable in the contribution map. Keep genuinely open questions open — an honest gap is a valid result. Write British English. Return only JSON: {"statement": string, "contributions": [{"source": string, "note": string}], "openQuestions": [string], "uncertainties": [string]}.`;
  const user = [
    `Scene: ${input.title}`,
    `Purpose: ${input.purpose}`,
    `Root material: ${input.rootText}`,
    `Gathered scope:`,
    ...input.entries.map(
      (e) => `- [${e.kind}] ${e.name}${e.grade !== undefined ? ` (grade ${e.grade.toFixed(2)})` : ""}:\n  ${e.text.replace(/\n/g, "\n  ")}`
    )
  ].join("\n");

  const raw = (await callTogether(system, user)) as FoldResult | null;
  if (raw && typeof raw.statement === "string" && raw.statement.trim()) {
    return {
      source: "together",
      result: {
        statement: raw.statement.trim(),
        contributions: Array.isArray(raw.contributions)
          ? raw.contributions.map((c) => ({ source: String(c.source || ""), note: String(c.note || "") }))
          : [],
        openQuestions: Array.isArray(raw.openQuestions) ? raw.openQuestions.map(String) : [],
        uncertainties: Array.isArray(raw.uncertainties) ? raw.uncertainties.map(String) : []
      }
    };
  }

  const clip = (text: string, limit: number) => {
    const flat = text.replace(/\s+/g, " ").trim();
    return flat.length > limit ? flat.slice(0, limit - 1).replace(/\s+\S*$/, "") + "…" : flat;
  };
  const ripened = input.entries.filter((e) => (e.grade ?? 1) >= 0.7 || e.kind === "returned value");
  const weak = input.entries.filter(
    (e) => (e.grade ?? 1) < 0.7 && e.kind !== "returned value" && e.kind !== "explicitly unknown"
  );
  return {
    source: "simulation",
    result: {
      statement: [`${input.title}.`, ...ripened.map((e) => clip(e.text, 300))].join(" "),
      contributions: input.entries.map((e) => ({
        source: `${e.name} (${e.kind})`,
        note: clip(e.text, 150)
      })),
      openQuestions: weak.map((e) => e.name),
      uncertainties: []
    }
  };
}
