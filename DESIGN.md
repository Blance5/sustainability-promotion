# The Treeline: design system for ORGT Adventure Trips

Reference: Krillion (krillion.io). One metaphor, a pixel world behind thin-line data, a dark palette with two accents, readout-style labels, and a results screen built on one giant number.

**Content rule.** Every sentence, figure, quiz question, quiz result, and link from the original site is kept word for word. The redesign adds only two kinds of text:
1. **Wayfinding labels** the brief names: *The Survey*, *The Rings*, *Seedlings*, *The Canopy*, *This week's seedling*. Chart axis labels are also added.
2. **Source footnotes** under every block that shows a number. Each footnote links to `sources.html#src-N`.

---

## 1. Concept

**The treeline.** Every page is a vertical cross-section of a forest. The canopy sits at the top, trunks run through the middle, and roots and soil fill the bottom. The page background shifts from forest to soil at 72% of page height. Scrolling down means digging toward where a good week actually comes from.

| Brief term | Where it lives |
|---|---|
| **The Survey** | The trip matcher on *Get involved* |
| **The Rings** | The quiz result screen. Each answer adds one ring. |
| **Seedlings** | The five "Do this in order" steps. Each one can be planted. |
| **The Canopy** | Progress: seedlings planted out of 6. Shown in the menu, and drawn as trees regrowing in the pixel world. |

**Hopeful, not guilt-driven.** The forest never starts empty. About a third of the trees are always in full leaf. The rest are bare branches with buds: winter, not death. Each planted seedling (one survey plus five steps) brings more crowns into leaf and adds more fireflies. Nothing ever withers.

**Weekly ritual.** One rung of the "If one trip is not the whole story" ladder is featured each week. It's chosen by ISO week number, so everyone sees the same one on the same day. It's tagged `THIS WEEK'S SEEDLING · WK 42`.
> The brief's "12,400 people did this week's seedling" counter is **not built**. That figure doesn't exist, and the site has no backend to count with. Wire it up only if Campus Recreation can provide a real weekly registration count. Planned copy: `{n} STUDENTS · THIS WEEK'S SEEDLING`, with the source footnoted.

### Two alternative metaphors

| Metaphor | How it would work | Verdict |
|---|---|---|
| **The tide line** | Water level rises and falls with the week. Each action pushes the tide back out. | **Don't switch.** It fits paddling but not caving, climbing, or hiking. The tide also never stays put, so progress feels temporary. |
| **The melting glacier** | Ice retreats as stress builds. Each action refreezes a band of it. | **Don't switch.** A glacier means climate loss, which pulls toward doom and guilt, the opposite of the brief. It's also the wrong issue: this site is about SDG 3 (health), not climate. |
| **The treeline** (kept) | Canopy, trunk, roots. Actions regrow the forest. | **Keep.** The trips really do happen in North Georgia forests. Growth is slow, cumulative, and hopeful. Tree rings give a natural results visual, and roots→trunk→canopy matches the site's ladder from first trip to trip leader. |

---

## 2. Palette

| Token | Hex | Use |
|---|---|---|
| `--forest-0` | `#0b1410` | Page base |
| `--forest-1` | `#101c16` | Raised surfaces, menu panel |
| `--forest-2` | `#16251d` | Panels |
| `--forest-3` | `#1f3127` | Hover fill, empty canopy cells |
| `--soil-0` | `#2a1f17` | Lower sections (from 72% down) |
| `--soil-1` | `#1c150f` | Deepest soil, footer |
| `--text` | `#dfe6d8` | Body and headings |
| `--text-dim` | `#93a597` | Secondary text |
| `--text-faint` | `#62746a` | Footnotes, axis ticks |
| `--line` / `--line-soil` | `#2a3b31` / `#4a3a2c` | Rules, borders |
| **`--leaf`** | **`#7fd17a`** | Accent 1: data, growth, links |
| `--leaf-dim` | `#3d6b3b` | Inactive data |
| **`--amber`** | **`#f0b54a`** | Accent 2: *you*, the brand, primary action, the hero number |
| `--amber-dim` | `#7c5a22` | Thresholds, secondary amber |

Rule: green means *the world / the data*. Amber means *you or ORGT*. Never use both on the same element.

Pixel-art inks, used in canvas only: leaf `#13261a` `#1b3522` `#24472c` `#2f5c35`; bark `#120d09` `#1d150f` `#2a1f16`; root `#3a2a1c` `#4a3624`; stone `#3b342c`.

## 3. Type

| Role | Font | Spec |
|---|---|---|
| Logo, hero number, stat numbers, step numbers | **Silkscreen** (pixel) | Logo 15px · hero number 72–128px · stats 34px |
| Labels, buttons, nav, footnotes, axes | **IBM Plex Mono** 400/500 | 10.5–13px, UPPERCASE, letter-spacing .14–.3em |
| Body and headings | **IBM Plex Sans** 400/500/600 | Body 16px/1.7 · h1 34–51px · h2 23–30px · h3 18px |

**Section header pattern.** A mono small-caps label, a 12px gap, then a 1px dashed rule out to the column edge. Green labels mark context; amber labels (`.label`) mark the metaphor sections.

## 4. Spacing and layout

- 4px base. Scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 72 · 112.
- **One centered 700px column** at every breakpoint, with 24px gutters. All old 2- and 3-column grids collapse into it.
- **Chrome** is just the brand on the left and a 40px square hamburger on the right. The menu slides in from the right (360px) and shows the Canopy readout at the bottom. Esc closes it.
- Corners are 2px. There are no shadows; depth comes from the world behind, plus a 3px backdrop blur on panels.
- Grids of facts (stats, sports) use 1px hairline cells, Krillion-style.

