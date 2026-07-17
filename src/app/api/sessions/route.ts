import { NextResponse } from "next/server";
import { listSpecDocs } from "@/corpus/corpus";
import { createSession, commit, fact, listSessions, mintSessionId } from "@/nest/wave/store";
import type { ResourceRef, SessionMeta, SessionSubject, WaveEmission } from "@/nest/wave/envelope";

export async function GET() {
  const sessions = await listSessions();
  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  let body: {
    petal?: string;
    subject?: { kind?: string; ref?: string; text?: string };
    sources?: string[]; // spec volume slugs declared on the session shelf
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const docs = await listSpecDocs();
  const petal = body.petal?.trim() || "understand-the-machine";
  let subject: SessionSubject;
  if (body.subject?.kind === "volume" && body.subject.ref) {
    const doc = docs.find((d) => d.slug === body.subject?.ref);
    if (!doc) return NextResponse.json({ error: `Unknown volume ref "${body.subject.ref}".` }, { status: 400 });
    subject = { kind: "volume", ref: doc.slug, title: `${doc.volumeLabel} — ${doc.title}` };
  } else if (body.subject?.kind === "question" && body.subject.text?.trim()) {
    subject = { kind: "question", text: body.subject.text.trim() };
  } else {
    return NextResponse.json(
      { error: "A subject is required: {kind:'volume', ref} or {kind:'question', text}." },
      { status: 400 }
    );
  }

  // The opening gesture declares the session's source shelf: the subject
  // volume (when the subject is a volume) plus every valid selected volume.
  const shelfSlugs: string[] = [];
  if (subject.kind === "volume") shelfSlugs.push(subject.ref);
  for (const slug of body.sources ?? []) {
    if (typeof slug !== "string") continue;
    if (shelfSlugs.includes(slug)) continue;
    if (!docs.some((d) => d.slug === slug)) {
      return NextResponse.json({ error: `Unknown source volume "${slug}".` }, { status: 400 });
    }
    shelfSlugs.push(slug);
  }

  const meta: SessionMeta = {
    id: mintSessionId(),
    createdAt: new Date().toISOString(),
    petal,
    subject,
    resultContract: "defended-articulation@1",
    status: "open",
    class: "simulated",
    tuples: 0
  };
  const record = await createSession(meta);
  const emissions: WaveEmission[] = [
    fact(meta.id, "learning.session.opened", {
      sessionId: meta.id,
      petal,
      subject,
      resultContract: meta.resultContract,
      actor: "learner",
      class: "simulated"
    })
  ];
  for (const slug of shelfSlugs) {
    const doc = docs.find((d) => d.slug === slug)!;
    const resource: ResourceRef = {
      store: "spec",
      ref: slug,
      title: `${doc.volumeLabel} — ${doc.title}`,
      excerpt: `Status ${doc.status}; a volume of the Nest Runtime Specification Set.`
    };
    emissions.push(fact(meta.id, "learning.source.declared", { resource, actor: "learner" }));
  }
  await commit(record, emissions);
  return NextResponse.json({ sessionId: meta.id }, { status: 201 });
}
