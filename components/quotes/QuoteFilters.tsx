"use client";

import { SortOrder } from "@/lib/utils";

interface QuoteFiltersProps {
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  selectedPerson: string;
  onPersonChange: (person: string) => void;
  /** Unique speaker names derived from current quote set */
  people: string[];
}

export default function QuoteFilters({
  sortOrder,
  onSortChange,
  selectedPerson,
  onPersonChange,
  people,
}: QuoteFiltersProps) {
  return (
    <div className="flex flex-col gap-2.5 px-5 pb-4">
      {/* Sort row */}
      <div className="flex items-center gap-2">
        <span className="text-neutral-400 text-[11px] font-medium uppercase tracking-wider mr-1">
          Sort
        </span>
        {(["newest", "oldest"] as SortOrder[]).map((order) => (
          <button
            key={order}
            onClick={() => onSortChange(order)}
            className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors capitalize cursor-pointer
              ${
                sortOrder === order
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-500 border border-neutral-200"
              }
            `}
          >
            {order === "newest" ? "↓ Newest" : "↑ Oldest"}
          </button>
        ))}
      </div>

      {/* People row — only shown if there are names to filter by */}
      {people.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto shell-scroll pb-0.5">
          <span className="text-neutral-400 text-[11px] font-medium uppercase tracking-wider shrink-0 mr-1">
            Person
          </span>
          {["All", ...people].map((person) => (
            <button
              key={person}
              onClick={() => onPersonChange(person)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer
                ${
                  selectedPerson === person
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-500 border border-neutral-200"
                }
              `}
            >
              {person}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
