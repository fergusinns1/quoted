"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

interface Props {
  imageDataUrl: string | null;
  onSubmit: (text: string) => void;
  onBack: () => void;
  initialText?: string;
}

export default function QuoteStep({ imageDataUrl: _imageDataUrl, onSubmit, onBack, initialText = "" }: Props) {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // iOS Safari ignores overflow:hidden on body/html and scrolls the native layer
  // when an input is focused. Reset immediately so fixed elements never shift.
  useEffect(() => {
    const reset = () => { window.scrollTo(0, 0); };
    window.addEventListener("scroll", reset, { passive: true });
    return () => window.removeEventListener("scroll", reset);
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-white overflow-hidden touch-none">
      <div className="px-5 pt-14">

        <button
          onClick={onBack}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center mb-5"
        >
          <ArrowLeft size={16} strokeWidth={2} className="text-neutral-600" />
        </button>

        <h1 className="text-neutral-900 text-[32px] font-bold tracking-tight leading-tight mb-6">
          What was said?
        </h1>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
          }}
          placeholder="The quote goes here..."
          rows={3}
          className="w-full resize-none rounded-2xl bg-neutral-100 border-0 text-neutral-800 text-[16px] leading-relaxed placeholder-neutral-400 px-4 py-4 focus:outline-none touch-auto"
        />

        {/* Continue — always in layout, never moves.
            Greyed out until typing begins, then pops to black. */}
        <button
          onClick={handleSubmit}
          disabled={!hasText}
          className="w-full rounded-full py-4 mt-3 font-semibold text-[15px]"
          style={{
            backgroundColor: hasText ? "#171717" : "#e5e5e5",
            color: hasText ? "#ffffff" : "#a3a3a3",
            transform: hasText ? "scale(1)" : "scale(0.97)",
            transition: "background-color 0.2s ease, color 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          Continue
        </button>

      </div>
    </div>
  );
}
