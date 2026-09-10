# DESIGN.md — GAIN Day

## Aesthetic lane
A championship game program crossed with a broadcast graphics package. The printed
program you buy at a bowl game: heavy varsity block type, jersey numerals, box-score
stat tables, chalk yard-line rules. Art-directed with the tonal swing of a night
broadcast.

Explicitly NOT: editorial magazine, Stripe-minimal, nonprofit-beige.

## Color strategy: Drenched
Deep field green owns the surface. Victory Gold is load-bearing at roughly 8%.
Championship Navy is a second world, reserved for the money sections.

Reference: Nike collegiate lookbook green drench, gold used the way a trophy is used.

**Channel tokens.** Every colour is authored once as bare `L C H` channels, so alpha
variants stay on-system instead of drifting into one-off literals:

```css
--gold-ch: 0.795 0.145 82;
--gold:    oklch(var(--gold-ch));
.alarm   { border-color: oklch(var(--gold-ch) / 0.32); }
```

**Rule: no raw `oklch()` below the `:root` block.** Enforced by grep; currently zero.

| Token | OKLCH | Renders | Source hex |
|---|---|---|---|
| `--ink` | `0.155 0.024 152` | `#050f07` | derived, deepest green-black |
| `--field-900` | `0.225 0.042 150` | `#0c2111` | derived |
| `--field` | `0.450 0.098 143` | `#31632f` | #2D5A27 Field Green |
| `--navy-900` | `0.205 0.072 265` | `#071437` | derived |
| `--navy` | `0.262 0.090 264` | `#0d214f` | #0A1F4D Championship Navy |
| `--gold` | `0.795 0.145 82` | `#eab23a` | #E8B234 Victory Gold |
| `--chalk` | `0.965 0.005 106` | `#f4f4f0` | #F5F5F0 Chalk White |

Per-band text ramps: `--on-chalk`, `--on-chalk-dim`, `--on-navy`, `--on-navy-2`,
`--on-navy-3`. Semantic: `--rule`, `--rule-hi`, `--wash`, `--focus`, `--danger`,
`--ok`.

Never `#000` or `#fff`. Every neutral is tinted toward green or navy.

**`--focus` inverts per band.** Gold on chalk is 1.74:1, effectively invisible, so
`.band--chalk` reassigns `--focus` to `--ink` (17.67:1). Any new light surface must do
the same.

## Tonal arc (art direction per section)
Night field, printed record, proof, the reach, the lift, the money, the discipline,
the roster, the ask, the plan, the commitment, the record, back to the field.

`hero` green drench · `who` green · `story` chalk · `impact` chalk · `global` ink ·
`vision` green · `investment` navy · `journey` ink · `leadership` navy ·
`partnership` navy · `timeline` chalk · `pledge` navy · `faq` chalk ·
`final` green drench

Fourteen sections now, up from the wireframe's original set, once the approved copy
deck (client Google Doc, superseding the wireframe as content source of truth)
added Our Global Community and Your GAIN Journey and split the old single Timeline
section into a road-to-GAIN band and a Make Your Commitment band. The Challenge and
If We Wait sections from the wireframe draft are gone: the deck folds the storm
narrative into Our Story as prose instead of a separate damage-and-cost section.

## Typography
Brand guide specifies Freshman (varsity block) and Archivo Narrow. Freshman is not
web-licensed, so **Graduate** carries the collegiate voice on web.

- **Graduate** — display, wordmark, section numerals, scoreboard and box-score figures.
- **Archivo** — headings and body. Same superfamily as the brand's Narrow.
- **Archivo Narrow** — kickers, labels, nav, stat captions, anywhere condensed belongs.

All three are self-hosted variable woff2 in `assets/fonts/`, latin subset, with
`@font-face` at the top of `styles.css`. No third-party font origin.

**No italic anywhere.** The italic axis cost 39 KB to serve one blockquote, and the
footer verse it also fed was rendering faux italic regardless. Quotation is carried by
typographic quote marks plus the gold uppercase cite line, which is more on-lane for a
varsity-block system. If you add italic text later, you must add the italic file back.

Fluid `clamp()`, ratio ≥ 1.32 between steps. Body measure capped at 62ch.

## Signature devices
1. **Yard-line rules.** Section dividers as chalk hash marks with a yard numeral. CSS only.
2. **Box score.** 2025 impact set as a table with dot leaders and tabular figures.
   Deliberately not a stat-card grid.
3. **Outline jersey numerals.** Section numbers in Graduate with `-webkit-text-stroke`,
   echoing the GAIN wordmark's outline cut.
4. **The scoreboard.** The Investment section is a physical object: bezel, mounting
   bolts, header strip, dot-matrix figures, goal meter.
5. **The depth chart.** Partnership tiers as an ascending ladder, type scaling up the
   rungs. Never six identical cards.
6. **Scouting slates.** Pending photo slots are designed registration frames carrying
   the exact asset spec, not gray boxes.
7. **Tier rows are the entry point.** Each rung in the depth chart is a plain link to
   the official pledge form (tlhc.org/gain-form, external, already live), carrying a
   `data-tier` attribute as an analytics hook. The hover arrow appears only under
   `@media (hover: hover)`, so touch never shows a dead affordance.
8. **The commitment card sets expectations, not a duplicate form.** GAIN Day's pledge
   form lives at tlhc.org and is already live; this page never re-implements it. The
   card in Make Your Commitment lists what the real form will ask for, then hands off
   with one CTA. No local validation, no fake submit state.
9. **One accent pull-quote, two jobs.** `.leadquote` (Graduate serif, gold cite) carries
   the leadership pull-quote and, unattributed, the stewardship line in Partnership
   Tiers. Same component, no attribution required.

## Motion

**Nothing above the fold may depend on script.** The hero stagger is a pure CSS
`@keyframes` animation with per-child `animation-delay`, not a JS-applied class. An
earlier version hid the hero in CSS and revealed it from JS, which meant a blocked
script left the entire ask invisible. Scroll reveals may stay script-driven only
because the hiding class is applied by the script, so they fail open.

One orchestrated hero load, then scroll reveals via IntersectionObserver.
`cubic-bezier(0.16, 1, 0.3, 1)`. No bounce. Full `prefers-reduced-motion` bypass.
Only `transform` and `opacity` animate.

## Floors

Type floor `--t-xs` is 13px, `--t-sm` 15px. The congregation is explicitly
multigenerational, seniors included, so nothing drops to 11px or 12px except the
brand eyebrow. Interactive targets clear 44px; inline prose links are the only
exception, per the WCAG 2.5.8 inline allowance.

## Bans honored
No gradient text. No side-stripe borders. No glassmorphism. No hero-metric template.
No identical card grids. No modals. No em dashes in copy.
