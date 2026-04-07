# AlgoArena Design System

## Philosophy

Brutalist noir editorial. High contrast, minimal decoration, single accent color. Every element earns its place. The aesthetic is sharp and technical — like a design agency's internal tool crossed with competitive esports.

---

## Color Palette

### Base

| Token | Value | Usage |
|---|---|---|
| `--black` | `#0a0a0a` | Page background, primary surface |
| `--grey-1` | `#141414` | Elevated surfaces (sidebar, editor header) |
| `--grey-2` | `#1a1a1a` | Active nav items, hover states |
| `--grey-3` | `#222` | Borders, dividers |
| `--grey-4` | `#2a2a2a` | Subtle borders, input underlines |

### Text

| Token | Value | Usage |
|---|---|---|
| `--text-primary` | `#f5f5f0` | Headings, active labels |
| `--text-secondary` | `#c8c8c0` | Body text, question titles |
| `--text-muted` | `#888` | Descriptions, secondary labels |
| `--text-dim` | `#666` | Placeholders, timestamps, meta |
| `--text-faint` | `#444` | Disabled states, very secondary info |

### Accent — Electric Lime

The single pop of color. Used sparingly and intentionally.

| Token | Value | Usage |
|---|---|---|
| `--accent` | `#e8ff47` | CTAs, active states, brand mark, highlights |
| `--accent-dark` | `#d4eb30` | Button hover |
| `--accent-dim` | `rgba(232,255,71,0.08)` | Accent backgrounds |
| `--accent-border` | `rgba(232,255,71,0.25)` | Accent-tinted borders |

### Semantic

| Token | Value | Usage |
|---|---|---|
| Easy | `#4ade80` | Easy difficulty, success states |
| Medium | `#facc15` | Medium difficulty, warnings |
| Hard | `#f87171` | Hard difficulty, errors, deductions |
| Info | `#60a5fa` | Submission badges |

---

## Typography

### Fonts

| Role | Family | Usage |
|---|---|---|
| Display | `Bebas Neue` | Left panel hero text (SIGN / IN) |
| Serif | `DM Serif Display` | Form headings ("Welcome back."), dashboard titles |
| Sans | `Inter` | All UI text, labels, body |
| Mono | `Share Tech Mono` | Code values, registration numbers, complexity, timestamps |

### Scale

| Name | Size | Weight | Usage |
|---|---|---|---|
| Hero | `clamp(72px, 9.5vw, 140px)` | 400 | Left panel display type |
| H1 | `clamp(36px, 5vw, 58px)` | 400 | Form titles (serif) |
| H2 | `22–26px` | 400 | Section headings (serif) |
| Body | `13–15px` | 300–400 | Descriptions, form text |
| Label | `10–11px` | 600 | Form labels, table headers (uppercase + letter-spacing) |
| Micro | `9–10px` | 600 | Badges, eyebrows, stat labels |
| Mono | `11–14px` | 400 | Code, complexity, reg numbers |

### Letter Spacing

- Display: `-1px` to `-2px`
- Labels: `1.5px` to `2.5px` (always uppercase)
- Eyebrows: `2.5px` to `3px`
- Body: `0.2px` to `0.3px`

---

## Spacing

Base unit: `4px`

| Scale | Value | Usage |
|---|---|---|
| xs | `4px` | Icon gaps, tight padding |
| sm | `8px` | Button padding, small gaps |
| md | `12–14px` | Component padding |
| lg | `20–24px` | Section padding |
| xl | `32–40px` | Page padding |
| 2xl | `48–52px` | Large section gaps |

---

## Layout

### Split Screen (Auth)

```
┌─────────────────┬──────────────────┐
│   Left Panel    │   Right Panel    │
│   (1.4fr)       │   (1fr)          │
│                 │                  │
│  Display type   │  TopBar          │
│  Canvas BG      │  Form            │
│  Ticker         │  BottomBar       │
└─────────────────┴──────────────────┘
```

- Grid: `1.4fr 1fr`
- Left panel hides at `≤ 900px`
- Right panel is full-width on mobile

### Dashboard

```
┌──────────┬────────────────────────────┐
│ Sidebar  │  Main Content              │
│ (220px)  │                            │
│          │  QuestionList / Editor     │
│          │                            │
│          ├────────────────────────────┤
│          │  DeductionsPanel (optional)│
└──────────┴────────────────────────────┘
```

- Sidebar collapses to `52px` (icon-only mode)
- Transition: `width 0.22s cubic-bezier(0.4,0,0.2,1)`

### Editor Split

```
┌──────────────────┬─────────────────────┐
│  Problem Panel   │  Monaco Editor      │
│  (400px fixed)   │  (flex: 1)          │
│                  │                     │
│  Description     │  Editor Header      │
│  Examples        │  Code               │
│  Constraints     │  Stdin Panel        │
│  Hints           │  Submit Bar         │
│                  │  Result Panel       │
└──────────────────┴─────────────────────┘
```

- Stacks vertically at `≤ 900px`

---

## Components

### Buttons

#### Primary (CTA)
- Background: `#e8ff47`
- Text: `#0a0a0a`, 600 weight
- No border radius (sharp corners)
- Hover: `#d4eb30` + shine sweep animation
- Active: `scale(0.98)`
- Full-width in forms, flex row with arrow icon

#### Ghost / Text Button
- Background: transparent
- Border: `1px solid #2a2a2a`
- Text: `#666–#777`
- Hover: text lifts to `#e8ff47`, border tints lime

