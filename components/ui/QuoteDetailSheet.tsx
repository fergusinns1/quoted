"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Pencil, Share2, ArrowDownToLine, Check } from "lucide-react";
import { QuoteRecord } from "@/lib/types";
import { gradientForId, formatDate, shareQuoteCard, saveToPhotos } from "@/lib/utils";
import { updateQuote } from "@/lib/quotesApi";
import { useToast } from "@/context/ToastContext";
import EditSheet from "@/components/ui/EditSheet";

interface Props {
  quote: QuoteRecord;
  onClose: () => void;
  onQuoteUpdated: (updated: QuoteRecord) => void;
}

type ShareFeedback = "idle" | "shared" | "copied";

// ─── Glassy action button ─────────────────────────────────────────────────────
function ActionButton({
  onClick,
  "aria-label": label,
  children,
}: {
  onClick: () => void;
  "aria-label": string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform"
      style={{
        background: "rgba(70,70,70,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {children}
    </button>
  );
}

// ─── Main sheet ───────────────────────────────────────────────────────────────
export default function QuoteDetailSheet({ quote: initialQuote, onClose, onQuoteUpdated }: Props) {
  const showToast = useToast();
  const sheetRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  // Local copy so edits reflect immediately inside the sheet
  const [quote, setQuote] = useState(initialQuote);

  // Entry animation
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Drag-to-dismiss state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  // Misc UI
  const [shareFeedback, setShareFeedback] = useState<ShareFeedback>("idle");
  const [showEdit, setShowEdit] = useState(false);

  const dismiss = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setEntered(false);
    setDragY(0);
    setTimeout(onClose, 380);
  }, [onClose]);

  // ── Drag handlers ────────────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartY.current = e.clientY;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setDragY(Math.max(0, e.clientY - dragStartY.current));
  };
  const handlePointerUp = () => {
    setIsDragging(false);
    const h = sheetRef.current?.offsetHeight ?? 600;
    if (dragY > h * 0.28) {
      dismiss();
    } else {
      setDragY(0);
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const result = await shareQuoteCard(quote);
    if (result === "copied") {
      setShareFeedback("copied");
      showToast("Copied to clipboard", "info");
      setTimeout(() => setShareFeedback("idle"), 2000);
    } else if (result === "shared") {
      setShareFeedback("shared");
      setTimeout(() => setShareFeedback("idle"), 2000);
    }
  };

  const handleSave = async () => {
    const result = await saveToPhotos(quote);
    if (result === "saved") showToast("Image saved to photos");
    else if (result === "downloaded") showToast("Saved to downloads");
    else showToast("Could not save image", "error");
  };

  const handleEditSave = async (text: string, speaker: string) => {
    await updateQuote(quote.id, { text, speaker });
    const updated = { ...quote, text, speaker, updatedAt: Date.now() };
    setQuote(updated);
    onQuoteUpdated(updated);
    setShowEdit(false);
    window.dispatchEvent(new Event("quotd:changed"));
    showToast("Changes saved");
  };

  const gradient = gradientForId(quote.id);
  const hasImage = !!quote.imageDataUrl;

  const sheetTranslate = entered ? `${dragY}px` : "100%";
  const sheetTransition = isDragging
    ? "none"
    : "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)";

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[48] bg-black/40"
        style={{
          opacity: entered ? 1 : 0,
          transition: "opacity 0.38s ease",
          pointerEvents: entered ? "auto" : "none",
        }}
        onClick={dismiss}
      />

      {/* ── Sheet ── note: transform creates a new stacking context, so any fixed
           children (EditSheet) MUST be rendered outside this div ── */}
      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-[48] overflow-hidden"
        style={{
          height: "88dvh",
          borderRadius: "44px 44px 0 0",
          transform: `translateY(${sheetTranslate})`,
          transition: sheetTransition,
          willChange: "transform",
        }}
      >
        {/* Background */}
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={quote.imageDataUrl!}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/35" />

        {/* ── Drag handle area ── */}
        <div
          className="relative z-10 flex justify-center pt-3 pb-4 cursor-grab active:cursor-grabbing touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="w-10 h-[4px] rounded-full bg-white/40" />
        </div>

        {/* ── Quote content ── */}
        <div className="relative z-10 px-8 pt-2">
          <p className="text-white text-[24px] font-semibold leading-snug mb-4">
            &ldquo;{quote.text}&rdquo;
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="rounded-full px-4 py-1.5 text-[13px] text-white font-medium"
              style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
            >
              {quote.speaker}
            </span>
            <span
              className="rounded-full px-4 py-1.5 text-[13px] text-white/90"
              style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
            >
              {formatDate(quote.createdAt)}
            </span>
          </div>
        </div>

        {/* ── Action buttons ── anchored to sheet bottom, stays above image */}
        <div className="absolute bottom-10 inset-x-0 z-10 flex justify-center gap-5">
          <ActionButton onClick={() => setShowEdit(true)} aria-label="Edit quote">
            <Pencil size={18} strokeWidth={1.8} className="text-white" />
          </ActionButton>
          <ActionButton onClick={handleShare} aria-label="Share quote">
            {shareFeedback !== "idle"
              ? <Check size={18} strokeWidth={2} className="text-white" />
              : <Share2 size={18} strokeWidth={1.8} className="text-white" />
            }
          </ActionButton>
          <ActionButton onClick={handleSave} aria-label="Save to photos">
            <ArrowDownToLine size={18} strokeWidth={1.8} className="text-white" />
          </ActionButton>
        </div>
      </div>

      {/* ── EditSheet: rendered OUTSIDE the transformed div so that its own
           `fixed` positioning resolves to the viewport, not the sheet ── */}
      {showEdit && (
        <EditSheet
          initialText={quote.text}
          initialSpeaker={quote.speaker}
          onSave={handleEditSave}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
