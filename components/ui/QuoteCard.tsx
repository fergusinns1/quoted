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
      <div className="rounded-3xl bg-white dark:bg-neutral-900 px-4 py-4 flex items-center gap-4 active:scale-[0.985] transition-transform">
        {/* Thumbnail — left */}
        {quote.imageDataUrl ? (
          <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={quote.imageDataUrl}
              alt="Quote source"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${gradient} shrink-0`} />
        )}

        {/* Text — right */}
        <div className="flex-1 min-w-0">
          <p className="text-neutral-900 dark:text-white text-[17px] font-medium leading-snug line-clamp-2 mb-2.5">
            &ldquo;{quote.text}&rdquo;
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3.5 py-1 text-[13px] text-neutral-600 dark:text-neutral-300 truncate max-w-[150px]">
              {quote.speaker}
            </span>
            <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3.5 py-1 text-[13px] text-neutral-500 dark:text-neutral-400 shrink-0">
              {formatDate(quote.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
