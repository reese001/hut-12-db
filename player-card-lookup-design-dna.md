# Player Card Lookup Design DNA

## Overall Direction

A clean, modern sports database interface with a premium card-collector feel. The design should feel lighter, more readable, and more spacious than the original while keeping the core idea: browse many player cards quickly, select one, and view a detailed card preview.

## Design Goals

- Make the player list easier to scan.
- Reduce visual noise and heavy shadows.
- Use clearer hierarchy between the page title, filters, table, and selected card.
- Keep the collectible card as the visual centerpiece.
- Make the UI feel like a modern SaaS dashboard rather than an old database screen.

## Visual Style

### Mood

- Minimal
- Clean
- Premium
- Sporty but restrained
- Data-focused
- Light, airy, and readable

### Layout

Use a centered max-width layout with two main columns:

- Left column: search, filters, and player table.
- Right column: selected card preview and metadata.
- Header spans across the top.
- Right panel should feel like a dedicated preview area, not just an image floating beside the table.

Recommended desktop structure:

```text
Top nav
  Logo / app name                    card count badge

Main content
  Page title + subtitle

  Left: filters + player table       Right: card preview panel
```

## Spacing

Use generous spacing throughout.

- Page container: `max-width: 1280px`
- Outer padding: `24px` to `40px`
- Section gaps: `24px` to `40px`
- Card/panel padding: `24px` to `32px`
- Table row height: around `48px` to `56px`
- Input height: around `44px` to `48px`

Avoid cramped controls and dense rows.

## Color Palette

### Background

Use a very light neutral background.

```css
--page-bg: #F6F8FB;
--surface: #FFFFFF;
--surface-muted: #F9FAFC;
--border: #E3E8EF;
```

### Text

```css
--text-primary: #0F172A;
--text-secondary: #64748B;
--text-muted: #94A3B8;
```

### Accent

Use a cool blue or icy highlight for selected rows.

```css
--accent: #3B82F6;
--accent-soft: #EFF6FF;
--accent-border: #BFDBFE;
```

### Card Preview

The card itself can stay dark and dramatic, but the surrounding UI should stay light.

```css
--card-dark: #111827;
--card-dark-soft: #1F2937;
```

## Typography

Use a modern sans-serif font.

Recommended choices:

- Inter
- Geist
- Manrope
- Plus Jakarta Sans

### Type Scale

```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 24px;
--text-2xl: 32px;
--text-hero: 40px;
```

### Hierarchy

- App label: uppercase, small, letter-spaced.
- Page title: large, bold, high contrast.
- Subtitle: medium gray, regular weight.
- Table headers: uppercase, small, semibold, muted.
- Player names: semibold, dark.
- Player metadata: small, muted.
- Stats: bold, tabular numbers.

## Header

The top header should be simple and quiet.

Elements:

- Small shield/logo icon.
- Text label: `NHL 12 HUT DATABASE`
- Card count badge aligned right.

Style:

```css
.header {
  height: 64px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
}
```

The badge should be subtle:

```css
.card-count {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 8px 14px;
  background: #fff;
  font-weight: 700;
}
```

## Search and Filters

Use one wide search input followed by compact filter dropdowns.

### Search Input

- Rounded corners.
- Subtle border.
- Search icon on the left.
- Placeholder: `Search players...`
- Height: `46px`

### Filter Controls

- Same height as search.
- Same border radius.
- White background.
- Down-chevron icon.
- Keep filters aligned in one row on desktop.

Example filter row:

```text
[ Search players........................ ] [ Skaters ▾ ] [ All cards ▾ ]
```

## Table Design

The table is the main working area, so readability matters most.

### Container

```css
.table-panel {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}
```

### Header Row

- Light background.
- Uppercase labels.
- Small text.
- Slight letter spacing.
- Muted color.

### Player Rows

Each row should include:

- Optional small player avatar/headshot.
- Player name.
- Position and team.
- Overall rating.
- Individual stats.

Selected row:

```css
.selected-row {
  background: var(--accent-soft);
  box-shadow: inset 3px 0 0 var(--accent);
}
```

