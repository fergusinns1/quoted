"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Download,
  Check,
  Pencil,
  Trash2,
  BookOpen,
} from "lucide-react";
import { getQuoteById, updateQuote, deleteQuote } from "@/lib/quotesApi";
import { QuoteRecord } from "@/lib/types";
import {
  gradientForId,
  formatDate,
  shareQuoteCard,
  downloadQuoteCard,
} from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EditSheet from "@/components/ui/EditSheet";

type PageStatus = "loading" | "found" | "not-found";
type ShareFeedback = "idle" | "shared" | "copied";

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const showToast = useToast();
  const id = typeof params.id === "string" ? params.id : "";

  const [quote, setQuote] = useState<QuoteRecord | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [shareFeedback, setShareFeedback] = useState<ShareFeedback>("idle");
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) { setStatus("not-found"); return; }
    getQuoteById(id)
      .then((q) => {
        if (!q) setStatus("not-found");
        else { setQuote(q); setStatus("found"); }
      })
      .catch(() => setStatus("not-found"));
  }, [id]);

  const handleShare = async () => {
    if (!quote) return;
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

  const handleDownload = async () => {
    if (!quote) return;
    await downloadQuoteCard(quote);
    showToast("Saved to downloads");
  };

  const handleEditSave = useCallback(
    async (text: string, speaker: string) => {
      if (!quote) return;
      await updateQuote(quote.id, { text, speaker });
      const updated = { ...quote, text, speaker, updatedAt: Date.now() };
      setQuote(updated);
      setShowEdit(false);
      window.dispatchEvent(new Event("quotd:changed"));
      showToast("Changes saved");
    },
    [quote, showToast]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!quote) return;
    await deleteQuote(quote.id);
    window.dispatchEvent(new Event("quotd:changed"));
    showToast("Quote deleted", "info");
    router.push("/quotes");
  }, [quote, router, showToast]);

  if (status === "loading") {
    return (
      <div className="absolute inset-0 bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-neutral-200 dark:border-neutral-700 border-t-neutral-600 dark:border-t-neutral-300 animate-spin" />
      </div>
    );
  }

  if (status === "not-found" || !quote) {
    return (
      <div className="absolute inset-0 bg-white dark:bg-neutral-950 flex flex-col items-center justify-center px-10 text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <BookOpen size={24} className="text-neutral-400" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-neutral-700 dark:text-neutral-200 font-semibold mb-1">Quote not found</p>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm">This quote may have been deleted.</p>
        </div>
        <button
          onClick={() => router.push("/quotes")}
          className="rounded-full px-6 py-3 bg-neutral-900 text-white font-semibold text-sm active:scale-[0.97] transition-transform"
        >
          Back to quotes
        </button>
      </div>
    );
  }

  const gradient = gradientForId(quote.id);
  const hasImage = !!quote.imageDataUrl;

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Background */}
      {hasImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${quote.imageDataUrl})` }}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}

      {/* Vignette — heavy at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
        >
          <ArrowLeft size={18} strokeWidth={2} className="text-white" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEdit(true)}
            aria-label="Edit quote"
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
          >
            <Pencil size={15} className="text-white" />
          </button>

          <button
            onClick={handleShare}
            aria-label="Share quote"
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
          >
            {shareFeedback !== "idle" ? (
              <Check size={16} className="text-white" />
            ) : (
              <Share2 size={16} className="text-white" />
            )}
          </button>

          <button
            onClick={handleDownload}
            aria-label="Save quote card"
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
          >
            <Download size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* ── Quote card ────────────────────────────────────────────────────── */}
      <div className="relative z-10 mt-auto px-4 pb-10">
        <div className="rounded-3xl bg-black/45 backdrop-blur-xl px-5 py-5">
          <p className="text-white text-[20px] font-bold leading-snug mb-4">
            &ldquo;{quote.text}&rdquo;
          </p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-wrap gap-2">
              <span className="rounded-full px-4 py-1.5 bg-white text-neutral-800 text-[12px] font-semibold">
                {quote.speaker}
              </span>
              <span className="rounded-full px-4 py-1.5 bg-white text-neutral-600 text-[12px]">
                {formatDate(quote.createdAt)}
              </span>
              {quote.updatedAt && (
                <span className="text-white/30 text-[10px]">edited</span>
              )}
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete quote"
              className="w-8 h-8 rounded-full bg-white/15 border border-white/15 flex items-center justify-center shrink-0"
            >
              <Trash2 size={13} className="text-white/60" />
            </button>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditSheet
          initialText={quote.text}
          initialSpeaker={quote.speaker}
          onSave={handleEditSave}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete this quote?"
          message="This action cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
