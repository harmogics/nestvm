# themes — the visual layer on rails

**Status:** normalisation of what is already self-embedded, 2026-07-18.
No global rework: this layer *documents* the pattern the styling has
carried since birth and makes it consciously applicable. Governed by the
formation boundary (HUID 00 §5: a surface chooses *how* to show, never
*what is true* — themes are exactly the legitimate home of the "how"),
the calm contract (HUID 04), and the project frame (one field, sibling
accents).

## 1. The self-embedded pattern (the fractal passport of styling)

Styling already runs the recurring figure (meta-bind-01):

- **collection — the tokens.** The declared vocabulary of what may enter
  a rendering: the `:root` custom properties (surfaces, inks, lines,
  accents, type families). Nothing else is a legitimate visual input.
- **accumulation — the composition.** Module- and widget-scoped class
  blocks composing tokens into forms (the sectioned blocks of
  `globals.css`; later co-located files as modules extract).
- **publication — the rendered surface**, weighted by kind of act
  (HUID 04 §5).

## 2. The rules (naming what already holds, binding it forward)

1. **Raw values live only in token definitions.** Component and widget
   styles consume `var(--…)` — a hex or named colour inside a module
   block is drift (the existing violations are ledgered in the theme
   register, retired opportunistically — rule 6).
2. **A theme is a token assignment; the field grammar is shared.** One
   field (aged paper · serif display · mono labels), sibling accents per
   product: NestVM's blueprint ink-blue beside TAC's terracotta — the
   `:root` header comment states it; this layer canonises it.
3. **Accents carry act semantics, not decoration.** Terracotta is
   reserved for activation/readiness/acceptance moments; the visual
   weight ladder (read < navigation < commit < authoring, HUID 04 §5)
   is a token-and-class concern, never per-widget improvisation.
4. **Widgets declare their visual face.** A widget registration names
   its class scope (prefix) and the tokens it consumes — the visual
   mirror of the manifest discipline; reviewable without reading CSS.
5. **Seeds carry token references, never values.** A guild's widget
   hints reference the token vocabulary (and may *suggest* accent
   assignments); the target's theme governs rendering — the guild's
   identity travels as semantics, the target keeps its own ink
   (guild-seeds §3.2; FORMAT §2.5).
6. **Migration is opportunistic, never global.** Each module extraction
   or restyle moves its section onto pure tokens and scoped classes (the
   trace restyle is the first carrier); the ledger shrinks with the
   ordinary flow of work.

## 3. Registers

- [nestvm-ink.md](./nestvm-ink.md) — the current theme: the token
  vocabulary as it exists in `src/app/globals.css` `:root`, the
  act-weight carriers as they exist today, and the honest ledger of
  raw-value debts.

## 4. Protocol and seed integration

- **PROTOCOL_DEV, phase 4 (Service):** presentation fragments in a
  change map name their class scope, consumed tokens, and act weights;
  a raw value in the plan is caught before code.
- **Capability seeds (FORMAT §2):** visual dependencies are token
  references + optional theme suggestions; a seed carrying CSS values
  fails review.
- **Drift criteria:** a new raw value outside token definitions; a
  widget whose weight cannot be named; a theme change that alters *what*
  is shown rather than *how* (formation boundary breach).
