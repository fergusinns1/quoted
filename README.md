# Quotd

A mobile-first quote capture app. Built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4.

---

## Running the app

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser. The app renders as a fixed iPhone-sized shell centered on a dark desktop canvas.

---

## Project structure

```
app/
  layout.tsx           Root HTML layout (no shell here — shell lives per-page)
  page.tsx             / → Home / "Quote it" landing screen
  globals.css          Global resets + Tailwind import
  quotes/
    page.tsx           /quotes → Events list page with filter pills + cards
  shared/
    page.tsx           /shared → Placeholder page

components/
  shell/
    MobileShell.tsx    The phone frame wrapper — centers a 390×844px shell on desktop
  nav/
    BottomNav.tsx      Frosted-glass bottom tab bar (New / Quotes / Shared)
  ui/
    PillButton.tsx     Reusable rounded pill button (primary / secondary / ghost)
    Card.tsx           Reusable card with optional glass variant
    FloatingButton.tsx Circular icon button with glass treatment
    PageContainer.tsx  Fills the shell, handles scroll, clears nav padding
    QuoteCard.tsx      Individual quote card component

lib/
  data.ts              Local placeholder quote data + types
```

---

## Mobile shell

`components/shell/MobileShell.tsx` is the core of the desktop-preview layout.

- Fixed `390 × 844` px (iPhone 14 logical resolution)
- `rounded-[44px]` + `overflow-hidden` to clip page content cleanly
- `shadow-[0_40px_80px_rgba(0,0,0,0.7)]` for depth against the dark canvas
- A `ring-1 ring-white/10` bezel overlay sits above all content as a subtle frame
- Every page wraps its content in `<MobileShell>` and uses `absolute inset-0` positioning inside it

---

## Design system

| Component | Purpose |
|---|---|
| `PillButton` | `variant="primary"` (white fill), `"secondary"` (glass), `"ghost"` |
| `Card` | Default white card or `glass` prop for frosted treatment |
| `FloatingButton` | Icon-only circular button, configurable size |
| `PageContainer` | `scrollable` prop enables touch-style scroll inside the shell |
| `QuoteCard` | Composed from raw data, colour strip derived from gradient string |

---

## Next steps

- Camera flow / OCR integration
- Auth (Clerk or Supabase)
- Real database for quotes
- Share flow
- Quote detail / edit screens
