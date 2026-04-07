"use client";

import { useRef, useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { QuoteRecord } from "@/lib/types";
import { gradientForId, formatDate } from "@/lib/utils";

interface QuoteCardProps {
  quote: QuoteRecord;
  onClick: () => void;
  onEdit: () => void;
  // When another card opens its swipe, this card should close
  swipeOpenId: string | null;
  onSwipeOpen: (id: string | null) => void;
}

const SNAP_THRESHOLD = 48; // px past which we snap open
const EDIT_WIDTH = 72;     // width of the revealed edit zone

export default function QuoteCard({
  quote,
  onClick,
  onEdit,
  swipeOpenId,
  onSwipeOpen,
}: QuoteCardProps) {
  const gradient = gradientForId(quote.id);
  const isOpen = swipeOpenId === quote.id;

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  // Snap to open/closed when swipeOpenId changes externally
  useEffect(() => {
    if (!isOpen) setDragX(0);
  }, [isOpen]);

  const translateX = isOpen && !isDragging ? -EDIT_WIDTH : Math.max(-EDIT_WIDTH, Math.min(0, dragX));

  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isHorizontal.current = null;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    // Determine scroll axis on first meaningful move
    if (isHorizontal.current === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!isHorizontal.current) return;

    const base = isOpen ? -EDIT_WIDTH : 0;
    setDragX(Math.max(-EDIT_WIDTH, Math.min(0, base + dx)));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    if (!isHorizontal.current) return;

    const base = isOpen ? -EDIT_WIDTH : 0;
    const moved = dragX - base;

    if (!isOpen && moved < -SNAP_THRESHOLD) {
      onSwipeOpen(quote.id);
    } else if (isOpen && moved > SNAP_THRESHOLD / 2) {
      onSwipeOpen(null);
    } else {
      // Snap back to current state
      setDragX(isOpen ? -EDIT_WIDTH : 0);
    }
    isHorizontal.current = null;
  };

  const handleCardClick = () => {
    if (isOpen) {
      onSwipeOpen(null);
      return;
    }
    onClick();
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Edit button — sits behind the card, revealed on swipe */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-neutral-900"
        style={{ width: EDIT_WIDTH }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onSwipeOpen(null); onEdit(); }}
          aria-label="Edit quote"
          className="flex flex-col items-center gap-1 active:opacity-70 transition-opacity"
        >
          <Pencil size={18} strokeWidth={1.8} className="text-white" />
          <span className="text-white text-[10px] font-medium">Edit</span>
        </button>
      </div>

      {/* Card — slides left to reveal edit button */}
      <div
        className="relative bg-white"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
          borderRadius: 24,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleCardClick}
      >
        <div className="px-4 py-4 flex items-center gap-4">
          {/* Thumbnail */}
          {quote.imageDataUrl ? (
            <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={quote.imageDataUrl}
                alt="Quote source"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ) : (
            <div className={`w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${gradient} shrink-0`} />
          )}

          {/* Text */}
          <div className="flex-1 min-w-0">
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
          </div>
        </div>
      </div>
    </div>
  );
}
