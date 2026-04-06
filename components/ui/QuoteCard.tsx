import Link from "next/link";
import { QuoteRecord } from "@/lib/types";
import { gradientForId, formatDate } from "@/lib/utils";

interface QuoteCardProps {
  quote: QuoteRecord;
}

export default function QuoteCard({ quote }: QuoteCardProps) {
  const gradient = gradientForId(quote.id);

  return (
    <Link href={`/quotes/${quote.id}`} className="block">
      <div className="rounded-2xl bg-white px-4 py-4 flex items-center gap-3.5 border border-neutral-100/80 active:scale-[0.985] transition-transform">
        {/* Text — left */}
        <div className="flex-1 min-w-0">
          <p className="text-neutral-900 text-[15px] font-semibold leading-snug line-clamp-2 mb-2.5">
            &ldquo;{quote.text}&rdquo;
          </p>
          {/* Speaker + date as individual pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-[12px] font-medium text-neutral-600 truncate max-w-[140px]">
              {quote.speaker}
            </span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-[12px] text-neutral-500 shrink-0">
              {formatDate(quote.createdAt)}
            </span>
          </div>
        </div>

        {/* Thumbnail or gradient swatch — right */}
        {quote.imageDataUrl ? (
          <div className="w-[60px] h-[60px] rounded-xl overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={quote.imageDataUrl}
              alt="Quote source"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-[60px] h-[60px] rounded-xl bg-gradient-to-br ${gradient} shrink-0`} />
        )}
      </div>
    </Link>
  );
}