## 5. Motion

| Thing | Spec |
|---|---|
| Canopy sway | ±1 art-pixel, redrawn at 4 fps (stepped on purpose, so it reads as pixel art) |
| Particles | Leaves fall in the canopy zone (top 600px), amber fireflies glow in the trunk zone, spores rise in the soil. One extra mote per 900 art-px², plus 3 more per planted seedling. |
| Animal | A 5×3 pixel bird crosses about every 25–55s. Not shown in the soil zone. |
| Charts | Bars grow 900ms; the curve draws in 1.6s; rings draw from the pith outward with a 150ms stagger |
| UI | 160ms for hover/border, 420ms for panels; easing `cubic-bezier(.2,.7,.2,1)` |
| `prefers-reduced-motion` | All animation and particles off, sway off. Static final states are shown. |

Canvases are drawn at 1 art pixel = 4 CSS px with `image-rendering: pixelated`. A horizontal fade keeps the text column quiet. Animation pauses when the tab is hidden.

---

## 6. Screens: layout and copy

Original copy is quoted as-is. ⟨Added⟩ marks new labels.

### Screen 1: The Survey (`get-involved.html`)

```
┌ 700px ──────────────────────────────────────────────┐
│ TAKE ACTION ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│ Pick a trip that fits the week you actually have.   │
│ The useful action is a protected block…             │
│                                                     │
│ ⟨THE SURVEY⟩ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ INTERACTIVE TRIP MATCHER ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │ │
│ │  ◎  01/03                ← rings: done=leaf,    │ │
│ │     RING                   current=amber pulse  │ │
│ │ How much time can you realistically give a trip?│ │
│ │ [A  A few hours, and I want to be back…       ] │ │
│ │ [B  A full Saturday is doable if I know…      ] │ │
│ │ [C  …] [D  …]                                   │ │
│ │ [START OVER]                                    │ │
│ └─────────────────────────────────────────────────┘ │
```
- Questions and answers: the original three questions, unchanged (see `js/site.js`).
- Options are lettered A–E in the pixel font. On hover they nudge 4px right with a leaf border. After each answer, focus moves to the first new option.
- Footnote for the swim-test numbers: ⟨SRC [9] [10]⟩ under the Seedlings list.

### Screen 2: The Rings (quiz result, same panel)

```
│ ⟨THE RINGS⟩ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│               ╭───────────────╮                     │
│             ╭─│     120       │─╮   ← 3 rings, one  │
│             │ │  MIN / WEEK   │ │     per answer    │
│             ╰─╰───────────────╯─╯                   │
│ REPORTED WELL-BEING                                 │
│        ┊        ■ YOU · 1 DAY TRIP                  │
│      ╱─┊────────────────────────  (leaf curve)      │
│    ╱   ┊ (amber dashed threshold)                   │
│ ──0───60──120──180──240──300+─  MIN / WEEK OUTSIDE  │
│ ▌ {result title, original}                          │
│ ▌ {result text, original}                           │
│ ▌ [SEE CURRENT TRIPS]                               │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│ SRC [4] WHITE ET AL. 2019 [9] [10] CAMPUS RECREATION│
│     CURVE IS SCHEMATIC                              │
```
- **Giant number: 120.** This is the site's own figure ("at least 120 minutes a week in nature") from White et al. 2019 [4]. The quiz itself returns a trip, not a score, so this is the one honest headline number.
- **"Where you rank" curve.** Krillion ranks you against other users. This site has no such data, so the curve instead shows where *you* land on the study's well-being-vs-minutes relationship once you take one trip. That uses the site's own claim: "A single ORGT day trip is still long enough to meet that weekly threshold." The curve's shape is **schematic**, which the footnote says, and it reflects the site's "association, not a prescription" caveat.
- Result titles and texts: the original seven, unchanged.
- Finishing the survey plants seedling 1 of 6.

### Screen 3: Seedlings and The Canopy (`get-involved.html`, below)

```
│ ⟨SEEDLINGS⟩ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│ Do this in order                                    │
│ 01  Check that you are eligible. …            [🌱] │
│ 02  Watch the calendar. …                     [🌱] │
│ 03 … 04 … 05 …                                      │
│ SRC [9] CAMPUS RECREATION [10] SPORT PAGES          │
│                                                     │
│ ⟨THE CANOPY⟩ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│ If one trip is not the whole story                  │
│ A single Saturday meets the two-hour target. …      │
│ 1. Take a beginner trip                          +  │
│ ■ ⟨THIS WEEK'S SEEDLING · WK 42⟩                    │
│ 3. Show up to a weekly sport group               +  │ ← amber
│ …                                                   │
```
- The seed button on each step toggles "planted" (`aria-label="Plant seedling N"`). The step number turns leaf green. Progress is saved in `localStorage` (`treeline-seedlings`), with no account and no tracking.
- Menu readout: ⟨THE CANOPY 3/6⟩ plus six pixel cells.
- Each planted seedling brings more trees into full leaf across every page.

### Voice

The original copy already has the right voice: short, warm, a little dry ("Horizontal first. Vertical after you know the dark."). The few words unique to this site are *seedling*, *the canopy*, *the rings*, and *the survey*. They appear only as labels, never woven into the body copy.

---

## 7. Files

- `css/styles.css`: the full system, tokens first.
- `js/site.js`: world renderer (static trunks/roots canvas, animated canopy canvas, fixed particle canvas), menu, Survey, Rings, seedlings, weekly featured rung. The original chart, map, timeline, and quiz logic are kept.
- HTML: new fonts, pixel-tree mark, hamburger, footnotes, source anchors (`#src-1` … `#src-14`), and the Survey/Seedlings/Canopy labels.
