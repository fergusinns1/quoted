import { QuoteRecord } from "./types";

// ─── Gradients ────────────────────────────────────────────────────────────────

export const GRADIENTS = [
  "from-rose-300 via-pink-200 to-orange-200",
  "from-amber-300 via-yellow-200 to-lime-200",
  "from-sky-300 via-blue-200 to-indigo-200",
  "from-violet-300 via-purple-200 to-pink-200",
  "from-teal-300 via-emerald-200 to-cyan-200",
];

/** Picks a consistent gradient for a given quote id. */
export function gradientForId(id: string): string {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

// ─── Dates ────────────────────────────────────────────────────────────────────

/** "28 Mar 2026" */
export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "March 2026" — used for month group headers */
export function formatMonthLabel(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

/** "Mar" */
export function formatShortMonth(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", { month: "short" });
}

// ─── Sort / Filter ────────────────────────────────────────────────────────────

export type SortOrder = "newest" | "oldest";

export function sortQuotes(
  quotes: QuoteRecord[],
  order: SortOrder
): QuoteRecord[] {
  return [...quotes].sort((a, b) =>
    order === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
  );
}

export function filterByPerson(
  quotes: QuoteRecord[],
  person: string
): QuoteRecord[] {
  if (!person || person === "All") return quotes;
  return quotes.filter((q) => q.speaker === person);
}

/** De-duped, alpha-sorted unique speaker names. */
export function getUniqueSpeakers(quotes: QuoteRecord[]): string[] {
  return [...new Set(quotes.map((q) => q.speaker).filter(Boolean))].sort();
}

/**
 * Ranks speakers by frequency (most quoted first), then recency as tiebreaker.
 * Used for the "Who said it?" suggestion chips.
 */
export function rankSpeakers(quotes: QuoteRecord[]): string[] {
  const map = new Map<string, { count: number; lastUsed: number }>();

  for (const q of quotes) {
    const name = q.speaker.trim();
    if (!name) continue;
    const entry = map.get(name);
    if (entry) {
      entry.count++;
      entry.lastUsed = Math.max(entry.lastUsed, q.createdAt);
    } else {
      map.set(name, { count: 1, lastUsed: q.createdAt });
    }
  }

  return [...map.entries()]
    .sort(([, a], [, b]) => b.count - a.count || b.lastUsed - a.lastUsed)
    .map(([name]) => name)
    .slice(0, 8);
}

// ─── Month grouping ───────────────────────────────────────────────────────────

export interface MonthGroup {
  label: string; // "March 2026"
  quotes: QuoteRecord[];
}

/**
 * Groups an already-sorted quote array into month buckets.
 * Preserves the input order within each group.
 */
export function groupByMonth(quotes: QuoteRecord[]): MonthGroup[] {
  const groups: Map<string, QuoteRecord[]> = new Map();

  for (const q of quotes) {
    const label = formatMonthLabel(q.createdAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(q);
  }

  return Array.from(groups.entries()).map(([label, qs]) => ({
    label,
    quotes: qs,
  }));
}

// ─── Quote card canvas renderer ───────────────────────────────────────────────

/**
 * Renders a composited quote card as a PNG Blob.
 * - Fixed portrait canvas (1080 × 1440)
 * - Image cover-cropped to fill (landscape sources become portrait)
 * - Large rounded corners clipped on the canvas
 * - Bottom gradient vignette
 * - Large bold white quote text
 * - Dark frosted pills with white text (speaker + date)
 */
// ─── Shared canvas text/pill renderer ────────────────────────────────────────

function renderTextAndPills(
  ctx: CanvasRenderingContext2D,
  quote: QuoteRecord,
  W: number,
  H: number
) {
  const pad         = 72;
  const quoteFontSz = 74;
  const pillFontSz  = 36;
  const pillH       = 58;
  const pillR       = pillH / 2;
  const lineH       = quoteFontSz * 1.28;
  const bottomPad   = 80;
  const pillGap     = 16;
  const textPillGap = 28;

  const font = (weight: number, size: number) =>
    `${weight} ${size}px -apple-system, "Helvetica Neue", Arial, sans-serif`;

  ctx.font = font(800, quoteFontSz);
  const quoteStr = `\u201C${quote.text}\u201D`;
  const maxTextW = W - pad * 2;
  const words = quoteStr.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (ctx.measureText(test).width > maxTextW && cur) {
      lines.push(cur); cur = w;
    } else { cur = test; }
  }
  if (cur) lines.push(cur);

  ctx.font = font(500, pillFontSz);
  const dateStr  = formatDate(quote.createdAt);
  const speakerW = ctx.measureText(quote.speaker).width + pillR * 2;
  const dateW    = ctx.measureText(dateStr).width + pillR * 2;

  const pillY = H - bottomPad - pillH;
  const textY = pillY - textPillGap - lines.length * lineH;

  ctx.font = font(800, quoteFontSz);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, pad, textY + i * lineH));

  const drawPill = (x: number, label: string, w: number) => {
    ctx.beginPath();
    ctx.moveTo(x + pillR, pillY);
    ctx.arcTo(x + w, pillY, x + w, pillY + pillH, pillR);
    ctx.arcTo(x + w, pillY + pillH, x, pillY + pillH, pillR);
    ctx.arcTo(x, pillY + pillH, x, pillY, pillR);
    ctx.arcTo(x, pillY, x + w, pillY, pillR);
    ctx.closePath();
    ctx.fillStyle = "rgba(28,28,28,0.62)";
    ctx.fill();
    ctx.font = font(500, pillFontSz);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + pillR, pillY + pillH / 2);
  };

  drawPill(pad, quote.speaker, speakerW);
  drawPill(pad + speakerW + pillGap, dateStr, dateW);
}

