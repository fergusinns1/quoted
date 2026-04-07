"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

interface Props {
  imageDataUrl: string | null;
  onSubmit: (text: string) => void;
  onBack: () => void;
}

export default function QuoteStep({ imageDataUrl: _imageDataUrl, onSubmit, onBack }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // iOS Safari scrolls the document natively when a text input is focused,
  // bypassing overflow:hidden on body/html. Reset it immediately on every scroll
  // event to keep fixed elements locked in place.
  useEffect(() => {
    const reset = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    window.addEventListener("scroll", reset);
    return () => window.removeEventListener("scroll", reset);
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-white">
      <div className="px-5 pt-14">

        {/* Back arrow */}
        <button
          onClick={onBack}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center mb-5"
        >
          <ArrowLeft size={16} strokeWidth={2} className="text-neutral-600" />
        </button>

        {/* Title */}
        <h1 className="text-neutral-900 text-[32px] font-bold tracking-tight leading-tight mb-6">
          What was said?
        </h1>

        {/* Input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
          }}
          placeholder="The quote goes here..."
          rows={5}
          className="w-full resize-none rounded-2xl bg-neutral-100 border-0 text-neutral-800 text-[16px] leading-relaxed placeholder-neutral-400 px-4 py-4 focus:outline-none"
        />

        {/* Continue — always in layout, opacity-only toggle, never moves */}
        <div
          className="mt-3"
          style={{
            opacity: hasText ? 1 : 0,
            pointerEvents: hasText ? "auto" : "none",
            transition: "opacity 0.18s ease-out",
          }}
        >
          <button
            onClick={handleSubmit}
            className="w-full rounded-full py-4 bg-neutral-900 text-white font-semibold text-[15px] active:scale-[0.98] transition-transform"
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  );
}
