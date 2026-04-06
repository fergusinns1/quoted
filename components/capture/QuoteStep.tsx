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

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      {/* Heading row */}
      <div className="flex items-center gap-4 px-5 pt-14 pb-2 shrink-0">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={16} strokeWidth={2} className="text-neutral-600" />
        </button>
        <h1 className="text-neutral-900 text-[28px] font-bold tracking-tight leading-tight">
          What was said?
        </h1>
      </div>

      {/* Spacer — pushes input toward bottom so keyboard lifts it naturally */}
      <div className="flex-1" />

      {/* Input + button — anchored near bottom */}
      <div className="px-5 pb-10 shrink-0 flex flex-col gap-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
          }}
          placeholder="The quote goes here..."
          rows={4}
          className="
            w-full resize-none rounded-2xl
            bg-neutral-100 border-0
            text-neutral-800 text-[16px] leading-relaxed
            placeholder-neutral-400 px-4 py-4
            focus:outline-none
          "
        />

        <button
          disabled={!text.trim()}
          onClick={handleSubmit}
          className="
            w-full rounded-full py-4
            bg-neutral-900 text-white font-semibold text-[15px]
            disabled:opacity-30 disabled:cursor-not-allowed
            active:scale-[0.98] transition-transform
          "
        >
          Continue
        </button>
      </div>
    </div>
  );
}
