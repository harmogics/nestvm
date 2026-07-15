import { notFound } from "next/navigation";
import { getSpecDocument, listSpecDocs } from "@/lib/corpus";
import { renderMarkdown } from "@/lib/markdown";

function statusClass(status: string): string {
  const s = status.toUpperCase();
  if (s.includes("PROPOSED")) return "proposed";
  if (s.includes("SEED")) return "seed";
  if (s.includes("DECLARED")) return "declared";
  return "current";
}

export default async function SpecDocumentPage(context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const joined = slug.join("/");
  const doc = await getSpecDocument(joined);
  if (!doc) notFound();

  const docs = await listSpecDocs();
  const sameBook = docs.filter((d) => d.book === doc.book);
  const index = sameBook.findIndex((d) => d.slug === doc.slug);
  const previous = index > 0 ? sameBook[index - 1] : null;
  const next = index < sameBook.length - 1 ? sameBook[index + 1] : null;

  return (
    <main className="spec-article">
      <article>
        <div className="article-meta">
          <a href="/spec">Reading map</a>
          <span>/</span>
          <span>{doc.volumeLabel}</span>
          <span className={`status-chip ${statusClass(doc.status)}`}>{doc.status}</span>
        </div>
        <div className="prose">{renderMarkdown(doc.markdown)}</div>
        <div className="article-actions">
          <a className="cta terra" href={`/studio?subject=${encodeURIComponent(doc.slug)}`}>
            Study this volume on the workbench
          </a>
        </div>
        <nav className="article-nav">
          <span>{previous ? <a href={`/spec/${previous.slug}`}>← {previous.volumeLabel}: {previous.title}</a> : null}</span>
          <span>{next ? <a href={`/spec/${next.slug}`}>{next.volumeLabel}: {next.title} →</a> : null}</span>
        </nav>
      </article>
    </main>
  );
}
