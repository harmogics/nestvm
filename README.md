# NEST Inductive Canvas

A runnable Next.js learning interface for guided inductive decomposition. It treats AI as a visible reasoning assistant: learner directions form inspectable artefacts on a canvas instead of disappearing into a chat transcript.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The application runs without external credentials using a deterministic guide simulation. To enable Together AI, copy `.env.example` to `.env.local`, set `TOGETHER_API_KEY`, and restart the dev server.

## API

`POST /api/guide` accepts `{ input, move, context }` and returns a structured learning response:

```json
{
  "title": "Deepen the inquiry",
  "purpose": "...",
  "blocks": [{ "kind": "observation", "text": "...", "evidence": "..." }],
  "prompt": "...",
  "source": "simulation"
}
```

The API deliberately requests only learner-facing, inspectable artefacts from the model. It does not represent or expose private model chain-of-thought.

## Project structure

- `app/` — Next.js UI and route handler
- `components/` — the interactive learning canvas
- `spec/` — product decisions and API/UI contracts