#### Destructive
- Text: `#f87171`
- Hover: color intensifies

### Inputs

All inputs use the **underline pattern** — no full border, just a bottom line.

- Background: transparent
- Bottom line: `1px solid #2a2a2a` at rest
- Focus: line sweeps in as `linear-gradient(90deg, #e8ff47, #c8df20)` via `scaleX` transform
- Label: uppercase, `10–11px`, `1.5px` letter-spacing, lifts to lime on focus
- Caret: `#e8ff47`
- Placeholder: `#333–#444`

### Cards / Rows

Question list rows use a **left accent bar** pattern:

```css
.row::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 2px;
  background: transparent → #e8ff4740 on hover;
}
```

### Badges / Tags

- Difficulty: colored text + matching `rgba` background, no border
- Topic: `#888` text, `#111` background, `1px solid #1e1e1e` border
- Points: `#e8ff47`, monospace, `⬡` prefix
- Cache: lime text, lime-tinted border

### Section Labels

```css
.section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
}
/* trailing rule */
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #141414;
}
```

### Toasts

Full-width banners that drop from the top of the screen.

- `error` kind: `#1a0000` background, `#f87171` left border (4px), red flash animation on entry
- `warning` kind: `#1a1400` background, `#facc15` left border
- `info` kind: `#0f110a` background, `#e8ff47` left border
- Draining progress bar at top (6s auto-dismiss)
- Title: bold, colored per kind
- Message: `white-space: pre-line` for multi-line support

### Modal

```
backdrop: rgba(0,0,0,0.75) + blur(4px)
modal: #0f0f0f, 1px solid #222, max-width 600px
animation: fade + translateY(12px) → 0
```

---

## Animations

| Name | Duration | Easing | Usage |
|---|---|---|---|
| Form slide in/out | `420ms` | `cubic-bezier(0.4,0,0.2,1)` | Login ↔ Signup transition |
| Sidebar collapse | `220ms` | `cubic-bezier(0.4,0,0.2,1)` | Sidebar width |
| Underline sweep | `300ms` | `cubic-bezier(0.4,0,0.2,1)` | Input focus |
| Toast drop | `250ms` | `cubic-bezier(0.4,0,0.2,1)` | Toast entry |
| Button shine | `280ms` | `ease` | CTA hover |
| Pulse | `2.5s` | `ease-in-out` | Eyebrow dot, status LED |
| Spinner | `0.7s` | `linear` | Loading states |
| Canvas scan line | continuous | `linear` | Left panel background |

---

## Left Panel Background

The animated canvas background uses five layered effects:

1. **Base gradient** — `#1a1a1a` → `#0a0a0a` diagonal
2. **Diagonal crosshatch grid** — two sets of lines at 45°, `rgba(255,255,255,0.025)`
3. **Drifting lime spotlight** — radial gradient that oscillates via `sin/cos`, `rgba(232,255,71,0.06)`
4. **Floating accent squares** — 28–40 tiny rotating squares drifting upward
5. **Horizontal scan line** — a faint lime streak sweeping top to bottom

---

## Security Visual Feedback

When a violation is detected (paste, tab switch, fullscreen exit, burst injection):

- Full-width red toast drops from top
- Title: uppercase, bold, `#f87171`
- Body: two-line message with violation count and penalty points
- Red background flash animation on entry (`box-shadow` inset)
- Window blur: `filter: blur(8px)` applied to `.sec-shell` when window loses focus

---

## Coming Soon Page

- Same canvas background as left panel
- Large serif headline with italic lime accent
- Live countdown timer (Days / Hours / Minutes / Seconds)
- Seconds column glows lime
- Separator `:` is a flat flex sibling — not nested inside unit columns
- Draining progress bar on each countdown unit
- Transitions to "Arena is live" green badge when countdown reaches zero

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `> 900px` | Full split layout, sidebar expanded |
| `≤ 900px` | Left panel hidden (auth), sidebar icon-only (dashboard), editor stacks vertically |
| `≤ 768px` | Sidebar always icon-only |
| `≤ 600px` | Coming soon page tightens spacing |
| `≤ 480px` | Form padding reduces, bottom bar stacks |
| `≤ 380px` | Countdown units tighten further |

---

## Iconography

All icons are inline SVGs — no icon library dependency.

- Stroke width: `2px` standard, `2.5px` for navigation/back arrows
- `strokeLinecap: round`
- Size: `12–15px` for UI icons, `20px` for state icons
- Color: inherits from parent via `currentColor`

---

## Scrollbars

```css
scrollbar-width: thin;
scrollbar-color: #1e1e1e transparent;

::-webkit-scrollbar { width: 3–4px; }
::-webkit-scrollbar-thumb { background: #1e1e1e–#2a2a2a; }
```

---

## Do / Don't

| Do | Don't |
|---|---|
| Use lime accent for one focal point per view | Use lime on multiple competing elements |
| Keep borders at `#1a1a1a–#222` | Use white or bright borders |
| Use uppercase + letter-spacing for labels | Use sentence case for labels |
| Keep button text short and action-oriented | Use passive language ("Click here") |
| Use `DM Serif Display` italic for emotional moments | Use serif for body text |
| Fade/dim disabled states to `opacity: 0.4` | Hide disabled elements entirely |
| Show violation toasts full-width from top | Use small corner toasts for security events |
