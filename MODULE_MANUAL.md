# MODULE_MANUAL — building a panel, in plain developer terms

A ten-minute guide for adding a UI panel to the workbench. It uses
ordinary web-stack vocabulary and deliberately does not explain the
system's philosophy — the law behind these rules lives in `huid/` and
`src/CONVENTIONS.md`; this manual points, never restates (the same deal
as [DEV_MANUAL](./DEV_MANUAL.md)).

## The stack in one paragraph

A Next.js / React / TypeScript app. The server keeps an **append-only
event log** per session (a JSONL file, one event per line). Server-side
**reducers** fold that log into cached **read models**; a generic REST
endpoint serves them as JSON snapshots. The client fetches snapshots and
renders them with **pure React components**; user actions POST **typed
commands** which append new events. Classic CQRS / event sourcing, plus
a plugin UI: every panel is a small directory registered in a couple of
registries.

## What one panel consists of

```text
src/huid/contracts/<product>.ts      the DTO: TypeScript types of the API
                                     payload + an id constant (types only)
src/huid/projectors/<product>.ts     the reducer (server-only): which events
                                     it consumes + init/step/snapshot
src/huid/projectors/registry.ts      +1 line — register the reducer
src/huid/modules/<panel>/manifest.ts panel metadata: which DTOs it consumes,
                                     which dock it sits in, params, commands
src/huid/modules/<panel>/view.tsx    a pure selector + a stateless component
src/huid/modules/<panel>/README.md   a short readme
src/huid/workbench.tsx               +1 entry — seat the panel
```

## Step by step

1. **Define the DTO** (`contracts/<product>.ts`). Plain interfaces + an
   exported string constant (the product id). Both sides import it; it
   is erased at build. Evolve it additively — a breaking change means a
   new id, not an edit.

2. **Write the reducer** (`projectors/<product>.ts`). Export an object:
   - `manifest`: `{ contract, reads: { kinds?, factTypes, joins } }` —
     the event types it consumes. The runtime feeds it *only* matching
     events, so declare exactly what `step` handles;
   - `init()` → empty accumulator; `step(state, event)` → state — a pure
     reducer called once per matching event, in log order;
   - `snapshot(state)` → the DTO.
   Don't fetch, don't read clocks or globals — everything must derive
   from the events, so a replay reproduces the snapshot byte for byte.
   Caching, incremental catch-up and rebuilds are the runtime's job; you
   never touch them.

3. **Register it**: one `Map` entry in `projectors/registry.ts`. The
   generic endpoint `GET /api/sessions/:id/snapshots/<product-id>`
   starts serving `{model, asOfOffset}` immediately — no route code.

4. **Write the panel** (`modules/<panel>/`):
   - `manifest.ts`: id, dock (`strip | left | centre | right |
     composer`), `consumes: [<product-id>]`, the param keys it
     reads/writes, the command kinds its buttons send;
   - `view.tsx`: `select(model, params)` — a pure function (think Redux
     selector) applying client-side state (focus, filters, toggles) to
     the snapshot; and `View({ model, port, … })` — a stateless
     component. **No hooks, no fetch, no business logic in JSX** — if
     the view needs a computed value, compute it in the reducer (server)
     or the selector (pure).

5. **Wire the buttons** through the injected `port` — the only two ways
   out of a panel:
   - `port.commit(body)` — POSTs a typed command; the server validates,
     appends events, returns them; every open panel refreshes
     automatically;
   - `port.navigate(patch)` — merges keys into the client-side params
     record (like setting query params); nothing goes to the server.
   Namespace your private keys `<panelId>.<key>`; shared keys (focus,
   the composer target) already exist — read the host's param types.

6. **Seat it** in `workbench.tsx`: add the manifest to `seatedModules`
   (this alone makes the host fetch your DTO and pass it in); for a
   centre view, add one `centreViews` entry with a render closure. Both
   are single lines — if you touch anything else, stop: you are
   probably doing it wrong.

7. **Event-anchored rows** (optional): if the panel lists individual
   events, reuse the widget registry (`src/huid/widgets/`): rows arrive
   from the reducer already tagged with a `form` key; route them with
   `routeForm({ lens, form, use })` and the shared row widget; a lazy
   raw-JSON disclosure comes free through the injected `readTuple`
   callback — never `fetch` from a component.

8. **Style** with the CSS custom properties in
   `src/app/globals.css` (`var(--ink)`, `var(--line)`, …). No hex
   values in component styles — add a token first if one is missing.

9. **Test**: recorded sessions live in `fixtures/sessions/*.jsonl`. Add
   a script under `scripts/parity/` that recomputes your expectations
   straight from the raw JSONL *by a different route* than your reducer
   and diffs them against the live endpoint; chain it into the `parity`
   script in `package.json`. Then: `npx tsc --noEmit`, `npm run parity`
   (dev server running), and click through your panel on `npm run dev`.

## How it assembles at runtime (wiring you never write)

- **Server**: the snapshot route wires all reducers to the log's commit
  hook once per process; caches advance as events append; a cold cache
  rebuilds by replaying the file.
- **Client**: the host collects the union of `consumes` across seated
  panels, fetches each snapshot once (shared by all consumers, stale
  responses dropped), refetches after every successful command, and
  hands your component `{model, params, port}`. React re-renders it
  like any other component.

## The rules that bite

| Don't | Do instead |
| --- | --- |
| `useState` / `useEffect` in a module | state lives in the host; disclosure state = native `<details>`; the rest is params |
| `fetch` in a component or widget | `port.commit` / `port.navigate` / the injected `readTuple` |
| computing business state in JSX | the reducer (server) or the selector (pure) |
| editing the host for a feature | a registry entry; if none fits, raise it — that is a design decision |
| breaking a DTO shape | additive fields, or a new contract id |
| `key={index}` on event lists | key by offset or a stable id |
| hex colours in components | theme tokens (`var(--…)`) |

## Where do I put…

| I want | It goes |
| --- | --- |
| a new panel / centre view | `src/huid/modules/<panel>/` + one registry entry |
| a new API payload for panels | `contracts/` + `projectors/` + one registry line |
| a new row/block rendering | a former in the reducer + a widget + one `routeForm` line |
| a new button/command kind | `src/product/commands.ts` + a machine handler + `commits` in your manifest |
| a shared cross-panel filter | a promoted host param key (ask — it is a recorded decision) |
| an external integration | `src/nest/membrane/` adapter (server) — never from the UI |