// Maps each GRADIENTS entry to [fromColor, toColor] for canvas rendering
const GRADIENT_CANVAS_COLORS: Record<string, [string, string]> = {
  "from-rose-300 via-pink-200 to-orange-200":    ["#fda4af", "#fed7aa"],
  "from-amber-300 via-yellow-200 to-lime-200":   ["#fcd34d", "#d9f99d"],
  "from-sky-300 via-blue-200 to-indigo-200":     ["#7dd3fc", "#c7d2fe"],
  "from-violet-300 via-purple-200 to-pink-200":  ["#c4b5fd", "#fbcfe8"],
  "from-teal-300 via-emerald-200 to-cyan-200":   ["#5eead4", "#a5f3fc"],
};

export async function renderQuoteCard(quote: QuoteRecord): Promise<Blob | null> {
  // Gradient-only quote — render a canvas with the matching gradient background
  if (!quote.imageDataUrl) {
    return new Promise((resolve) => {
      const W = 1080, H = 1440, cornerR = 80;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Rounded clip
      ctx.beginPath();
      ctx.moveTo(cornerR, 0);
      ctx.arcTo(W, 0, W, H, cornerR); ctx.arcTo(W, H, 0, H, cornerR);
      ctx.arcTo(0, H, 0, 0, cornerR); ctx.arcTo(0, 0, W, 0, cornerR);
      ctx.closePath(); ctx.clip();

      // Gradient background (bg-gradient-to-br)
      const gradKey = gradientForId(quote.id);
      const [fromColor, toColor] = GRADIENT_CANVAS_COLORS[gradKey] ?? ["#7dd3fc", "#c7d2fe"];
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, fromColor); bg.addColorStop(1, toColor);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Vignette
      const vig = ctx.createLinearGradient(0, 0, 0, H);
      vig.addColorStop(0, "rgba(0,0,0,0.35)"); vig.addColorStop(1, "rgba(0,0,0,0.50)");
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

      renderTextAndPills(ctx, quote, W, H);
      canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
    });
  }

  // Fetch the signed URL as a blob first, then load via objectURL.
  // objectURLs are same-origin so canvas.toBlob() won't be tainted.
  let objectUrl: string | null = null;
  try {
    const res = await fetch(quote.imageDataUrl!);
    const rawBlob = await res.blob();
    objectUrl = URL.createObjectURL(rawBlob);
  } catch {
    return null;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const W = 1080;
      const H = 1440;
      const cornerR = 80;

      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      ctx.beginPath();
      ctx.moveTo(cornerR, 0);
      ctx.arcTo(W, 0, W, H, cornerR);
      ctx.arcTo(W, H, 0, H, cornerR);
      ctx.arcTo(0, H, 0, 0, cornerR);
      ctx.arcTo(0, 0, W, 0, cornerR);
      ctx.closePath();
      ctx.clip();

      const imgAspect = img.width / img.height;
      const canvasAspect = W / H;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgAspect > canvasAspect) {
        sw = Math.round(img.height * canvasAspect);
        sx = Math.round((img.width - sw) / 2);
      } else {
        sh = Math.round(img.width / canvasAspect);
        sy = Math.round((img.height - sh) / 2);
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

      const grad = ctx.createLinearGradient(0, H * 0.38, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.5, "rgba(0,0,0,0.52)");
      grad.addColorStop(1, "rgba(0,0,0,0.80)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      renderTextAndPills(ctx, quote, W, H);

      URL.revokeObjectURL(objectUrl!);
      canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl!); resolve(null); };
    img.src = objectUrl!;
  });
}

