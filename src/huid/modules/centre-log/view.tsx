// The record lens — presentation side. The model arrives formed as the
// trace contract snapshot (bounded rows, no payloads); `select` applies
// the actor filter (a pure parameter application, HUID 02 §1); the view
// renders rows through the widget factory — resolve("log", form) — whose
// floor guarantees no tuple is ever invisible. The raw record is one
// disclosure away via the host-injected reader (design_proposal §12.5.4);
// the module never fetches and never computes semantics.

import type { TraceActor, TraceRow, TraceSnapshot } from "../../contracts/trace";
import type { ModulePort } from "../../manifest";
import { resolve, routeForm, ROW, type TupleReader } from "../../widgets/registry";

export type CentreLogModel = {
  rows: TraceRow[];
  actor: TraceActor | "all";
};

export function selectCentreLog(
  model: TraceSnapshot,
  params: { actor: string }
): CentreLogModel {
  const actor =
    (["learner", "machine", "world"] as const).find((a) => a === params.actor) ?? "all";
  return {
    rows: actor === "all" ? model.rows : model.rows.filter((row) => row.actor === actor),
    actor
  };
}

// Growth by registration: the log lens routes every row.* form to the
// shared row widget; re-routing is a table line, never a widget edit.
routeForm({ lens: "log", form: "row.*", use: [ROW] });

export function CentreLog({
  model,
  port,
  readTuple
}: {
  model: CentreLogModel;
  port: ModulePort;
  readTuple: TupleReader;
}) {
  return (
    <div className="trace-log">
      <div className="trace-head">
        <div>
          <h4>The session&rsquo;s wave log</h4>
          <p className="trace-note">
            The stream of thought of the machine you are studying, as it is committed: the
            learner supplies facts and judgement, the machine&rsquo;s structures register,
            wind and gather, and the world behind the membrane answers. The raw record of
            any row is one disclosure away.
          </p>
        </div>
        <div className="trace-filters">
          {(["all", "learner", "machine", "world"] as const).map((filter) => (
            <button
              type="button"
              key={filter}
              className={model.actor === filter ? "on" : ""}
              onClick={() => port.navigate({ "centre.log.actor": filter })}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      {model.rows.map((row) => {
        const Row = resolve("log", row.form)[0];
        return <Row key={row.offset} item={row} readTuple={readTuple} />;
      })}
    </div>
  );
}