Hover row:

```css
.player-row:hover {
  background: #F8FAFC;
}
```

### Stat Columns

Use tabular numbers:

```css
font-variant-numeric: tabular-nums;
```

Overall rating should be visually stronger than secondary stats.

## Selected Card Preview Panel

The preview panel should feel premium and focused.

### Panel

```css
.preview-panel {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}
```

### Card Image

- Center the card.
- Keep it large enough to read.
- Use a soft shadow.
- Rounded corners.

```css
.card-preview {
  width: 320px;
  border-radius: 10px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
}
```

### Metadata Box

Place below the card preview.

Rows:

- Card Type: `Victory`
- Training Slots: `3`

Style:

```css
.meta-box {
  margin-top: 28px;
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
}
```

## Player Card Visual Direction

The actual card should remain bold and collectible.

### Card Traits

- Dark background.
- Subtle diagonal texture.
- Large overall rating.
- Player portrait at top.
- Name block in the middle.
- Stats in a clean bottom row.
- Avoid too many borders and heavy bevels.
- Use fewer competing text areas.

### Card Text Hierarchy

```text
94        S. CROSBY
          C • Playmaker

90 SKT    90 SHT    95 HND    83 CHK    83 DEF
```

Use a cleaner layout than the original card while preserving the NHL HUT card feel.

## Icons

Use simple outline icons.

Recommended icon style:

- Lucide-style line icons.
- Stroke width around `1.75px`.
- Small icons beside metadata labels.
- Do not overuse icons in the table.

## Border Radius

Use consistent soft radius.

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-pill: 999px;
```

## Shadows

Use soft, modern shadows only for panels and the preview card.

```css
--shadow-sm: 0 4px 12px rgba(15, 23, 42, 0.05);
--shadow-md: 0 12px 30px rgba(15, 23, 42, 0.06);
--shadow-lg: 0 18px 45px rgba(15, 23, 42, 0.08);
```

Avoid harsh black drop shadows.

## Responsive Behavior

### Desktop

- Two-column layout.
- Table on the left.
- Preview card on the right.
- Preview panel can be sticky while scrolling.

```css
.preview-panel {
  position: sticky;
  top: 88px;
}
```

### Tablet

- Keep two columns if space allows.
- Reduce card preview width.
- Hide less important stat columns if needed.

### Mobile

- Stack layout vertically.
- Search and filters stack.
- Player rows become compact cards.
- Preview panel appears above or below list depending on interaction.
- Consider opening card details in a drawer/modal on small screens.

## Interaction Details

### Selecting a Player

- Selected row gets soft blue highlight.
- Preview panel updates immediately.
- Keep the selected player visible.

### Searching

- Filter results live as the user types.
- Empty state should be friendly and simple.

Example empty state:

```text
No cards found
Try adjusting your search or filters.
```

### Sorting

- Allow sorting by overall rating and stats.
- Show a small arrow beside the active sorted column.
- Keep sort indicators subtle.

## Implementation Notes

### Recommended Stack

- Next.js or React
- Tailwind CSS
- CSS Grid for layout
- TanStack Table if sorting/filtering grows complex

### Suggested Tailwind Feel

```html
<div className="min-h-screen bg-slate-50 text-slate-950">
  <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
  <main className="mx-auto max-w-7xl px-6 py-10">
```

### Useful Classes

```text
rounded-2xl
border border-slate-200
bg-white
shadow-sm
text-slate-950
text-slate-500
font-semibold
tracking-wide
tabular-nums
```

## What To Avoid

- Do not make the table too dense.
- Do not overuse team colors in the app chrome.
- Do not use heavy gradients behind the whole page.
- Do not make every stat equally loud.
- Do not rely only on color to indicate selection.
- Do not place the card preview too close to the table.
- Do not use tiny font sizes for important values.

## One-Sentence Design Summary

A clean, light SaaS-style sports card database with a readable player table, subtle blue selection states, modern controls, and a premium dark collectible card preview as the main visual anchor.
