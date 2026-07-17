import { listSpecDocs } from "@/corpus/corpus";

function statusClass(status: string): string {
  const s = status.toUpperCase();
  if (s.includes("PROPOSED")) return "proposed";
  if (s.includes("SEED")) return "seed";
  if (s.includes("DECLARED")) return "declared";
  return "current";
}

export default async function SpecIndexPage() {
  const docs = await listSpecDocs();
  const volumes = docs.filter((d) => d.book === "volumes");
  const refimpl = docs.filter((d) => d.book === "refimpl");

  return (
    <main>
      <section className="page-head">
        <span className="eyebrow">Reading map</span>
        <h1>The Nest Runtime Specification Set</h1>
        <p>
          A complete developer specification of the wave-log virtual machine, written in the manner
          of a processor architecture manual and deliberately self-contained. Volumes 01–03 orient;
          04–07 are the implementer&rsquo;s reference; 08 defines what a machine must do; 09–10
          serve authors; 11–13 fix how the machine grows; 14 defines conformance; 15 is the
          vocabulary.
        </p>
      </section>

      <div className="spec-map">
        <div className="map-block">
          <h2>Volumes</h2>
          <p>
            Status labels keep the snapshot honest: CURRENT is working behaviour, DECLARED is
            parsed but not enforced, PROPOSED is agreed direction, SEED is conceptual.
          </p>
          <table className="volume-table">
            <tbody>
              {volumes.map((doc) => (
                <tr key={doc.slug}>
                  <td className="vol">{doc.volumeLabel}</td>
                  <td className="ttl">
                    <a href={`/spec/${doc.slug}`}>{doc.title}</a>
                  </td>
                  <td className="st">
                    <span className={`status-chip ${statusClass(doc.status)}`}>{doc.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="map-block">
          <h2>The refimpl book</h2>
          <p>
            Eight chapters describing the reference implementation unit by unit — the worked
            existence proof beside the normative volumes.
          </p>
          <table className="volume-table">
            <tbody>
              {refimpl.map((doc) => (
                <tr key={doc.slug}>
                  <td className="vol">{doc.volumeLabel}</td>
                  <td className="ttl">
                    <a href={`/spec/${doc.slug}`}>{doc.title}</a>
                  </td>
                  <td className="st">
                    <span className={`status-chip ${statusClass(doc.status)}`}>{doc.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
