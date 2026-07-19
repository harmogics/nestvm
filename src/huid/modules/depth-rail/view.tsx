// The depth rail module (right dock) — presentation side. The model
// arrives formed as the scene-registry contract snapshot (ADR-010);
// `select` is the pure parameter application (HUID 02 §1) and the view
// renders model fields only. Every control is a navigation move on
// `focus.bindId` — the rail never commits and never fetches: the host
// transports snapshots per contract.

import type { SceneCard, SceneRegistrySnapshot } from "../../contracts/scene-registry";
import type { ModulePort } from "../../manifest";
import { truncate } from "../../text";

export type DepthRailModel = {
  focusedBindId: string | null;
  childScenes: SceneCard[];
  allScenes: SceneCard[]; // empty until more than one scene exists
};

export function selectDepthRail(
  model: SceneRegistrySnapshot,
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
  port: ModulePort;
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
