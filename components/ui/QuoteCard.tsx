"use client";

import { Pencil } from "lucide-react";
import { QuoteRecord } from "@/lib/types";
import { gradientForId, formatDate } from "@/lib/utils";

interface QuoteCardProps {
  quote: QuoteRecord;
  onClick: () => void;
  onEdit: () => void;
}

export default function QuoteCard({ quote, onClick, onEdit }: QuoteCardProps) {
  const gradient = gradientForId(quote.id);

  return (
    <div className="rounded-3xl bg-white flex items-center gap-4 px-4 py-4 active:scale-[0.985] transition-transform">
      {/* Thumbnail — tappable to open detail */}
      <button onClick={onClick} className="shrink-0">
        {quote.imageDataUrl ? (
          <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={quote.imageDataUrl}
              alt="Quote source"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ) : (
          <div className={`w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${gradient}`} />
        )}
      </button>

      {/* Text — tappable to open detail */}
      <button onClick={onClick} className="flex-1 min-w-0 text-left">
        <p className="text-neutral-900 text-[17px] font-medium leading-snug line-clamp-2 mb-2.5">
          &ldquo;{quote.text}&rdquo;
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-neutral-100 px-3.5 py-1 text-[13px] text-neutral-600 truncate max-w-[150px]">
            {quote.speaker}
          </span>
          <span className="rounded-full bg-neutral-100 px-3.5 py-1 text-[13px] text-neutral-500 shrink-0">
            {formatDate(quote.createdAt)}
          </span>
        </div>
      </button>

      {/* Edit button */}
      <button
        onClick={onEdit}
        aria-label="Edit quote"
        className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 active:bg-neutral-200 transition-colors"
      >
        <Pencil size={15} strokeWidth={1.8} className="text-neutral-500" />
      </button>
    </div>
  );
}
