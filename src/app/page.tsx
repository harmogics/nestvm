const FIGURE = String.raw`            topology (directing structures)
            knots · binds · controller claims
                     ▲
                    / \
    re-authored    /   \    declared
    from below    /     \   outward claims
                 /       \
                ▼         ▼
  inner return:            outer return:
  emissions committed      intentions discharged
  and wound into           through the membrane,
  further understanding    re-entering as facts
                \         /
                 \       /
                  \     /
               the wave log
          (one append-only truth)`;

export default function Page() {
  return (
    <main>
      <section className="hero">
        <div className="hero-grid">
          <div>
            <span className="eyebrow">Nest runtime specification set · wave-log virtual machine</span>
            <h1>The machine that studies itself.</h1>
            <p className="lede">
              The Nest runtime is a virtual machine for accumulating and integrating understanding.
              Its only memory is an append-only log of immutable tuples; its units are activation
              knots that wind facts into understanding, bind descriptors that gather, judge and
              publish, and output controllers on the membrane to the world. Read the specification —
              then study it on the workbench the specification itself describes.
            </p>
            <div className="cta-row">
              <a className="cta" href="/spec">
                Read the specification
              </a>
              <a className="cta terra" href="/studio">
                Study the machine
              </a>
            </div>
            <p className="hero-note">16 volumes · 8 refimpl chapters · every study session is itself a wave log</p>
          </div>
          <figure className="figure-plate">
            <span className="eyebrow">Fig. 01 — circle and triangle (Vol. 01 §3)</span>
            <pre>{FIGURE}</pre>
            <figcaption>The two corners differ in radius, not in kind: both are returns to the log.</figcaption>
          </figure>
        </div>
      </section>

      <section className="stations">
        <span className="eyebrow">Stations of execution · Vol. 01 §4</span>
        <h2>Three stations, one competence each</h2>
        <p className="section-intro">
          Every committed tuple is received by stations with strictly separated competences. The
          separation is load-bearing: it is what keeps understanding attributable, judgement
          explicit, and the world behind a membrane.
        </p>
        <div className="station-grid">
          <article className="station">
            <span className="eyebrow">Accumulate</span>
            <h3>Activation knot</h3>
            <p>
              Matches facts, winds them into wound state, and tests readiness against its declared
              angle of perception. Understanding grows here — one clew per attribution lane.
            </p>
            <p className="denied">must never: publish for others · judge · touch the world</p>
          </article>
          <article className="station">
            <span className="eyebrow">Gather · judge · publish</span>
            <h3>Bind descriptor</h3>
            <p>
              Woken by readiness, it gathers named understandings into a bound scope, judges them
              with gates, runs a service, and publishes the integration back to the log.
            </p>
            <p className="denied">must never: wind ambient facts · touch the world directly</p>
          </article>
          <article className="station">
            <span className="eyebrow">The membrane</span>
            <h3>Output controller</h3>
            <p>
              Claims committed intentions and discharges them to the world exactly once; the
              world&rsquo;s answers re-enter as correlated facts. The only asynchronous seam.
            </p>
            <p className="denied">must never: judge · integrate · originate semantic content</p>
          </article>
        </div>
      </section>

      <section className="reflexive">
        <span className="eyebrow">The reflexive bootstrap · Vol. 13 §7, Tact 1</span>
        <blockquote>
          The machine&rsquo;s first study subject is the machine itself: every session on the
          workbench is committed as a wave log, so learning to read the machine and using it are
          the same gesture.
        </blockquote>
        <cite>Nest Education seed — self-description of the runtime from this repository</cite>
      </section>
    </main>
  );
}
