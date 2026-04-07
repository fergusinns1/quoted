"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { useCaptureFlow } from "@/context/CaptureContext";
import { useAuth } from "@/context/AuthContext";
import { getAllQuotes, updateQuote } from "@/lib/quotesApi";
import { QuoteRecord } from "@/lib/types";
import {
  sortQuotes,
  filterByPerson,
  getUniqueSpeakers,
  groupByMonth,
} from "@/lib/utils";
import QuoteCard from "@/components/ui/QuoteCard";
import QuoteDetailSheet from "@/components/ui/QuoteDetailSheet";
import QuoteStep from "@/components/capture/QuoteStep";
import PersonStep from "@/components/capture/PersonStep";

type EditStep = "quote" | "person";

export default function QuotesPage() {
  const { openCapture } = useCaptureFlow();
  const { user, loading: authLoading, avatarUrl } = useAuth();
  const router = useRouter();

  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRecord | null>(null);

  // Edit flow state
  const [editingQuote, setEditingQuote] = useState<QuoteRecord | null>(null);
  const [editStep, setEditStep] = useState<EditStep>("quote");
  const [editQuoteText, setEditQuoteText] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth/signin");
  }, [authLoading, user, router]);

  const loadQuotes = useCallback(() => {
    if (!user) return;
    setFetchError(false);
    getAllQuotes()
      .then((q) => setQuotes(q))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadQuotes();
    window.addEventListener("quotd:changed", loadQuotes);
    return () => window.removeEventListener("quotd:changed", loadQuotes);
  }, [loadQuotes]);

  useEffect(() => {
    const speakers = getUniqueSpeakers(quotes);
    if (selectedPerson !== "All" && !speakers.includes(selectedPerson)) {
      setSelectedPerson("All");
    }
  }, [quotes, selectedPerson]);

  const people = useMemo(() => getUniqueSpeakers(quotes), [quotes]);
  const displayed = useMemo(
    () => sortQuotes(filterByPerson(quotes, selectedPerson), "newest"),
    [quotes, selectedPerson]
  );
  const groups = useMemo(() => groupByMonth(displayed), [displayed]);
  const isFiltered = selectedPerson !== "All";

  const handleFilterPress = () => {
    if (isFiltered) setFilterOpen(true);
    else setFilterOpen((o) => !o);
  };

  const startEdit = (quote: QuoteRecord) => {
    setEditingQuote(quote);
    setEditQuoteText(quote.text);
    setEditStep("quote");
  };

  const handleEditQuoteSubmit = (text: string) => {
    setEditQuoteText(text);
    setEditStep("person");
  };

  const handleEditSave = async (speaker: string) => {
    if (!editingQuote) return;
    try {
      await updateQuote(editingQuote.id, { text: editQuoteText, speaker });
      const updated = { ...editingQuote, text: editQuoteText, speaker, updatedAt: Date.now() };
      setQuotes((prev) => prev.map((q) => q.id === updated.id ? updated : q));
      if (selectedQuote?.id === updated.id) setSelectedQuote(updated);
      window.dispatchEvent(new Event("quotd:changed"));
    } finally {
      setEditingQuote(null);
    }
  };

  const closeEdit = () => setEditingQuote(null);

  return (
    <div className="absolute inset-0 bg-neutral-50 dark:bg-neutral-950 flex flex-col">

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-5 pt-14 pb-1 shrink-0">
        <div>
          <h1 className="text-neutral-900 dark:text-white text-[32px] font-medium tracking-tight leading-tight">
            My Quotes
          </h1>
          {!loading && (
            <p className="text-neutral-400 dark:text-neutral-500 text-[14px] mt-0.5">
              {quotes.length} {quotes.length === 1 ? "Quote" : "Quotes"}
            </p>
          )}
        </div>

        <Link
          href="/profile"
          aria-label="Profile settings"
          className="w-9 h-9 rounded-full overflow-hidden bg-neutral-200 shrink-0 mt-1.5 active:opacity-70 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl ?? "/HomeImage.png"}
            alt="Profile"
            className="w-full h-full object-cover object-top"
          />
        </Link>
      </div>

      {/* ── Filter row ── */}
      {!loading && quotes.length > 0 && (
        <div className="flex items-center gap-2 px-5 pt-4 pb-4 shrink-0 overflow-x-auto shell-scroll">
          <button
            onClick={handleFilterPress}
            className="shrink-0 rounded-full px-4 py-1.5 text-[13px] border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 whitespace-nowrap"
          >
            Filter
          </button>

          {filterOpen && people.map((person) => (
            <button
              key={person}
              onClick={() => { setSelectedPerson(person); setFilterOpen(false); }}
              className="shrink-0 rounded-full px-4 py-1.5 text-[13px] border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 whitespace-nowrap"
            >
              {person}
            </button>
          ))}

          {!filterOpen && isFiltered && (
            <button
              onClick={() => { setSelectedPerson("All"); setFilterOpen(false); }}
              className="shrink-0 flex items-center gap-2 rounded-full pl-4 pr-3 py-1.5 text-[13px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 whitespace-nowrap"
            >
              {selectedPerson}
              <span className="w-4 h-4 rounded-full bg-white/20 dark:bg-black/15 flex items-center justify-center shrink-0">
                <X size={9} strokeWidth={2.5} className="text-white dark:text-neutral-900" />
              </span>
            </button>
          )}
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto shell-scroll min-h-0 pb-36">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-500 animate-spin" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-24 px-10 text-center gap-4">
            <p className="text-neutral-700 dark:text-neutral-200 font-medium">Couldn&apos;t load quotes</p>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">Check your connection and try again.</p>
            <button
              onClick={loadQuotes}
              className="rounded-full px-6 py-3 bg-neutral-900 text-white font-medium text-sm active:scale-[0.97] transition-transform"
            >
              Retry
            </button>
          </div>
        ) : quotes.length === 0 ? (
          <EmptyState />
        ) : displayed.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-neutral-400 text-sm">No quotes match this filter.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {groups.map((group, groupIdx) => (
              <div key={group.label} className={groupIdx > 0 ? "mt-6" : ""}>
                <p className="text-neutral-400 dark:text-neutral-500 text-[15px] px-5 pb-3">
                  {group.label}
                </p>
                <div className="flex flex-col gap-3 px-4">
                  {group.quotes.map((q) => (
                    <QuoteCard
                      key={q.id}
                      quote={q}
                      onClick={() => setSelectedQuote(q)}
                      onEdit={() => startEdit(q)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom fade ── */}
      {quotes.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none">
          <div className="absolute inset-0" id="quotes-fade" />
        </div>
      )}

      {/* ── Quote detail sheet ── */}
      {selectedQuote && (
        <QuoteDetailSheet
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onQuoteUpdated={(updated) => {
            setSelectedQuote(updated);
            setQuotes((prev) => prev.map((q) => q.id === updated.id ? updated : q));
          }}
        />
      )}

      {/* ── Edit flow overlay ── */}
      {editingQuote && (
        <div className="fixed inset-0 z-[60]">
          {editStep === "quote" && (
            <QuoteStep
              imageDataUrl={editingQuote.imageDataUrl}
              onSubmit={handleEditQuoteSubmit}
              onBack={closeEdit}
              initialText={editingQuote.text}
            />
          )}
          {editStep === "person" && (
            <PersonStep
              imageDataUrl={editingQuote.imageDataUrl}
              quoteText={editQuoteText}
              onSave={handleEditSave}
              onBack={() => setEditStep("quote")}
              initialSpeaker={editingQuote.speaker}
            />
          )}
        </div>
      )}

      {/* ── FAB ── */}
      <div className="absolute bottom-0 left-0 right-0 pb-9 flex justify-center pointer-events-none">
        <button
          onClick={openCapture}
          aria-label="Add new quote"
          className="w-20 h-20 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center shadow-xl active:scale-95 transition-transform pointer-events-auto"
        >
          <Plus size={30} className="text-white dark:text-neutral-900" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-10 text-center gap-5">
      <p className="text-neutral-700 font-medium mb-1">No quotes yet</p>
      <p className="text-neutral-400 text-sm leading-relaxed max-w-[200px]">
        Capture something worth remembering.
      </p>
    </div>
  );
}
