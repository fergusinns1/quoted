"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useCaptureFlow } from "@/context/CaptureContext";
import { useAuth } from "@/context/AuthContext";
import { getAllQuotes } from "@/lib/quotesApi";
import { QuoteRecord } from "@/lib/types";
import {
  SortOrder,
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
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedPerson, setSelectedPerson] = useState("All");

  // Redirect to sign-in if not authenticated once auth has resolved
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
    () => sortQuotes(filterByPerson(quotes, selectedPerson), sortOrder),
    [quotes, selectedPerson, sortOrder]
  );

  const groups = useMemo(() => groupByMonth(displayed), [displayed]);

  const toggleSort = () =>
    setSortOrder((s) => (s === "newest" ? "oldest" : "newest"));

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-14 pb-3 shrink-0">
        <div>
          <h1 className="text-neutral-900 text-[32px] font-bold tracking-tight leading-tight">
            My Quotes
          </h1>
          {!loading && (
            <p className="text-neutral-400 text-[14px] mt-0.5">
              {quotes.length} {quotes.length === 1 ? "Quote" : "Quotes"}
            </p>
          )}
        </div>
        {/* Avatar — navigates to profile settings */}
        <Link
          href="/profile"
          aria-label="Profile settings"
          className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0 mt-1 active:opacity-70 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/HomeImage.png"
            alt="Profile"
            className="w-full h-full object-cover object-top"
          />
        </Link>
      </div>

      {/* Filter row */}
      {!loading && quotes.length > 0 && (
        <div className="flex items-center gap-2 px-5 pb-4 shrink-0 overflow-x-auto shell-scroll">
          {/* Sort toggle */}
          <button
            onClick={toggleSort}
            className="shrink-0 rounded-full px-4 py-2 text-[13px] border border-neutral-200 bg-white text-neutral-800 font-normal whitespace-nowrap"
          >
            Sort: <span className="font-bold">{sortOrder === "newest" ? "Newest" : "Oldest"}</span>
          </button>

          {/* Person label pill — tapping cycles through or resets */}
          <button
            onClick={() => setSelectedPerson("All")}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] border whitespace-nowrap font-medium
              ${selectedPerson === "All"
                ? "bg-white border-neutral-200 text-neutral-500"
                : "bg-white border-neutral-200 text-neutral-500"
              }`}
          >
            Person
          </button>

          {/* All pill */}
          <button
            onClick={() => setSelectedPerson("All")}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold whitespace-nowrap
              ${selectedPerson === "All"
                ? "bg-neutral-900 text-white"
                : "bg-white border border-neutral-200 text-neutral-600"
              }`}
          >
            All
          </button>

          {/* Individual person pills */}
          {people.map((person) => (
            <button
              key={person}
              onClick={() => setSelectedPerson(person)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold whitespace-nowrap
                ${selectedPerson === person
                  ? "bg-neutral-900 text-white"
                  : "bg-white border border-neutral-200 text-neutral-600"
                }`}
            >
              {person}
            </button>
          ))}
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto shell-scroll min-h-0 pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-600 animate-spin" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-24 px-10 text-center gap-4">
            <p className="text-neutral-700 font-semibold">Couldn&apos;t load quotes</p>
            <p className="text-neutral-400 text-sm">Check your connection and try again.</p>
            <button
              onClick={loadQuotes}
              className="rounded-full px-6 py-3 bg-neutral-900 text-white font-semibold text-sm active:scale-[0.97] transition-transform"
            >
              Retry
            </button>
          </div>
        ) : quotes.length === 0 ? (
          <EmptyState onAdd={openCapture} />
        ) : displayed.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-neutral-400 text-sm">No quotes match this filter.</p>
          </div>
        ) : (
          <div>
            {groups.map((group) => (
              <div key={group.label} className="mb-5">
                {/* Month label */}
                <p className="text-neutral-400 text-[14px] font-medium px-5 mb-3">
                  {group.label}
                </p>
                {/* Cards */}
                <div className="flex flex-col gap-2.5 px-5">
                  {group.quotes.map((q) => (
                    <QuoteCard key={q.id} quote={q} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom blur + FAB */}
      {quotes.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 40%, rgba(255,255,255,0) 100%)",
            }}
          />
        </div>
      )}

      {/* Floating + button */}
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

function EmptyState({ onAdd: _onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-10 text-center gap-5">
      <div>
        <p className="text-neutral-700 font-semibold mb-1">No quotes yet</p>
        <p className="text-neutral-400 text-sm leading-relaxed max-w-[200px]">
          Capture something worth remembering.
        </p>
      </div>
    </div>
  );
}