// ─── Share ────────────────────────────────────────────────────────────────────

/**
 * Shares the rendered quote card image via Web Share API, or falls back to
 * copying the text. Returns 'shared' | 'copied' | 'cancelled'.
 */
export async function shareQuoteCard(
  quote: QuoteRecord
): Promise<"shared" | "copied" | "cancelled"> {
  const fallbackText = `\u201C${quote.text}\u201D \u2014 ${quote.speaker}`;
  const slug = quote.speaker.replace(/\s+/g, "-").toLowerCase();
  const filename = `quotd-${slug}.png`;

  // Always render the composed card (text + pills overlaid on image/gradient)
  const imageBlob = await renderQuoteCard(quote);

  if (imageBlob && typeof navigator !== "undefined" && "share" in navigator) {
    const file = new File([imageBlob], filename, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: `Quote by ${quote.speaker}`, files: [file] });
        return "shared";
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return "cancelled";
      }
    }
  }

  // Fallback: share or copy text
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share({ title: `Quote by ${quote.speaker}`, text: fallbackText });
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return "cancelled";
    }
  }

  try {
    await navigator.clipboard.writeText(fallbackText);
    return "copied";
  } catch {
    return "cancelled";
  }
}

// ─── Download (desktop fallback) ─────────────────────────────────────────────

/**
 * Downloads the rendered quote card as a PNG. Falls back to raw image if
 * canvas rendering fails.
 */
export async function downloadQuoteCard(quote: QuoteRecord): Promise<void> {
  const slug = quote.speaker.replace(/\s+/g, "-").toLowerCase();
  const filename = `quotd-${slug}-${quote.id.slice(0, 6)}.png`;

  const blob = await renderQuoteCard(quote);
  const url = blob
    ? URL.createObjectURL(blob)
    : quote.imageDataUrl ?? "";

  if (!url) return;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (blob) URL.revokeObjectURL(url);
}

// ─── Save to photos ───────────────────────────────────────────────────────────

/**
 * Saves the rendered quote card to the device camera roll / photo library.
 *
 * On iOS Safari / Android Chrome the Web Share API with a file triggers the
 * native share sheet — the user taps "Save Image" to add it to their camera
 * roll. This is the only reliable browser path to the camera roll without a
 * native app.
 *
 * On desktop (or when the Share API is unavailable) it falls back to a
 * standard file download.
 *
 * Returns 'saved' (share sheet opened), 'downloaded' (desktop fallback),
 * or 'failed'.
 */
export async function saveToPhotos(
  quote: QuoteRecord
): Promise<"saved" | "downloaded" | "failed"> {
  const slug = quote.speaker.replace(/\s+/g, "-").toLowerCase();
  const filename = `quotd-${slug}-${quote.id.slice(0, 6)}.png`;

  // Render the composed card (text + pills overlaid on image/gradient).
  // Falls back to raw image fetch if canvas render fails.
  let imageBlob: Blob | null = await renderQuoteCard(quote);
  if (!imageBlob && quote.imageDataUrl) {
    try {
      const res = await fetch(quote.imageDataUrl);
      imageBlob = await res.blob();
    } catch { /* ignore */ }
  }

  if (!imageBlob) return "failed";

  const file = new File([imageBlob], filename, { type: "image/png" });

  // Mobile: Web Share API opens native share sheet (user taps "Save Image")
  if (
    typeof navigator !== "undefined" &&
    "share" in navigator &&
    navigator.canShare?.({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file] });
      return "saved";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return "saved";
      // Other error: fall through to download
    }
  }

  // Desktop fallback: trigger a file download
  const url = URL.createObjectURL(imageBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return "downloaded";
}

// ─── Recap helpers ────────────────────────────────────────────────────────────

/** Returns quotes created during the current calendar month. */
export function quotesThisMonth(quotes: QuoteRecord[]): QuoteRecord[] {
  const now = new Date();
  return quotes.filter((q) => {
    const d = new Date(q.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

/** Returns [name, count][] sorted by count descending. */
export function speakerFrequency(
  quotes: QuoteRecord[]
): { speaker: string; count: number }[] {
  const map = new Map<string, number>();
  for (const q of quotes) {
    const s = q.speaker.trim();
    if (s) map.set(s, (map.get(s) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([speaker, count]) => ({ speaker, count }))
    .sort((a, b) => b.count - a.count);
}

/** Returns a random item from an array, or undefined if empty. */
export function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}
