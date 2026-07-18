// The depth rail module (right dock) — client half. The model arrives
// formed from the panel's projector (ADR-009); `select` is the pure
// parameter application (HUID 02 §1) and the view renders model fields
// only. Every control is a navigation move on `focus.bindId` — the rail
// never commits and never fetches: the host transports snapshots.

import { truncate } from "../../text";
import type { DepthPanelModel, DepthSceneCard } from "./model";

export type DepthRailModel = {
  focusedBindId: string | null;
  childScenes: DepthSceneCard[];
  allScenes: DepthSceneCard[]; // empty until more than one scene exists
};

export function selectDepthRail(
  model: DepthPanelModel,
  params: { focusBindId: string | null }
): DepthRailModel {
  return {
    focusedBindId: params.focusBindId,
    childScenes: params.focusBindId
      ? model.scenes.filter((s) => s.parentBindId === params.focusBindId)
      : [],
    allScenes: model.scenes.length > 1 ? model.scenes : []
  };
}

export function DepthRail({
  model,
  port
}: {
  model: DepthRailModel;
  port: { navigate: (patch: { "focus.bindId": string }) => void };
}) {
  return (
    <aside className="rail right">
      <section>
        <h4>Depth — child scenes</h4>
        {model.childScenes.length === 0 && (
          <p className="root-item">Deepen a knot to open a child scene here.</p>
        )}
        {model.childScenes.map((scene) => (
          <button
            type="button"
            className={`child-link${scene.bindId === model.focusedBindId ? " active" : ""}`}
            key={scene.bindId}
            onClick={() => port.navigate({ "focus.bindId": scene.bindId })}
          >
            <b>{truncate(scene.title, 52)}</b>
            <small>
              {scene.bindId} · {scene.status}
            </small>
          </button>
        ))}
      </section>
      {model.allScenes.length > 0 && (
        <section>
          <h4>All scenes</h4>
          {model.allScenes.map((scene) => (
            <button
              type="button"
              className={`child-link${scene.bindId === model.focusedBindId ? " active" : ""}`}
              key={scene.bindId}
              onClick={() => port.navigate({ "focus.bindId": scene.bindId })}
            >
              <b>{truncate(scene.title, 52)}</b>
              <small>
                {scene.bindId} · {scene.status}
                {scene.parentBindId ? ` · child of ${scene.parentBindId}` : " · root"}
              </small>
            </button>
          ))}
        </section>
      )}
    </aside>
  );
}
