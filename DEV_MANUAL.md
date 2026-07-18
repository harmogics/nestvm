# DEV_MANUAL — the simple way in

Everything else in this repository is precise. This page is friendly.
Nothing here is law — the law lives in [CONSTITUTION.md](./CONSTITUTION.md)
and its sources; this page just gets you started.

## The short version

1. Fork it and clone it.
2. `npm install`, then `npm run dev`, then open `http://localhost:3000`
   and poke around the workbench for ten minutes.
3. Open the repository in an AI coding assistant (Claude Code or any
   capable equivalent). It picks up `CLAUDE.md` — the standing
   instructions — on its own, and from there it knows where every rule,
   protocol and map lives.
4. Talk to it.

That is genuinely the whole onboarding. You do not need to read sixteen
volumes before your first conversation — though you are warmly welcome
to (see below).

## Why talking works here

This repository was built in conversation, and it is built *for*
conversation. The assistant reads the constitutional materials itself
and is bound by them: it will propose rather than decide, check its
ideas against the written sources, walk substantial work through the
seven design phases ([PROTOCOL_DEV.md](./PROTOCOL_DEV.md)), ask for your
explicit go before building anything, run the checks, and write down
what it did and what it left open. You stay the one who decides —
that is not politeness, it is Article 9 of the constitution.

## Things you can say first (paste as-is)

- *"I'm new here. Read the constitution and the protocol and tell me,
  in plain words, how development works in this repository."*
- *"Show me around the code: what lives where, and why?"*
- *"I want to add ‹thing›. Take me through the phases before any code."*
- *"Would ‹idea› break anything? Run the cheapest checks first."*
- *"We're done with this piece — update the records and tell me what
  stayed open."*

## Reading for yourself (encouraged, never required first)

The short path: [README](./README.md) → [PHILOSOPHY](./PHILOSOPHY.md) →
[CONSTITUTION](./CONSTITUTION.md) → [PROTOCOL_DEV](./PROTOCOL_DEV.md) →
[src/README](./src/README.md). Deeper: the machine specification in
`specifications/`, the interaction device in `huid/`. Everything is
cross-linked, and every folder carries a README — a "lid" — saying what
belongs inside it and what never does.

## Honest small print

- The assistant is an assistant. Trust the instruments — `npx tsc`,
  `npm run parity`, the fixtures, the checklists — not confidence,
  its or yours.
- Nothing substantial starts without your explicit go, and acceptance
  of a result is yours alone; silence is never consent here.
- The workbench runs fine without any AI key (deterministic fallbacks
  are built in); for the fully guided study experience set
  `TOGETHER_API_KEY` in `.env.local` — see `.env.example`.
- If the model and a document ever disagree, the document wins. Say so
  plainly — the assistant is built to verify challenges against the
  sources and concede where they land.
- Your fork is yours; what you record there stays there. Publishing
  anything into a commons is a separate, deliberate act — the
  repository's own rule (history is not publication).
