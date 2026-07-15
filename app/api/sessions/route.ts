import { NextResponse } from "next/server";
import { listSpecDocs } from "@/lib/corpus";
import { createSession, commit, fact, listSessions, mintSessionId } from "@/lib/store";
import type { SessionMeta, SessionSubject } from "@/lib/types";

export async function GET() {
  const sessions = await listSessions();
  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  let body: { petal?: string; subject?: { kind?: string; ref?: string; text?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const petal = body.petal?.trim() || "understand-the-machine";
  let subject: SessionSubject;
  if (body.subject?.kind === "volume" && body.subject.ref) {
    const docs = await listSpecDocs();
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
  await commit(record, [
    fact(meta.id, "learning.session.opened", {
      sessionId: meta.id,
      petal,
      subject,
      resultContract: meta.resultContract,
      actor: "learner",
      class: "simulated"
    })
  ]);
  return NextResponse.json({ sessionId: meta.id }, { status: 201 });
}
