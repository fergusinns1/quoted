"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { useCaptureFlow } from "@/context/CaptureContext";
import { useAuth } from "@/context/AuthContext";
import { getAllQuotes } from "@/lib/quotesApi";
import { QuoteRecord } from "@/lib/types";
import {
  sortQuotes,
  filterByPerson,
  getUniqueSpeakers,
  groupByMonth,
} from "@/lib/utils";
import QuoteCard from "@/components/ui/QuoteCard";

export default function QuotesPage() {
  const { openCapture } = useCaptureFlow();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);

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
    if (isFiltered) {
      // State 3 → State 2: re-open to change selection
      setFilterOpen(true);
    } else {
      setFilterOpen((o) => !o);
    }
  };

  const handleSelectPerson = (person: string) => {
    setSelectedPerson(person);
    setFilterOpen(false);
  };

  const handleClearFilter = () => {
    setSelectedPerson("All");
    setFilterOpen(false);
  };

  return (
    <div className="absolute inset-0 bg-white dark:bg-neutral-950 flex flex-col">

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
            src="/HomeImage.png"
            alt="Profile"
            className="w-full h-full object-cover object-top"
          />
        </Link>
      </div>

      {/* ── Filter row ── */}
      {!loading && quotes.length > 0 && (
        <div className="flex items-center gap-2 px-5 pt-3 pb-4 shrink-0 overflow-x-auto shell-scroll">

          {/* Filter pill — always visible */}
          <button
            onClick={handleFilterPress}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] border whitespace-nowrap transition-colors duration-150
              ${filterOpen
                ? "bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-900"
                : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
          >
            Filter
          </button>

          {/* State 2: person pills (filter open, none selected) */}
          {filterOpen && people.map((person) => (
            <button
              key={person}
              onClick={() => handleSelectPerson(person)}
              className="shrink-0 rounded-full px-4 py-1.5 text-[13px] border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 whitespace-nowrap transition-colors duration-150"
            >
              {person}
            </button>
          ))}

          {/* State 3: active filter pill with clear × */}
          {!filterOpen && isFiltered && (
            <button
              onClick={handleClearFilter}
              className="shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 whitespace-nowrap"
            >
              {selectedPerson}
              <X size={12} strokeWidth={2.5} className="text-neutral-400" />
            </button>
          )}
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto shell-scroll min-h-0 pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-600 animate-spin" />
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
          /* ── Grouped quote container ── */
          <div className="mx-4 bg-neutral-50 dark:bg-neutral-900 rounded-3xl overflow-hidden">
            {groups.map((group, groupIdx) => (
              <div key={group.label}>
                <p className={`text-neutral-400 dark:text-neutral-500 text-[13px] px-4 pb-2 ${groupIdx === 0 ? "pt-4" : "pt-5"}`}>
                  {group.label}
                </p>
                <div className="flex flex-col gap-[1.5px] px-2 pb-2">
                  {group.quotes.map((q) => (
                    <QuoteCard key={q.id} quote={q} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom fade ── */}
      {quotes.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
          <div
            className="absolute inset-0"
            id="quotes-fade"
            style={{
              background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 40%, rgba(255,255,255,0) 100%)",
            }}
          />
        </div>
      )}

      {/* ── FAB ── */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 flex justify-center pointer-events-none">
        <button
          onClick={openCapture}
          aria-label="Add new quote"
          className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center shadow-xl active:scale-95 transition-transform pointer-events-auto"
        >
          <Plus size={26} className="text-white" strokeWidth={2.2} />
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
