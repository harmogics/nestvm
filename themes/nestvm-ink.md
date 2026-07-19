# nestvm-ink — the current theme register

**Status:** documentation of the living `:root` in
`src/app/globals.css`, 2026-07-18. The CSS is the source; this register
is its derived reading — corrected when the source changes.

## 1. The field (shared with the sibling)

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#f3eee0` | the working surface (frame) |
| `--paper-deep` | `#eae3cf` | the surround behind the frame |
| `--paper-card` | `#faf6ea` | raised cards |
| `--ink` | `#26221a` | primary text |
| `--muted` | `#71685a` | secondary text; read-weight controls |
| `--faint` | `#a29a86` | tertiary marks |
| `--line` | `#d4cbb2` | quiet structure |
| `--line-strong` | `#b3a88c` | emphasised structure |
| `--serif` | Playfair Display | display headings |
| `--prose` | Source Serif 4 | reading text |
| `--sans` | Manrope | UI text |
| `--mono` | DM Mono | labels, offsets, machine register |

Type arrives via the Google Fonts `@import` — a delivery detail, not a
token; a target may self-host the same families.

## 2. The accents (this product's ink)

| Token | Value | Semantics |
| --- | --- | --- |
| `--blue` / `--blue-deep` / `--blue-wash` | `#2e4a76` / `#22375a` / `#e3e5d9` | the identity accent: blueprint ink-blue — links, active states, machine labels |
| `--terra` / `--terra-wash` | `#b4552c` / `#f2e2d4` | **reserved for activation/readiness/acceptance moments** (the `:root` header rule): accept ctas, ready grades, learner lane |
| `--olive` | `#6a6f3f` | the world/completion note (world actor, completed marks) |
| `--actor-learner` / `--actor-machine` / `--actor-world` | `#c86a3f` / `#5f7ea8` / `#8fa06a` | actor lanes of the record lens: hairline rules and chips (lifted from the drawer debt, 2026-07-19) |
| `--code-ground` / `--code-ink` | `#23282e` / `#cfd4c2` | the one dark idiom kept: raw-record code blocks on disclosure (HUID 04 §3.3) |

## 3. Act-weight carriers today (documented, with blur points)

| Weight (HUID 04 §5) | Today's carriers |
| --- | --- |
| read | plain links; muted inline anchors (Exit, Archive ↓) |
| navigation | `.child-link` cards; `.view-switch`; crumbs |
| commit | `.session-strip button`; `.send`; `.op-btn` |
| authoring / acceptance | the `--terra` accent (`.cta.terra`, `.op-btn.terra`); `.hot` grades |

**Blur ledgered:** `.vec-btn` carries both navigation (Open child scene)
and commits (Evidence, Deepen) — the weight ladder blurs there; resolved
with the factory pass, not before.

## 4. Raw-value debt ledger (retired opportunistically, rule 6)

1. ~~**The trace drawer block**~~ — **retired 2026-07-19** with the
   trace restyle (design_proposal §6 step 1): the drawer died with the
   record lens's extraction (`centre-log`); actor colours lifted into
   `--actor-learner/machine/world`; the dark code-block idiom kept only
   on raw-record disclosure as `--code-ground`/`--code-ink`.
2. **Shadow hexes** — `.frame` (`#5d543c33`), `.produced`/card shadows.
3. **Status-chip colours** in the spec reading map.
4. Scattered greys in the composer hint and payload blocks.

Nothing here blocks work; each item retires when its section is next
touched.
