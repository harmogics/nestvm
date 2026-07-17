import { ImportSession } from "./import-session";
import { NewSessionForm } from "./new-session-form";
import { listSpecDocs } from "@/corpus/corpus";
import { listSessions } from "@/nest/wave/store";

export const dynamic = "force-dynamic";

export default async function StudioIndexPage(context: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await context.searchParams;
  const [docs, sessions] = await Promise.all([listSpecDocs(), listSessions()]);
  const volumes = docs.map((d) => ({ slug: d.slug, label: `${d.volumeLabel} — ${d.title}` }));

  return (
    <main>
      <section className="page-head">
        <span className="eyebrow">Study workbench · Nest Education seed (Vol. 13 §5)</span>
        <h1>Study the machine on the machine</h1>
        <p>
          A session is a pass over the semantic field: your words stay yours, the guide only
          proposes, every gesture is committed to an append-only log, and the trace of your own
          study is itself a wave log you can read with the concepts you are studying.
        </p>
      </section>

      <div className="studio-index">
        <div className="petal-card">
          <span className="eyebrow">New session</span>
          <h2>Understand the machine</h2>
          <p>
            Choose a subject: a volume of the specification set, or your own question about the
            machine. Your first words become root material — nothing activates until you choose an
            operator.
          </p>
          <NewSessionForm volumes={volumes} initialSubject={subject} />
        </div>

        <div className="session-list">
          <h2>Sessions</h2>
          {sessions.length === 0 && (
            <p style={{ color: "var(--muted)", font: "400 13.5px/1.6 var(--prose)" }}>
              No sessions yet. Open the first one — the machine&rsquo;s first study subject is the
              machine itself.
            </p>
          )}
          {sessions.map((s) => (
            <a className="session-item" key={s.id} href={`/studio/session/${s.id}`}>
              <b>{s.subject.kind === "volume" ? s.subject.title : s.subject.text}</b>
              <small className={s.status === "completed" ? "done" : ""}>
                {s.status === "completed" ? "Completed" : "Open"} · {s.tuples} tuples ·{" "}
                {new Date(s.createdAt).toLocaleString("en-GB")}
              </small>
            </a>
          ))}
          <ImportSession />
        </div>
      </div>
    </main>
  );
}
